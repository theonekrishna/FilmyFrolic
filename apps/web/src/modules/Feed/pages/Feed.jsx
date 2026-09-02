import { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Loader2, TrendingUp, Flame, MessageSquare, X, Search } from "lucide-react";

import PostCard from "../components/PostCard";
import AuthPromptModal from "../components/Authpromptmodal";

// ── Lazy-load heavy modals — only downloaded when opened (~50 KB total) ────────
const CommentModal = lazy(() => import("../components/CommentModal"));
const CreatePostModal = lazy(() => import("../components/CreatePostModal"));
const EditPostModal = lazy(() => import("../components/EditPostModal"));
import {
  getAllPosts,
  getPostById,
  deletePost,
  reactToPost,
  toggleSavePost,
  getSavedPosts,
  getComments,
  getMyProfile,
  getHotFeeds,
  getPopularFeeds,
  getMostCommentedFeeds,
} from "../services/feedService";
import { useToast } from "../../../shared/Toast";
import { useAuth } from "../../../context/AuthContext";
import TopBar from "../../../layout/TopBar";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function SocialFeed() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  // ── Ref to prevent spam-clicking a reaction while API is in flight ───────────
  const reactingPosts = useRef(new Set());
  const [reactingState, setReactingState] = useState({});

  const isLoggedIn = !!user && !!localStorage.getItem("accessToken");
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });

  function requireAuth(message) {
    if (!isLoggedIn) {
      setAuthPrompt({ open: true, message });
      return true; // blocked
    }
    return false; // allowed
  }

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const myProfile = currentUserProfile
    ? {
        id: currentUserProfile.id,
        display_name: currentUserProfile.display_name,
        username: currentUserProfile.username,
        avatar_url: currentUserProfile.avatar_url || null,
        avatar_color: currentUserProfile.avatar_color || null,
      }
    : null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [savedPostsData, setSavedPostsData] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [feedSubTab, setFeedSubTab] = useState("all");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [composingPost, setComposingPost] = useState(false);

  // Mobile sidebar drawer
  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);

  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  // Sidebar panels state
  const [hotFeeds, setHotFeeds] = useState([]);
  const [popularFeeds, setPopularFeeds] = useState([]);
  const [mostCommentedFeeds, setMostCommentedFeeds] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  const transformPost = (post) => {
    const p = post.profiles || {};
    const displayName = p.username || p.display_name || p.name || "Unknown User";
    const avatarUrl = p.avatar_url || null;
    let gradient = p.gradient;
    if (!gradient && p.avatar_color) {
      try {
        const colors = JSON.parse(p.avatar_color);
        if (Array.isArray(colors) && colors.length >= 2) {
          gradient = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
        }
      } catch {
        gradient = `linear-gradient(135deg, #6366F1, #e84545)`;
      }
    }
    if (!gradient) gradient = `linear-gradient(135deg, #6366F1, #e84545)`;
    const initials = displayName.slice(0, 2).toUpperCase();

    let attachedMovie = null;
    if (post.movie_tag && typeof post.movie_tag === "object") {
      attachedMovie = {
        title: post.movie_tag.title,
        year: post.movie_tag.year,
        rating: post.movie_tag.rating,
        genre: ["Movie"],
        image: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="140"><rect width="100" height="140" fill="#1a1a2e"/><text x="50" y="75" font-family="Arial" font-size="12" fill="#f5c518" text-anchor="middle">${post.movie_tag.title?.slice(0, 12) || "Movie"}</text></svg>`
        )}`,
      };
    }

    const reactionMap = { thumbs_up: "👍", heart: "❤️", fire: "🔥", wow: "😱" };
    const reactions = Object.entries(post.reaction_counts || {}).map(([key, count]) => ({
      emoji: reactionMap[key] || key,
      count: count || 0,
      reacted: !!post.reactions_data?.[key],
    }));

    return {
      id: post.id,
      user: displayName,
      username: p.username,
      initials,
      avatarUrl,
      gradient,
      community: "Filmy Frolic",
      timeAgo: formatTimeAgo(post.created_at),
      content: post.content,
      reactions:
        reactions.length > 0
          ? reactions
          : [
              { emoji: "👍", count: 0, reacted: false },
              { emoji: "❤️", count: 0, reacted: false },
              { emoji: "🔥", count: 0, reacted: false },
            ],
      comments:
        post.comment_count ??
        post.comments_count ??
        post._count?.comments ??
        post.feeds_comments?.length ??
        0,
      shares: 0,
      saved: false,
      isSpoiler: false,
      attachedMovie,
      userId: post.user_id,
      _raw: post,
    };
  };

  const fetchPosts = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      setError(null);
      const data = await getAllPosts();
      const postsData = Array.isArray(data) ? data : [];
      setPosts(postsData.map(transformPost));
      Promise.allSettled(
        postsData.map((p) =>
          getComments(p.id).then((res) => ({
            id: p.id,
            count: res?.totalCount ?? res?.comments?.length ?? res?.length ?? 0,
          }))
        )
      ).then((results) => {
        const countMap = {};
        results.forEach((r) => {
          if (r.status === "fulfilled") countMap[r.value.id] = r.value.count;
        });
        setPosts((prev) =>
          prev.map((p) => (countMap[p.id] !== undefined ? { ...p, comments: countMap[p.id] } : p))
        );
      });
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  }, []);

  const fetchMyProfile = async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getMyProfile();
      if (data) {
        setCurrentUserProfile({
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          bio: data.bio,
          website: data.website,
          avatar_url: data.avatar_url,
          avatar_color: data.avatar_color,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (err) {
      console.error("Failed to fetch my profile:", err);
    }
  };

  const fetchSidebarData = async () => {
    setSidebarLoading(true);
    try {
      const [hot, popular, commented] = await Promise.allSettled([
        getHotFeeds(),
        getPopularFeeds(),
        getMostCommentedFeeds(),
      ]);
      if (hot.status === "fulfilled")
        setHotFeeds(Array.isArray(hot.value) ? hot.value.slice(0, 5) : []);
      if (popular.status === "fulfilled")
        setPopularFeeds(Array.isArray(popular.value) ? popular.value.slice(0, 5) : []);
      if (commented.status === "fulfilled")
        setMostCommentedFeeds(Array.isArray(commented.value) ? commented.value.slice(0, 5) : []);
    } catch (err) {
      console.error("fetchSidebarData error:", err);
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchMyProfile();
    fetchSidebarData();
    if (isLoggedIn) fetchSavedPosts();
    const interval = setInterval(() => fetchPosts(true), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (feedSubTab === "saved") fetchSavedPosts();
  }, [feedSubTab]);

  // Filter posts by local feed search query
  const filteredPosts = useMemo(() => {
    const list = feedSubTab === "saved" ? savedPostsData : posts;
    if (!feedSearchQuery.trim()) return list;
    const q = feedSearchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.content?.toLowerCase().includes(q) ||
        p.user?.toLowerCase().includes(q) ||
        p.username?.toLowerCase().includes(q) ||
        p.attachedMovie?.title?.toLowerCase().includes(q)
    );
  }, [posts, savedPostsData, feedSubTab, feedSearchQuery]);

  const handleReact = useCallback(
    async (postId, emojiIdx) => {
      if (requireAuth("Sign in to react to posts! 🔥")) return;

      if (reactingPosts.current.has(postId)) return;
      reactingPosts.current.add(postId);
      setReactingState((prev) => ({ ...prev, [postId]: emojiIdx }));

      const post =
        posts.find((p) => p.id === postId) || savedPostsData.find((p) => p.id === postId);
      if (!post?.reactions?.[emojiIdx]) {
        reactingPosts.current.delete(postId);
        setReactingState((prev) => {
          const s = { ...prev };
          delete s[postId];
          return s;
        });
        return;
      }

      const emojiToKey = {
        "👍": "thumbs_up",
        "❤️": "heart",
        "🔥": "fire",
        "😱": "wow",
      };
      const reactionKey =
        emojiToKey[post.reactions[emojiIdx].emoji] || post.reactions[emojiIdx].emoji;

      try {
        await reactToPost(postId, reactionKey);
        const fresh = await getPostById(postId);
        const rawPost = fresh?.post || fresh;
        if (rawPost?.id) {
          const updated = transformPost(rawPost);
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...updated, saved: p.saved } : p))
          );
          setSavedPostsData((prev) =>
            prev.map((p) => (p.id === postId ? { ...updated, saved: p.saved } : p))
          );
        }
      } catch (err) {
        console.error("Failed to react:", err);
      } finally {
        reactingPosts.current.delete(postId);
        setReactingState((prev) => {
          const s = { ...prev };
          delete s[postId];
          return s;
        });
      }
    },
    [posts, savedPostsData, isLoggedIn]
  );

  const fetchSavedPosts = async () => {
    try {
      setSavedLoading(true);
      const data = await getSavedPosts();
      const savedData = Array.isArray(data) ? data : [];
      setSavedPostsData(savedData.map(transformPost));
      setSavedPosts(new Set(savedData.map((p) => p.id)));
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleSave = useCallback(
    async (postId) => {
      if (requireAuth("Sign in to save posts to your collection! 🔖")) return;

      setSavedPosts((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) next.delete(postId);
        else next.add(postId);
        return next;
      });
      try {
        await toggleSavePost(postId);
        fetchSavedPosts();
      } catch (err) {
        console.error("Failed to save post:", err);
        setSavedPosts((prev) => {
          const next = new Set(prev);
          if (next.has(postId)) next.delete(postId);
          else next.add(postId);
          return next;
        });
      }
    },
    [isLoggedIn]
  );

  const handleDelete = useCallback(
    async (postId) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSavedPostsData((prev) => prev.filter((p) => p.id !== postId));
      try {
        await deletePost(postId);
      } catch (err) {
        console.error("Failed to delete post:", err);
        fetchPosts();
        if (isLoggedIn) fetchSavedPosts();
      }
    },
    [fetchPosts, isLoggedIn]
  );

  const handleEdit = useCallback(
    (postId) => {
      const post =
        posts.find((p) => p.id === postId) || savedPostsData.find((p) => p.id === postId);
      if (!post) return;
      setPostToEdit(post);
      setEditModalOpen(true);
    },
    [posts, savedPostsData]
  );

  const handleShare = useCallback(async (postId) => {
    try {
      const frontendBase = window.location.origin.includes("localhost")
        ? window.location.origin
        : "https://filmy-frolic-new-frontend.onrender.com";
      const shareLink = `${frontendBase}/social/feed/post/${postId}`;
      await navigator.clipboard?.writeText(shareLink);
      toast.success("Link copied to clipboard", null, 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link", null, 3000);
    }
  }, []);

  const openCommentModal = useCallback(
    (postId) => {
      if (requireAuth("Sign in to join the conversation! 💬")) return;
      setCommentPostId(postId);
      setCommentModalOpen(true);
    },
    [isLoggedIn]
  );

  function handleViewProfile(username, userId) {}

  const handlePostCreated = (newPostData) => {
    const transformedPost = transformPost(newPostData);
    setPosts((prev) => [transformedPost, ...prev]);
    setComposingPost(false);
  };

  // Sidebar mini-card helper
  const SidebarPostCard = ({ post }) => {
    const totalReactions = Object.values(post?.reaction_counts || {}).reduce(
      (a, b) => a + (b || 0),
      0
    );
    const commentCount = post?.feeds_comments?.[0]?.count ?? post?.comment_count ?? 0;
    const profile = post?.profiles || {};
    let gradient = profile.gradient;
    if (!gradient && profile.avatar_color) {
      try {
        const colors = JSON.parse(profile.avatar_color);
        if (Array.isArray(colors) && colors.length >= 2) {
          gradient = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
        }
      } catch {
        /* ignore */
      }
    }
    if (!gradient) gradient = `linear-gradient(135deg, #3b82f6, #9333ea)`;

    return (
      <div
        onClick={() => {
          navigate(`/social/feed/post/${post.id}`);
          setSidebarDrawerOpen(false);
        }}
        className="flex items-start gap-2.5 py-2.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 transition-colors -mx-3 px-3 rounded-xl"
      >
        <div
          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden"
          style={{ background: gradient }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username || "user"}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            (profile.username || profile.display_name || profile.name || "?")
              .slice(0, 1)
              .toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-['Outfit'] text-[12px] text-[#f0f0f8]/80 line-clamp-2 leading-tight">
            {post?.content || "—"}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {totalReactions > 0 && (
              <span className="font-['Outfit'] text-[10px] text-[#f5c518]/70">
                ⚡ {totalReactions}
              </span>
            )}
            {commentCount > 0 && (
              <span className="font-['Outfit'] text-[10px] text-[#3b82f6]/70">
                💬 {commentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col gap-4">
      {/* 🔥 Hot Right Now */}
      <div className="bg-[#12121e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={15} className="text-[#f97316]" />
          <span className="font-['Outfit'] text-[12px] font-bold text-white uppercase tracking-wider">
            Hot Right Now
          </span>
        </div>
        {sidebarLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="text-[#3b82f6] animate-spin" />
          </div>
        ) : hotFeeds.length === 0 ? (
          <p className="font-['Outfit'] text-[11px] text-white/30 text-center py-3">
            No hot posts yet
          </p>
        ) : (
          hotFeeds.map((post, i) => <SidebarPostCard key={post?.id || i} post={post} />)
        )}
      </div>

      {/* ❤️ Most Popular */}
      <div className="bg-[#12121e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-[#e84545]" />
          <span className="font-['Outfit'] text-[12px] font-bold text-white uppercase tracking-wider">
            Most Popular
          </span>
        </div>
        {sidebarLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="text-[#3b82f6] animate-spin" />
          </div>
        ) : popularFeeds.length === 0 ? (
          <p className="font-['Outfit'] text-[11px] text-white/30 text-center py-3">
            No popular posts yet
          </p>
        ) : (
          popularFeeds.map((post, i) => <SidebarPostCard key={post?.id || i} post={post} />)
        )}
      </div>

      {/* 💬 Most Discussed */}
      <div className="bg-[#12121e] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} className="text-[#3b82f6]" />
          <span className="font-['Outfit'] text-[12px] font-bold text-white uppercase tracking-wider">
            Most Discussed
          </span>
        </div>
        {sidebarLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={18} className="text-[#3b82f6] animate-spin" />
          </div>
        ) : mostCommentedFeeds.length === 0 ? (
          <p className="font-['Outfit'] text-[11px] text-white/30 text-center py-3">No posts yet</p>
        ) : (
          mostCommentedFeeds.map((post, i) => <SidebarPostCard key={post?.id || i} post={post} />)
        )}
      </div>
    </div>
  );

  const FeedSkeleton = () => (
    <div className="flex flex-col gap-3 px-4 lg:px-0 pt-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#12121e] border border-white/5 rounded-2xl p-4 flex flex-col gap-3"
          style={{ animation: "ff-sb-pulse 1.4s infinite" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/8 flex-shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 rounded-md bg-white/8 w-1/3" />
              <div className="h-2.5 rounded-md bg-white/5 w-1/4" />
            </div>
          </div>
          <div className="h-3 rounded-md bg-white/8 w-full" />
          <div className="h-3 rounded-md bg-white/5 w-4/5" />
          <div className="h-3 rounded-md bg-white/5 w-2/3" />
        </div>
      ))}
      <style>{`
        @keyframes ff-sb-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
      `}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative">
      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />

      {/* ── TopBar (Single sticky global header) ── */}
      <TopBar title="Feed" subtitle="What's happening in the community" />

      {/* ── Feed Header Sub-Bar (Sub-tabs, Feed Filter & Compose) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-2.5 bg-[#080810]/95 backdrop-blur-xl border-b border-white/5 flex-shrink-0 sticky top-[56px] z-30">
        {/* Feed Sub-tabs */}
        <div className="flex items-center gap-1.5 bg-[#12121e] border border-white/10 rounded-xl p-1">
          {[
            { id: "all", label: "All Posts" },
            { id: "saved", label: `Saved (${savedPostsData.length})` },
          ].map((t) => {
            const isActive = feedSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFeedSubTab(t.id)}
                className={`px-4 py-1.5 rounded-lg font-['Outfit'] text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-[#f0f0f8]/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right actions: Trending drawer toggle (mobile) & Compose button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarDrawerOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-[#f97316]/10 border border-[#f97316]/30 flex items-center justify-center transition-colors hover:bg-[#f97316]/20 flex-shrink-0"
            title="Trending"
          >
            <Flame size={16} className="text-[#f97316]" />
          </button>

          {isLoggedIn && (
            <button
              onClick={() => setComposingPost(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-['Outfit'] text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>New Post</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-0 lg:gap-6 lg:px-6 lg:pt-4" style={{ minHeight: 0, flex: 1 }}>
        {/* LEFT: Main Feed */}
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        >
          {/* Create Post prompt */}
          {isLoggedIn && (
            <div
              onClick={() => setComposingPost(true)}
              className="flex items-center gap-3 p-3.5 px-4 bg-[#12121e] border-b border-white/5 lg:border lg:rounded-2xl lg:mb-4 cursor-pointer hover:bg-[#1a1a2e] transition-all shadow-md"
            >
              {myProfile?.avatar_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={myProfile.avatar_url}
                    alt={myProfile.username}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-['Outfit'] font-extrabold text-[13px] text-white flex-shrink-0"
                  style={{
                    background:
                      myProfile?.avatar_color || "linear-gradient(135deg, #f5c518, #e84545)",
                  }}
                >
                  {myProfile?.username?.slice(0, 2).toUpperCase() ||
                    myProfile?.display_name?.slice(0, 2).toUpperCase() ||
                    "?"}
                </div>
              )}
              <div className="flex-1 h-10 bg-white/5 border border-white/10 rounded-full flex items-center px-4 transition-colors hover:bg-white/10">
                <span className="font-['Outfit'] text-[13px] text-[#f0f0f8]/40 font-light">
                  What's on your cinematic mind,{" "}
                  <span className="font-semibold text-white/70">
                    {myProfile?.username || myProfile?.display_name || "friend"}
                  </span>
                  ?
                </span>
              </div>
            </div>
          )}

          {/* ── Feed loading skeleton ── */}
          {loading && <FeedSkeleton />}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-[#e84545] text-sm font-medium mb-3 text-center">{error}</p>
              <button
                onClick={fetchPosts}
                className="px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] rounded-full text-sm font-medium hover:bg-[#3b82f6]/20 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && feedSubTab === "all" && filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-[#f0f0f8]/50 text-sm text-center">
                {feedSearchQuery
                  ? `No posts matching "${feedSearchQuery}"`
                  : "No posts yet. Be the first to share!"}
              </p>
            </div>
          )}

          {feedSubTab === "saved" && savedLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-[#3b82f6] animate-spin" />
            </div>
          )}

          {!savedLoading && feedSubTab === "saved" && filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-[#f0f0f8]/50 text-sm text-center">No saved posts found.</p>
              <p className="text-[#f0f0f8]/30 text-xs text-center mt-1">
                Posts you save will appear here.
              </p>
            </div>
          )}

          {/* Posts list */}
          {!loading &&
            !error &&
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, saved: savedPosts.has(post.id) }}
                onReact={handleReact}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onShare={handleShare}
                onViewProfile={handleViewProfile}
                onComment={openCommentModal}
                isOwner={myProfile && post.userId === myProfile.id}
                currentUserId={myProfile?.id}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => requireAuth("Sign in to report content! 🚩")}
                loadingEmojiIdx={reactingState[post.id] ?? null}
              />
            ))}

          <div className="h-6" />
        </div>

        {/* RIGHT: Sidebar — desktop only */}
        <div
          className="hidden lg:block w-[320px] xl:w-[350px] flex-shrink-0 overflow-y-auto pb-6"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        >
          <SidebarContent />
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {sidebarDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-[#0d0d18] p-4 overflow-y-auto border-l border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Outfit'] font-bold text-white text-sm">Trending & Hot</span>
              <button
                onClick={() => setSidebarDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Lazy Loaded Modals ── */}
      <Suspense fallback={null}>
        {commentModalOpen && (
          <CommentModal
            isOpen={commentModalOpen}
            onClose={() => {
              setCommentModalOpen(false);
              setCommentPostId(null);
            }}
            postId={commentPostId}
            onCommentCountUpdate={handleCommentCountUpdate}
            myProfile={myProfile}
          />
        )}

        {composingPost && (
          <CreatePostModal
            isOpen={composingPost}
            onClose={() => setComposingPost(false)}
            myProfile={myProfile}
            onPostCreated={handlePostCreated}
          />
        )}

        {editModalOpen && postToEdit && (
          <EditPostModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setPostToEdit(null);
            }}
            post={postToEdit}
            onPostUpdated={handlePostUpdated}
          />
        )}
      </Suspense>
    </div>
  );
}

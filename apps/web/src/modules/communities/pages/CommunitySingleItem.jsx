import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  Info,
  Loader2,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TopBar from "../../../layout/TopBar";
import CommunityPostCard from "../components/CommunityPostCard";
import CommunityPostComposer from "../components/CommunityPostComposer";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { COMMUNITY_POSTS, MEDIA_IMAGES } from "../data/communities";
import {
  deleteCommunityPost,
  getCommunityEvents,
  getCommunityMembers,
  getCommunityPosts,
  getLocalJoinedMap,
  getTrendingTopics,
  persistLocalJoin,
  reactToCommunityPost,
  toggleCommunityMembership,
} from "../services/communityService";

// ─── Member normaliser ──────────────────────────────────────────────────
function normalizeMember(m) {
  const profile = m.profiles || m.profile || {};
  // API returns username correctly, name may be "Unknown" - prioritize username
  const username = m.username || profile.username || "Unknown";
  const role = m.role || "Member";
  const joinedAt = m.joined || m.joined_at || m.created_at || null;
  return {
    id: m.id || m.user_id,
    username,
    name: username, // keep for compatibility
    initials:
      m.initials || (username !== "Unknown" ? username.substring(0, 2).toUpperCase() : "??"),
    gradient: m.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
    role: typeof role === "string" ? role.charAt(0).toUpperCase() + role.slice(1) : "Member",
    joined: joinedAt
      ? typeof joinedAt === "string" && joinedAt.includes("T")
        ? new Date(joinedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : joinedAt
      : "Recently",
    avatarUrl: m.avatarUrl || m.avatar_url || profile.avatar_url || null,
  };
}

const EVENTS = [
  {
    id: 1,
    title: "Weekly Watch-along",
    date: "Friday, 8:00 PM",
    type: "Virtual",
    color: "#3b82f6",
    attending: 1240,
  },
  {
    id: 2,
    title: "Director Spotlight",
    date: "Sunday, 6:00 PM",
    type: "Live",
    color: "#e84545",
    attending: 856,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#3b82f6";

const CommunityTab = "posts" | "media" | "members" | "about" | "events";

export default function CommunitySingleItem() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  // Check if user is actually logged in (has valid token)
  const isLoggedIn = !!user && !!localStorage.getItem("accessToken");

  const [activeTab, setActiveTab] = useState("posts");
  // Initialize as false, will be set from cache in useEffect
  const [joined, setJoined] = useState(false);
  const [isLoadingMembership, setIsLoadingMembership] = useState(true);
  const [postReactions, setPostReactions] = useState({});
  const [spoilerRevealed, setSpoilerRevealed] = useState({});

  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [errorMembers, setErrorMembers] = useState(null);

  // Check if current user is an admin of this community
  const isAdmin = members.some(
    (m) => (m.id === user?.id || m.id === user?.id?.toString()) && m.role?.toLowerCase() === "admin"
  );

  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // Fetch membership status immediately on mount (ground truth)
  // Re-fetch whenever user changes (login/logout) to sync join state
  useEffect(() => {
    let timeoutId;
    async function verifyMembership() {
      // Don't end loading if we don't have user yet - wait for auth to initialize
      if (!id) {
        setIsLoadingMembership(false);
        return;
      }

      // First, load from cache immediately (no loading state)
      if (user?.id) {
        const cachedJoined = !!getLocalJoinedMap(user.id)[id];
        setJoined(cachedJoined);
      }

      if (!user?.id) {
        // User not loaded yet, keep loading state until auth initializes
        // Set a timeout to stop loading after 3 seconds (guest user or auth error)
        timeoutId = setTimeout(() => {
          setIsLoadingMembership(false);
          setJoined(false); // Guest users are not members
        }, 3000);
        return;
      }
      if (timeoutId) clearTimeout(timeoutId);

      try {
        // Verify with API (members list is source of truth)
        const data = await getCommunityMembers(id);
        const normalized = Array.isArray(data) ? data.map(normalizeMember) : [];
        const isUserMember = normalized.some(
          (m) => m.id === user.id || m.id === user.id?.toString()
        );
        setJoined(isUserMember);
      } catch (err) {
        console.error("[Membership] Error verifying membership:", err);
        // Keep cache value on error - don't change state
      } finally {
        setIsLoadingMembership(false);
      }
    }
    verifyMembership();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id, user?.id]);

  useEffect(() => {
    async function fetchPosts() {
      if (!id) return;
      setIsLoadingPosts(true);
      setErrorPosts(null);
      try {
        const rawPosts = await getCommunityPosts(id);

        let fetchedPosts = [];
        if (Array.isArray(rawPosts)) {
          fetchedPosts = rawPosts.map((rp) => ({
            id: rp.id,
            gradient: rp.gradient || "linear-gradient(135deg, #f5c518, #e84545)",
            initials: rp.initials || (rp.user ? rp.user.substring(0, 2).toUpperCase() : "FF"),
            user: rp.user || "Community Member",
            role: rp.role || null,
            timeAgo: rp.timeAgo || "Just now",
            content: rp.content || "",
            isSpoiler: !!rp.isSpoiler,
            reactions: rp.reactions || [],
            commentCount: rp.commentCount || 0,
            shareCount: rp.shareCount || 0,
            attachedMovie: rp.attachedMovie || null,
            images: rp.images || [],
            isOwner: rp.is_owner || rp.isOwner || false,
            created_by: rp.created_by || rp.createdBy || null,
            userAvatar: rp.avatar_url || rp.userAvatar || rp.user_avatar || rp.avatarUrl || null,
          }));
        }

        setPosts(fetchedPosts.length > 0 ? fetchedPosts : COMMUNITY_POSTS);

        // Initialize postReactions from API data (which reactions user already made)
        const initialReactions = {};
        fetchedPosts.forEach((post) => {
          const reactedIdxs = (post.reactions || [])
            .map((r, idx) => (r.reacted ? idx : -1))
            .filter((idx) => idx !== -1);
          if (reactedIdxs.length > 0) {
            initialReactions[post.id] = reactedIdxs;
          }
        });
        setPostReactions(initialReactions);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setErrorPosts(err.message || "Failed to load posts.");
        setPosts([]); // Fallback to initial if failed
      } finally {
        setIsLoadingPosts(false);
      }
    }

    if (activeTab === "posts") {
      fetchPosts();
    }
  }, [id, activeTab]);

  useEffect(() => {
    async function fetchMembers() {
      if (!id) return;
      setIsLoadingMembers(true);
      setErrorMembers(null);
      try {
        const data = await getCommunityMembers(id);
        const normalized = Array.isArray(data) ? data.map(normalizeMember) : [];
        setMembers(normalized);
      } catch (err) {
        console.error("Error fetching members:", err);
        setErrorMembers("Failed to load members.");
        setMembers([]); // Fallback
      } finally {
        setIsLoadingMembers(false);
      }
    }

    if (activeTab === "members") {
      fetchMembers();
    }
  }, [id, activeTab, user?.id]);

  useEffect(() => {
    async function fetchEvents() {
      if (!id) return;
      setIsLoadingEvents(true);
      setErrorEvents(null);
      try {
        const data = await getCommunityEvents(id);
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setErrorEvents("Failed to load events.");
        setEvents([]); // Fallback
      } finally {
        setIsLoadingEvents(false);
      }
    }

    if (activeTab === "events") {
      fetchEvents();
    }
  }, [id, activeTab]);

  useEffect(() => {
    async function fetchTrendingTopics() {
      if (!id) return;
      setIsLoadingTopics(true);
      try {
        const data = await getTrendingTopics(id);
        setTrendingTopics(data || []);
      } catch (err) {
        console.error("Error fetching trending topics:", err);
      } finally {
        setIsLoadingTopics(false);
      }
    }

    fetchTrendingTopics();
  }, [id]);

  async function handleDeletePost(postId) {
    try {
      await deleteCommunityPost(id, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post deleted", "info");
    } catch (err) {
      console.error("Error deleting post:", err);
      showToast(err.message || "Failed to delete post.", "error");
    }
  }

  async function toggleReaction(postId, emojiIdx, emoji) {
    const currentReactions = postReactions[postId] || [];
    const prevEmojiIdx = currentReactions.length > 0 ? currentReactions[0] : null;
    const isTogglingOff = prevEmojiIdx === emojiIdx;

    // Store previous state for rollback
    const previousState = currentReactions;

    // Optimistic update: toggle the reaction
    setPostReactions((prev) => ({
      ...prev,
      [postId]: isTogglingOff ? [] : [emojiIdx],
    }));

    try {
      // If toggling off (same emoji clicked again), just call API once to remove
      if (isTogglingOff) {
        await reactToCommunityPost(postId, emoji);
      } else {
        // If switching to different emoji, remove previous first, then add new
        if (prevEmojiIdx !== null) {
          const post = posts.find((p) => p.id === postId);
          const prevEmoji = post?.reactions?.[prevEmojiIdx]?.emoji;
          if (prevEmoji) {
            await reactToCommunityPost(postId, prevEmoji);
          }
        }
        // Add new reaction
        await reactToCommunityPost(postId, emoji);
      }
    } catch (err) {
      console.error("Error toggling reaction:", err);
      // Revert on failure
      setPostReactions((prev) => ({ ...prev, [postId]: previousState }));
      alert(err.message || "Failed to update reaction");
    }
  }

  async function handleToggleJoin() {
    const isDeparting = joined;
    // Optimistic update
    setJoined(!isDeparting);

    // Optimistically update the local members list
    if (activeTab === "members") {
      if (isDeparting) {
        // Leaving: remove current user from list immediately
        setMembers((prev) =>
          prev.filter((m) => m.id !== user?.id && m.id !== user?.id?.toString())
        );
      } else {
        // Joining: add current user to top of list
        setMembers((prev) => [
          {
            id: user?.id,
            name: user?.displayName || user?.username || "You",
            initials: user?.initials || "ME",
            gradient: user?.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
            role: "Member",
            joined: "Just now",
          },
          ...prev,
        ]);
      }
    }

    try {
      await toggleCommunityMembership(id, isDeparting);
      // Persist to cache on success
      persistLocalJoin(id, !isDeparting, user?.id);
    } catch (err) {
      console.error("Error toggling join status:", err);
      // Revert optimistic updates
      setJoined(isDeparting);
      // Re-fetch members to restore correct state
      if (activeTab === "members") {
        const data = await getCommunityMembers(id).catch(() => null);
        if (data) setMembers(Array.isArray(data) ? data.map(normalizeMember) : []);
      }
      alert(err.message || "Failed to update community status.");
    }
  }

  const TABS = [
    { value: "posts", label: "Posts", icon: MessageSquare },
    { value: "media", label: "Media", icon: ImageIcon },
    ...(joined ? [{ value: "members", label: "Members", icon: Users }] : []),
    { value: "about", label: "About", icon: Info },
    { value: "events", label: "Events", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#080810]">
      <TopBar />

      {/* Loading overlay while verifying membership */}
      {isLoadingMembership && (
        <div className="fixed inset-0 bg-[#080810] z-50 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[var(--accent)] rounded-full animate-spin mb-4" />
          <p className="text-white/60 font-[Outfit] text-sm">Loading community...</p>
        </div>
      )}

      {/* ── Community Header ── */}
      <div className="relative">
        {/* Back button overlaid on hero */}
        <div className="absolute top-3 left-4 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-[rgba(8,8,16,0.65)] backdrop-blur-md border border-white/20 rounded-full px-[14px] py-[7px] text-xs font-semibold text-[#f0f0f8] cursor-pointer"
          >
            <ArrowLeft size={13} /> Communities
          </button>
        </div>

        {/* Banner */}
        <div className="h-[240px] relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1769321790929-17a20c565ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
            alt="Sakura Collective banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080810]" />
        </div>

        {/* Community info overlay */}
        <div className="px-7 pb-6">
          <div className="flex items-end gap-5 -mt-8">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-[16px] flex-shrink-0 bg-gradient-to-br from-[#f5c518] to-[#e91e8c] flex items-center justify-center text-[32px] border-[3px] border-[#080810] shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative z-10">
              ⛩️
            </div>

            {/* Name + stats */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-[32px] tracking-[2px] text-[#f0f0f8] mb-[6px] leading-none font-[Bebas_Neue]">
                Sakura Collective
              </h1>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1 text-[13px] text-white/60">
                  <Users size={13} /> 84,200 members
                </span>

                <span className="flex items-center gap-1 text-[13px] text-white/40">
                  <MessageSquare size={13} /> 512 posts today
                </span>

                <span
                  className="rounded-full px-[11px] py-[3px] text-[11px] font-semibold border"
                  style={{
                    background: `${ACCENT}18`,
                    borderColor: `${ACCENT}40`,
                    color: ACCENT,
                  }}
                >
                  Anime · Action
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0 pb-1">
              <button
                onClick={handleToggleJoin}
                disabled={isLoadingMembership}
                className={`flex items-center gap-1.5 border rounded-[10px] px-5 py-[10px] text-[13px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${joined ? "bg-transparent text-[var(--accent)] border-[var(--accent)]" : "bg-[var(--accent)] text-white border-[var(--accent)]"}`}
              >
                {isLoadingMembership ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : joined ? (
                  "✓ Joined"
                ) : (
                  "Join Community"
                )}
              </button>

              <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-[10px] px-4 py-[10px] cursor-pointer hover:bg-white/10 transition">
                <Share2 size={14} className="text-white/60" />
                <span className="text-[13px] font-semibold text-white/60">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ── Tabs ── */}
      <div className="px-7 border-b border-white/10 sticky top-14 bg-[#080810] z-30">
        <div className="flex gap-0">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] transition-all mb-[-1px]
          ${
            activeTab === value
              ? "border-b-2 font-semibold text-[var(--accent)] border-[var(--accent)]"
              : "border-b-2 border-transparent font-normal text-white/45"
          }
        `}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* ── Tab Content ── */}
      <div className="flex gap-6 px-[28px] pt-[24px] pb-[64px] items-start">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* POSTS tab */}
          {activeTab === "posts" && (
            <div className="flex flex-col gap-[14px]">
              {/* Compose bar - Only show for logged-in members */}
              {isLoggedIn && joined && (
                <div
                  onClick={() => setShowComposer(true)}
                  className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] px-[18px] py-[14px] flex items-center gap-3 cursor-pointer transition-colors hover:border-[rgba(232,69,69,0.3)]"
                >
                  <div
                    className="w-[36px] h-[36px] rounded-full flex-shrink-0 bg-gradient-to-br from-[#f5c518] to-[#e84545] flex items-center justify-center font-[Outfit] font-extrabold text-[12px] text-[#080810]"
                    style={{ background: user?.gradient }}
                  >
                    {user?.initials || "JD"}
                  </div>

                  <div className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-full px-[16px] py-[10px] font-[Outfit] text-[13px] text-[rgba(240,240,248,0.3)]">
                    Share your thoughts with the community...
                  </div>
                </div>
              )}

              {/* Post cards */}
              {isLoadingPosts ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/50">
                  <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                  <span className="font-[Outfit] text-[14px]">Loading posts...</span>
                </div>
              ) : errorPosts ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="bg-red-500/10 text-red-500 font-[Outfit] text-[14px] px-4 py-3 rounded-[10px] border border-red-500/20">
                    {errorPosts}
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 text-white/50 font-[Outfit] text-[14px]">
                  No posts yet in this community. Be the first to share!
                </div>
              ) : (
                posts.map((post) => {
                  // Use API's is_owner/created_by fields (normalized to isOwner)
                  const isPostOwner = post.isOwner || post.created_by === user?.id;
                  return (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      reactedIdxs={postReactions[post.id] || []}
                      onReact={(idx, emoji) => toggleReaction(post.id, idx, emoji)}
                      isOwner={isPostOwner}
                      onDelete={isPostOwner ? handleDeletePost : null}
                      spoilerRevealed={!!spoilerRevealed[post.id]}
                      onRevealSpoiler={() =>
                        setSpoilerRevealed((prev) => ({
                          ...prev,
                          [post.id]: true,
                        }))
                      }
                    />
                  );
                })
              )}
            </div>
          )}

          {/* MEDIA tab */}
          {activeTab === "media" && (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {MEDIA_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[10px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.07)] transition-transform hover:scale-[1.02]"
                  >
                    <img src={src} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEMBERS tab */}
          {activeTab === "members" && (
            <div className="flex flex-col gap-[10px]">
              {isLoadingMembers ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                  <p className="font-[Outfit] text-xs">Loading members...</p>
                </div>
              ) : errorMembers ? (
                <div className="text-center py-10 text-[#e84545] font-[Outfit] text-sm">
                  {errorMembers}
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-10 text-white/30 font-[Outfit] text-sm">
                  No members found.
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id || member.name}
                    className="flex items-center gap-[14px] bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[12px] px-[18px] py-[14px] cursor-pointer transition-colors hover:border-[rgba(232,69,69,0.3)]"
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-[44px] h-[44px] rounded-full flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div
                        className="w-[44px] h-[44px] rounded-full flex-shrink-0 flex items-center justify-center font-[Outfit] font-extrabold text-[13px] text-[#080810]"
                        style={{
                          background:
                            member.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
                        }}
                      >
                        {member.initials ||
                          (member.name ? member.name.substring(0, 2).toUpperCase() : "FF")}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-[3px]">
                        <span className="font-[Outfit] text-[14px] font-semibold text-[#f0f0f8]">
                          {member.username || member.name || "Unknown"}
                        </span>

                        {member.role && (
                          <span
                            className="font-[Outfit] text-[10px] font-bold rounded-full px-[8px] py-[2px]"
                            style={{
                              color:
                                member.role === "Admin"
                                  ? "#f5c518"
                                  : member.role === "Moderator" || member.role === "Top Critic"
                                    ? "#e84545"
                                    : "rgba(240,240,248,0.4)",
                              background:
                                member.role === "Admin"
                                  ? "rgba(245,197,24,0.12)"
                                  : member.role === "Moderator" || member.role === "Top Critic"
                                    ? "rgba(232,69,69,0.12)"
                                    : "rgba(255,255,255,0.05)",
                              border: `1px solid ${
                                member.role === "Admin"
                                  ? "rgba(245,197,24,0.3)"
                                  : member.role === "Moderator" || member.role === "Top Critic"
                                    ? "rgba(232,69,69,0.3)"
                                    : "rgba(255,255,255,0.1)"
                              }`,
                            }}
                          >
                            {member.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.3)]">
                        Joined {member.joined || "Recently"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABOUT tab */}
          {activeTab === "about" && (
            <div className="max-w-[560px]">
              <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[24px] mb-[16px]">
                <h3 className="font-[Bebas_Neue] text-[20px] tracking-[1.5px] text-[#f0f0f8] mb-[14px]">
                  About Sakura Collective
                </h3>

                <p className="font-[Outfit] text-[14px] text-[rgba(240,240,248,0.55)] mb-[20px] leading-[1.65] font-light">
                  The definitive home for anime film fans on Filmy Frolic. Whether you're a veteran
                  cinephile who grew up on Miyazaki or a newcomer discovering the genre through
                  Sakura Protocol — this is your space.
                </p>

                {[
                  { label: "Founded", value: "January 2023" },
                  { label: "Members", value: "84,200" },
                  { label: "Posts this week", value: "3,241" },
                  { label: "Language", value: "English, Japanese, Korean" },
                  {
                    label: "Community type",
                    value: "Public — anyone can join",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between py-[10px] border-b border-[rgba(255,255,255,0.05)]"
                  >
                    <span className="font-[Outfit] text-[13px] text-[rgba(240,240,248,0.38)]">
                      {label}
                    </span>

                    <span className="font-[Outfit] text-[13px] font-semibold text-[#f0f0f8]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENTS tab */}
          {activeTab === "events" && (
            <div className="flex flex-col gap-[12px]">
              {isLoadingEvents ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                  <p className="font-[Outfit] text-xs">Loading events...</p>
                </div>
              ) : errorEvents ? (
                <div className="text-center py-10 text-[#e84545] font-[Outfit] text-sm">
                  {errorEvents}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-10 text-white/30 font-[Outfit] text-sm">
                  No upcoming events managed through this community.
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] px-[20px] py-[18px] flex items-center gap-[18px] cursor-pointer transition-colors"
                  >
                    <div
                      className="w-[48px] h-[48px] rounded-[12px] flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `${event.color || ACCENT}15`,
                        border: `1px solid ${event.color || ACCENT}30`,
                      }}
                    >
                      <Calendar size={20} color={event.color || ACCENT} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-[Outfit] text-[15px] font-semibold text-[#f0f0f8] mb-[4px]">
                        {event.title}
                      </div>

                      <div className="flex items-center gap-[10px]">
                        <span className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.4)]">
                          {event.date}
                        </span>

                        {event.type && (
                          <span
                            className="font-[Outfit] text-[10px] font-bold rounded-full px-[9px] py-[2px]"
                            style={{
                              color: event.color || ACCENT,
                              background: `${event.color || ACCENT}15`,
                              border: `1px solid ${event.color || ACCENT}30`,
                            }}
                          >
                            {event.type}
                          </span>
                        )}

                        <span className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.35)] flex items-center gap-[4px]">
                          <Users size={11} /> {(event.attending || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      className="rounded-[8px] px-[18px] py-[9px] font-[Outfit] text-[12px] font-bold text-white cursor-pointer flex-shrink-0"
                      style={{ background: event.color || ACCENT }}
                    >
                      Attend
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="ff-community-sidebar w-[252px] flex-shrink-0 flex flex-col gap-[14px]">
          {/* Community stats */}
          <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[18px]">
            <h4 className="font-[Bebas_Neue] text-[17px] tracking-[1.5px] text-[#f0f0f8] mb-[14px]">
              Community Stats
            </h4>

            {[
              { label: "Members", value: "84,200", color: ACCENT },
              { label: "Posts Today", value: "512", color: "#f5c518" },
              { label: "Online Now", value: "3,841", color: "#2ecc71" },
              { label: "Weekly Growth", value: "+2.4k", color: "#7c5cfc" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex justify-between items-center py-[9px] border-b border-[rgba(255,255,255,0.05)]"
              >
                <span className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.4)]">
                  {label}
                </span>

                <span className="font-[Bebas_Neue] text-[17px] tracking-[1px]" style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[18px]">
            <h4 className="font-[Bebas_Neue] text-[17px] tracking-[1.5px] text-[#f0f0f8] mb-[14px]">
              Trending Topics
            </h4>

            {isLoadingTopics ? (
              <div className="flex flex-col gap-2 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="text-[12px] text-white/30 font-[Outfit] italic py-2">
                No trending topics yet.
              </div>
            ) : (
              trendingTopics.map((tag, i) => (
                <div
                  key={tag.id || tag}
                  className={`flex items-center gap-[10px] py-[8px] cursor-pointer ${
                    i < trendingTopics.length - 1 ? "border-b border-[rgba(255,255,255,0.05)]" : ""
                  }`}
                >
                  <span className="font-[Bebas_Neue] text-[16px] w-[18px] text-center leading-none">
                    {i + 1}
                  </span>

                  <span className="font-[Outfit] text-[13px] font-medium text-[var(--accent)]">
                    {typeof tag === "string"
                      ? tag.startsWith("#")
                        ? tag
                        : `#${tag}`
                      : tag.name?.startsWith("#")
                        ? tag.name
                        : `#${tag.name}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showComposer && joined && (
        <CommunityPostComposer
          community={{ id, name: "this community" }} // We might need to fetch community name too, but for now this works
          onClose={() => setShowComposer(false)}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
            // Initialize reactions for new post (user hasn't reacted yet)
            setPostReactions((prev) => ({ ...prev, [newPost.id]: [] }));
            showToast("Post shared!", "success");
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { getPostById, reactToPost, toggleSavePost, deletePost } from "../services/feedService";

import { useToast } from "../../../shared/Toast";
import { useAuth } from "../../../context/AuthContext";

import PostCard from "../components/PostCard";
import CommentModal from "../components/CommentModal";
import EditPostModal from "../components/EditPostModal";
import AuthPromptModal from "../components/Authpromptmodal ";

const ACCENT = "#3b82f6";

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

function transformPost(post) {
  const p = post.profiles || {};

  const displayName =
    p.username || p.display_name || p.name || `User ${post.user_id?.slice(0, 4) || "Unknown"}`;

  const avatarUrl = p.avatar_url || null;

  let gradient = p.gradient;

  if (!gradient && p.avatar_color) {
    try {
      const colors = JSON.parse(p.avatar_color);

      if (Array.isArray(colors) && colors.length >= 2) {
        gradient = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
      }
    } catch {
      gradient = `linear-gradient(135deg, #3b82f6, #e84545)`;
    }
  }

  if (!gradient) {
    gradient = `linear-gradient(135deg, #3b82f6, #e84545)`;
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  let attachedMovie = null;

  if (post.movie_tag && typeof post.movie_tag === "object") {
    attachedMovie = {
      title: post.movie_tag.title,
      year: post.movie_tag.year,
      rating: post.movie_tag.rating,
      genre: ["Movie"],
      image: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="140">
          <rect width="100" height="140" fill="#1a1a2e"/>
          <text 
            x="50" 
            y="75" 
            font-family="Arial" 
            font-size="12" 
            fill="#f5c518" 
            text-anchor="middle"
          >
            ${post.movie_tag.title?.slice(0, 12) || "Movie"}
          </text>
        </svg>
      `)}`,
    };
  }

  const reactionMap = {
    thumbs_up: "👍",
    heart: "❤️",
    fire: "🔥",
    wow: "😱",
  };

  const reactions = Object.entries(post.reaction_counts || {}).map(([key, count]) => ({
    emoji: reactionMap[key] || key,
    count: count || 0,
    reacted: !!post.reactions_data?.[key],
  }));

  return {
    id: post.id,
    user: displayName,
    username: p.username,
    userId: post.user_id,
    initials,
    avatarUrl,
    gradient,
    community: post.community_name || "Filmy Frolic",
    timeAgo: formatTimeAgo(post.created_at),
    content: post.content,
    isSpoiler: post.is_spoiler || false,
    attachedMovie,

    reactions:
      reactions.length > 0
        ? reactions
        : [
            { emoji: "👍", count: 0, reacted: false },
            { emoji: "❤️", count: 0, reacted: false },
            { emoji: "🔥", count: 0, reacted: false },
          ],

    comments: post.comment_count ?? post.feeds_comments?.length ?? 0,

    saved: false,
    _raw: post,
  };
}

export default function SinglePostPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const toast = useToast();

  const { user } = useAuth();

  const [post, setPost] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Guard against spam-clicks and track which emoji is loading
  const isReacting = useRef(false);
  const [reactingEmojiIdx, setReactingEmojiIdx] = useState(null);

  const isLoggedIn = !!user;

  const myProfile = user
    ? {
        id: user.id,
        display_name: user.display_name || user.username,
        username: user.username,
        avatar_url: user.avatar_url || null,
        avatar_color: user.avatar_color || null,
      }
    : null;

  const isOwner = myProfile && post && post.userId === myProfile.id;

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
    setLoading(true);
    setError(null);

    try {
      const data = await getPostById(id);

      let postData = data?.post || data;

      if (Array.isArray(postData) && postData.length > 0) {
        postData = postData[0];
      }

      if (postData) {
        const transformed = transformPost(postData);
        setPost(transformed);
      } else {
        setError("Post not found");
      }
    } catch (err) {
      console.error("Failed to fetch post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReact(postId, emojiIdx) {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    if (!post || !post.reactions) return;

    // Prevent spam-clicks while request is in-flight
    if (isReacting.current) return;

    const reaction = post.reactions[emojiIdx];
    if (!reaction) return;

    const emojiToKey = {
      "👍": "thumbs_up",
      "❤️": "heart",
      "🔥": "fire",
      "😱": "wow",
    };

    const reactionKey = emojiToKey[reaction.emoji] || reaction.emoji;

    isReacting.current = true;
    setReactingEmojiIdx(emojiIdx);

    try {
      // 1. Call the API
      await reactToPost(postId, reactionKey);

      // 2. Fetch fresh server state (same pattern as Feed.jsx handleReact)
      const fresh = await getPostById(postId);
      const rawPost = fresh?.post || fresh;
      if (rawPost?.id) {
        const updated = transformPost(rawPost);
        setPost((prev) => ({ ...updated, saved: prev?.saved ?? false }));
      }
    } catch (err) {
      console.error("Failed to react:", err);
      // On error, reload to get consistent state
      fetchPost();
    } finally {
      isReacting.current = false;
      setReactingEmojiIdx(null);
    }
  }

  async function handleSave(postId) {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    const wasSaved = post.saved;

    setPost((prev) => ({
      ...prev,
      saved: !wasSaved,
    }));

    try {
      await toggleSavePost(postId);
    } catch (err) {
      console.error("Failed to save post:", err);

      setPost((prev) => ({
        ...prev,
        saved: wasSaved,
      }));
    }
  }

  async function handleDelete(postId) {
    try {
      await deletePost(postId);

      toast.success("Post deleted");

      navigate("/social/feed");
    } catch (err) {
      console.error("Failed to delete post:", err);

      toast.error("Failed to delete post");
    }
  }

  function handleEdit() {
    setEditModalOpen(true);
  }

  function handlePostUpdated(postId, newContent) {
    setPost((prev) => ({
      ...prev,
      content: newContent,
    }));

    toast.success("Post updated");
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/social/feed/post/${id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);

      toast.success("Link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  }

  function handleComment() {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }

    setCommentModalOpen(true);
  }

  function handleCommentCountUpdate(postId, newCount) {
    setPost((prev) => ({
      ...prev,
      comments: newCount,
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#3b82f6] animate-spin" />

          <span className="font-['Outfit'] text-[#f0f0f8]/50 tracking-widest text-sm">
            LOADING POST...
          </span>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4">
        <p className="text-[#e84545] text-sm font-medium mb-3 text-center">
          {error || "Post not found"}
        </p>

        <button
          onClick={() => navigate("/social/feed")}
          className="px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] rounded-full text-sm font-medium hover:bg-[#3b82f6]/20 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#080810]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/social/feed")}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#f0f0f8]/70" />
          </button>

          <h1 className="font-['Bebas_Neue'] text-[22px] tracking-[1.5px] text-[#f0f0f8]">Post</h1>
        </div>
      </div>

      {/* Post */}
      <div className="pb-20">
        <PostCard
          post={post}
          onReact={handleReact}
          onSave={handleSave}
          onDelete={isOwner ? handleDelete : null}
          onEdit={isOwner ? handleEdit : null}
          onShare={handleShare}
          onViewProfile={() => {}}
          onComment={handleComment}
          isOwner={isOwner}
          currentUserId={myProfile?.id}
          loadingEmojiIdx={reactingEmojiIdx}
        />
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        postId={id}
        isLoggedIn={isLoggedIn}
        myProfile={myProfile}
        onCountUpdate={handleCommentCountUpdate}
      />

      {/* Edit Modal */}
      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        post={post}
        onPostUpdated={handlePostUpdated}
      />

      {/* Auth Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        message="Sign in to like posts, comment, save content, and join the conversation with the community."
      />
    </div>
  );
}

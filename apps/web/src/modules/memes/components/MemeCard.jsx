import {
  Bookmark,
  ChevronUp,
  Flame,
  Loader2,
  MessageSquare,
  Send,
  Share2,
  Trash2,
  Reply,
  MoreHorizontal,
  X,
  Pencil,
  LogIn,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TAG_REACTIONS } from "../data/memes";
import { memeService } from "../services/memeService";
import { ReportButton } from "../../Reports";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#7c5cfc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ─── 3-dot dropdown menu for comment owner ────────────────────────────────────
function CommentMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-6 h-6 rounded-full flex items-center justify-center text-[#f0f0f8]/30 hover:text-[#f0f0f8]/70 hover:bg-white/8 transition-all duration-150"
      >
        <MoreHorizontal size={14} />
      </button>

      <div
        style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 4px)",
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          minWidth: 100,
          zIndex: 10,
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(-6px)",
          transformOrigin: "top right",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <button
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#e84545]/10 transition-colors"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#e84545" }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

// ─── 3-dot dropdown menu for meme owner ───────────────────────────────────────
function MemeMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a2e] border border-[#333344] text-[#f0f0f8]/60 hover:text-[#f0f0f8] hover:bg-[#252535] hover:border-[#7c5cfc]/50 transition-all duration-150"
      >
        <MoreHorizontal size={16} />
      </button>

      <div
        style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 4px)",
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          minWidth: 120,
          zIndex: 20,
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(-6px)",
          transformOrigin: "top right",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      >
        <button
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#7c5cfc]/10 transition-colors"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#f0f0f8" }}
        >
          <Pencil size={14} /> Edit
        </button>
        <button
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#e84545]/10 transition-colors"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#e84545" }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}

export default function MemeCard({
  meme,
  upvoted,
  saved,
  reaction,
  onUpvote,
  onSave,
  onReact,
  onShare,
  onEdit,
  onDelete,
  currentUser,
}) {
  const [showReactions, setShowReactions] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!currentUser;

  // Check if current user is the meme owner (using author.id from API response)
  const memeUserId = meme.author?.id || meme.user_id || meme.userId;
  const currentUserId = currentUser?.id;
  const isMemeOwner = isLoggedIn && !!memeUserId && String(memeUserId) === String(currentUserId);

  const initialUpvoted = !!meme.isUpvoted;
  let upvoteDelta = 0;
  if (upvoted && !initialUpvoted) upvoteDelta = 1;
  else if (!upvoted && initialUpvoted) upvoteDelta = -1;
  const adjustedUpvotes = Math.max(0, (meme.upvotes || 0) + upvoteDelta);

  const isImage = meme.format?.trim().toLowerCase() === "image" || !!meme.image || !!meme.imageUrl;
  const isText = meme.format?.trim().toLowerCase() === "text" || (!isImage && !!meme.textContent);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }

  // Fallback UI states
  const [localCommentsCount, setLocalCommentsCount] = useState(
    meme.comments || meme.commentCount || 0
  );

  const memeId = meme.id || meme._id;

  // Validate memeId is a proper UUID
  const isValidMemeId =
    memeId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memeId);

  async function toggleComments() {
    if (!showComments) {
      if (!isValidMemeId) {
        console.error("Invalid meme ID:", memeId);
        return;
      }
      setShowComments(true);
      setLoadingComments(true);
      try {
        const res = await memeService.getComments(memeId);
        // Handle new API response format: { success, totalCount, comments }
        const commentsData = res.comments || res.data?.comments || res.data || [];
        setComments(Array.isArray(commentsData) ? commentsData : []);
        if (res.totalCount !== undefined) {
          setLocalCommentsCount(res.totalCount);
        }
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
      setReplyingTo(null);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const parentId = replyingTo?.id || null;
      const res = await memeService.addComment(memeId, newComment.trim(), parentId);

      // Refresh comments to get proper nested structure
      const refreshRes = await memeService.getComments(memeId);
      const commentsData =
        refreshRes.comments || refreshRes.data?.comments || refreshRes.data || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);

      setNewComment("");
      setReplyingTo(null);
      if (refreshRes.totalCount !== undefined) {
        setLocalCommentsCount(refreshRes.totalCount);
      } else {
        setLocalCommentsCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId) {
    const prevComments = [...comments];

    // Optimistic update - remove comment from UI
    const removeCommentRecursive = (list, id) => {
      return list.filter((c) => {
        if ((c.id || c._id) === id) return false;
        if (c.replies) {
          c.replies = removeCommentRecursive(c.replies, id);
        }
        return true;
      });
    };

    setComments((prev) => removeCommentRecursive([...prev], commentId));
    setLocalCommentsCount((prev) => Math.max(0, prev - 1));

    try {
      await memeService.deleteComment(memeId, commentId);
      // Refresh to get accurate state from server
      const refreshRes = await memeService.getComments(memeId);
      const commentsData =
        refreshRes.comments || refreshRes.data?.comments || refreshRes.data || [];
      setComments(Array.isArray(commentsData) ? commentsData : []);
      if (refreshRes.totalCount !== undefined) {
        setLocalCommentsCount(refreshRes.totalCount);
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
      setComments(prevComments);
      setLocalCommentsCount((prev) => prev + 1);
    }
  }

  async function handleShare() {
    if (!isValidMemeId) {
      console.error("Cannot share - invalid meme ID:", memeId);
      return;
    }

    // Use onShare prop if provided (from parent), otherwise handle locally
    if (onShare) {
      onShare();
      return;
    }

    // Default share behavior - create proper meme URL
    const shareUrl = `${window.location.origin}/entertain/memes/${memeId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      await memeService.shareMeme(memeId);
      alert("Copied to clipboard! 🔗 Share sent!");
    } catch (err) {
      console.error("Share failed", err);
    }
  }

  // Count all descendants (nested replies) for a comment
  const countAllDescendants = (comment) => {
    const replies = comment.replies || [];
    let total = replies.length;
    replies.forEach((child) => {
      total += countAllDescendants(child);
    });
    return total;
  };

  // Render a comment node recursively
  const renderCommentNode = (comment, depth = 0, parentName = null) => {
    const cId = comment.id || comment._id;
    const p = comment.profiles || comment.author || {};
    const name = p.username || p.display_name || p.displayName || p.name || "User";
    const avatarUrl = p.avatar_url || p.avatar || null;
    const avatarColor = p.avatar_color || p.gradient || "#6366F1";
    const initials = p.initials || name.slice(0, 2).toUpperCase();

    // Check if current user is the comment owner
    // API returns user_id on comment, or we can match via profiles.id
    const commentUserId = comment.user_id || comment.userId || p.id;
    const currentUserId = currentUser?.id;
    const isOwner =
      !!currentUser && !!commentUserId && String(commentUserId) === String(currentUserId);

    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;
    const isExpanded = expandedReplies[cId] || false;
    const totalDescendants = countAllDescendants(comment);

    // Indentation increases with depth
    const indentPixels = depth === 0 ? 0 : 32 + (depth - 1) * 16;
    const indentStyle = depth > 0 ? { marginLeft: `${indentPixels}px` } : {};

    return (
      <div key={cId} className={`w-full relative ${depth === 0 ? "mb-3" : "mt-2"}`}>
        <div className="flex gap-3 relative" style={indentStyle}>
          {depth > 0 && <div className="absolute -left-[18px] top-4 w-4 h-px bg-white/10" />}
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-['Outfit'] font-bold text-[10px] text-white flex-shrink-0 mt-0.5 relative z-10"
            style={{ background: avatarUrl ? "transparent" : avatarColor }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              initials
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-['Outfit'] text-xs font-bold text-[#f0f0f8]">{name}</span>
                {isOwner && (
                  <span className="font-['Outfit'] text-[9px] px-1.5 py-0.5 rounded-full bg-[#7c5cfc]/15 text-[#7c5cfc] leading-none">
                    you
                  </span>
                )}
                <span className="font-['Outfit'] text-[10px] text-[#f0f0f8]/30">
                  {formatTimeAgo(comment.createdAt || comment.created_at)}
                </span>
              </div>
              {/* 3-dot menu - only for owner */}
              {isOwner && <CommentMenu onDelete={() => handleDeleteComment(cId)} />}
            </div>

            <div className="mt-0.5">
              {/* Show parent reference for replies */}
              {parentName && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-['Outfit'] text-[11px] text-[#7c5cfc]">
                    Replying to <span className="font-semibold">{parentName}</span>
                  </span>
                </div>
              )}
              <p className="font-['Outfit'] text-sm text-[#f0f0f8]/75 leading-relaxed break-words">
                {comment.content || comment.comment_text}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => {
                    setReplyingTo({ id: cId, name });
                  }}
                  className="flex items-center gap-1 text-[11px] font-['Outfit'] font-medium text-[#f0f0f8]/40 hover:text-[#7c5cfc] transition-colors"
                >
                  <Reply size={12} /> Reply
                </button>
                {/* Report meme comment — only for non-owners */}
                {!isOwner && (
                  <ReportButton
                    moduleType="meme_comment"
                    targetId={String(cId)}
                    targetUserId={commentUserId ? String(commentUserId) : undefined}
                    contentPreview={comment.content || comment.comment_text}
                    isLoggedIn={isLoggedIn}
                    size="sm"
                    variant="icon"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Show/Hide Replies Button */}
        {hasReplies && depth === 0 && (
          <div className="mt-2" style={{ marginLeft: "44px" }}>
            <button
              onClick={() => setExpandedReplies((prev) => ({ ...prev, [cId]: !prev[cId] }))}
              className="flex items-center gap-2 text-[#7c5cfc] hover:text-[#8b6dfc] transition-colors"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#7c5cfc]/20 flex items-center justify-center transition-transform ${isExpanded ? "rotate-180" : ""}`}
              >
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path
                    d="M1 1L5 5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-['Outfit'] text-[12px] font-semibold">
                {isExpanded
                  ? "Hide"
                  : `View ${totalDescendants} ${totalDescendants === 1 ? "reply" : "replies"}`}
              </span>
            </button>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && (depth > 0 || isExpanded) && (
          <div className="w-full mt-1 relative">
            {depth === 0 && (
              <div className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: "19px" }} />
            )}
            {replies.map((r) => renderCommentNode(r, depth + 1, name))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#12121a] border border-[#22222d] rounded-xl mb-5 flex flex-col overflow-x-hidden">
      {/* Header: Author Row */}
      <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-2">
        {/* Avatar - support both URL and gradient/initials */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-['Outfit'] font-bold text-[13px] text-[#080810] flex-shrink-0 overflow-hidden"
          style={{
            background: meme.author?.avatar ? "transparent" : meme.author?.gradient || "#eab308",
          }}
        >
          {meme.author?.avatar ? (
            <img
              src={meme.author.avatar}
              alt={meme.author?.name || "User"}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            meme.author?.initials ||
            (meme.author?.name || meme.author?.username || "U").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-['Outfit'] text-[14px] font-bold text-white tracking-wide truncate">
            {meme.author?.username ||
              meme.author?.displayName ||
              meme.author?.name ||
              "Unknown User"}
          </div>
          <div className="font-['Outfit'] text-[12px] text-gray-500 font-medium">
            {meme.timeAgo || "recently"}
          </div>
        </div>
        {meme.trending && (
          <span className="flex items-center gap-1 bg-[#2d1616] border border-[#ff4b4b]/20 rounded-full px-2.5 py-1 font-['Outfit'] font-bold text-[10px] text-[#ff4b4b] uppercase tracking-wider">
            <Flame size={12} strokeWidth={2.5} />
            HOT
          </span>
        )}
        {isMemeOwner && (
          <div className="ml-auto">
            <MemeMenu
              onEdit={() => onEdit && onEdit(meme)}
              onDelete={() => onDelete && onDelete(meme)}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-4 sm:px-5 pb-3 pt-1">
        <h3 className="font-outfit text-[16px] font-bold text-white m-0 leading-snug">
          {meme.title}
        </h3>
      </div>

      {/* Content (Image or Text) */}
      {isImage && (meme.image || meme.imageUrl) && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-lg overflow-hidden relative cursor-pointer">
          <img
            src={meme.image || meme.imageUrl}
            alt={meme.title || "meme"}
            className="w-full max-h-[450px] object-cover block"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {isText && meme.textContent && (
        <div className="mx-4 sm:mx-5 mb-3 bg-[#181824] border border-[#2a2a38] rounded-lg p-4 sm:p-5 min-w-0">
          <pre
            className="font-outfit text-[14px] sm:text-[15px] text-gray-300 leading-relaxed m-0 whitespace-pre-wrap font-medium"
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {meme.textContent}
          </pre>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-4 sm:px-5 pb-4">
        {(meme.tags || []).map((tag) => (
          <span
            key={tag}
            className="rounded-full px-3 py-1 text-[11px] font-outfit font-bold tracking-wide bg-[#1a162e] border border-[#7c5cfc]/20 text-[#8b7aef]"
          >
            #{tag.replace(/ /g, "")}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#22222d] w-full"></div>

      {/* Footer: Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 px-4 sm:px-5 py-3 bg-[#12121a]">
        {!isLoggedIn ? (
          /* Login prompt for guests */
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 text-[#7c5cfc] font-outfit text-[13px] font-semibold hover:bg-[#7c5cfc]/20 transition-all cursor-pointer"
          >
            <LogIn size={15} strokeWidth={2.5} />
            Login to like, comment & react
          </button>
        ) : (
          <>
            {/* Left side actions */}
            <div className="flex items-center gap-2">
              {/* Upvote */}
              <button
                onClick={onUpvote}
                className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 cursor-pointer font-outfit text-[12px] sm:text-[13px] font-semibold transition-all ${
                  upvoted
                    ? "bg-[#2d2a1b] text-[#f5c518] border border-[#f5c518]/30"
                    : "bg-[#181822] text-gray-400 border border-[#262630] hover:bg-[#1f1f2a]"
                }`}
              >
                <ChevronUp
                  size={16}
                  strokeWidth={2.5}
                  color={upvoted ? "#f5c518" : "currentColor"}
                />
                {adjustedUpvotes >= 1000
                  ? `${(adjustedUpvotes / 1000).toFixed(1)}k`
                  : adjustedUpvotes}
              </button>

              {/* Comments Toggle */}
              <button
                onClick={toggleComments}
                className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 cursor-pointer font-outfit text-[12px] sm:text-[13px] font-semibold transition-all ${
                  showComments
                    ? "bg-[#1f1f2a] text-white border border-[#333340]"
                    : "bg-[#181822] text-gray-400 border border-[#262630] hover:bg-[#1f1f2a]"
                }`}
              >
                <MessageSquare size={14} strokeWidth={2.5} />
                {localCommentsCount}
              </button>

              {/* Emoji Reaction */}
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer text-[16px] transition-all duration-300 ease-in-out border-2 ${
                    reaction
                      ? `bg-[#252535] border-[#333344] shadow-[0_0_10px_rgba(124,92,252,0.15)]`
                      : "bg-[#252535] border-[#333344] hover:bg-[#333344] hover:border-[#444455] hover:shadow-sm"
                  }`}
                >
                  {reaction || "😆"}
                </button>
                {showReactions && (
                  <div className="absolute bottom-[calc(100%+8px)] left-0 bg-[#1e1e2a] border border-[#333344] rounded-xl p-2 flex gap-1 z-50 shadow-xl">
                    {TAG_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact(emoji);
                          setShowReactions(false);
                        }}
                        className="bg-transparent border-none cursor-pointer text-[22px] p-1.5 rounded-lg transition-transform duration-150 hover:scale-125 hover:bg-white/5"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Save */}
              <button
                onClick={onSave}
                className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 cursor-pointer font-outfit text-[12px] sm:text-[13px] font-semibold transition-all ${
                  saved
                    ? `bg-[${ACCENT}15] text-[${ACCENT}] border-[${ACCENT}40]`
                    : "bg-[#181822] text-gray-400 border border-[#262630] hover:bg-[#1f1f2a]"
                }`}
              >
                <Bookmark size={14} strokeWidth={2.5} fill={saved ? ACCENT : "none"} />
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-[#181822] border border-[#262630] text-gray-400 hover:bg-[#1f1f2a] hover:text-white transition-all cursor-pointer"
              >
                <Share2 size={14} strokeWidth={2.5} />
              </button>

              {/* Report meme — only for non-owners */}
              {!isMemeOwner && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#181822] border border-[#262630] text-gray-400 hover:bg-[#1f1f2a] hover:text-white transition-all cursor-pointer">
                  <ReportButton
                    moduleType="meme"
                    targetId={String(memeId)}
                    targetUserId={memeUserId ? String(memeUserId) : undefined}
                    contentPreview={meme.title}
                    isLoggedIn={isLoggedIn}
                    size="sm"
                    variant="icon"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="border-t border-[#22222d] bg-[#0d0d14] px-4 sm:px-5 py-4 sm:py-5">
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingComments ? (
              <div className="flex justify-center py-6 text-[#7c5cfc]">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-[13px] font-outfit font-medium text-gray-500">
                No comments yet. Be the first!
              </div>
            ) : (
              comments.map((c) => renderCommentNode(c, 0))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="mt-5">
            {!isLoggedIn ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 text-[#7c5cfc] font-outfit text-[13px] font-semibold hover:bg-[#7c5cfc]/20 transition-all cursor-pointer"
              >
                <LogIn size={14} strokeWidth={2.5} />
                Login to add a comment
              </button>
            ) : (
              <>
                {replyingTo && (
                  <div className="flex items-center justify-between bg-[#7c5cfc]/10 text-[#7c5cfc] px-3 py-2 rounded-lg font-['Outfit'] text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <Reply size={14} />
                      <span>
                        Replying to <strong>{replyingTo.name}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="hover:bg-[#7c5cfc]/20 p-1 rounded-full text-[#7c5cfc]/60 hover:text-[#7c5cfc] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2.5">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !isSubmittingComment && handleAddComment()
                    }
                    placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                    className="flex-1 h-10 bg-[#161622] border border-[#2a2a38] rounded-full px-5 text-[14px] font-outfit text-white outline-none transition-all focus:border-[#7c5cfc] focus:bg-[#1a1a28] placeholder-gray-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      newComment.trim()
                        ? "bg-[#7c5cfc] hover:bg-[#6b4ce6] cursor-pointer shadow-lg shadow-[#7c5cfc]/20"
                        : "bg-[#22222d] border border-[#2a2a38] text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmittingComment ? (
                      <Loader2 size={16} className="animate-spin text-white" />
                    ) : (
                      <Send
                        size={15}
                        color={newComment.trim() ? "white" : "currentColor"}
                        className="ml-[-2px]"
                      />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

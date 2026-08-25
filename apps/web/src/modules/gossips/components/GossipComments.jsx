import { useState, useEffect, useRef, useCallback, memo } from "react";
import { Send, Trash2, Clock } from "lucide-react";
import gossipService from "../services/gossip.service";
import LoadingState from "../../../shared/LoadingState";

// ── Module-level constants (avoid recreating every render) ────────────────────
const GRADS = [
  "linear-gradient(135deg,#f5c518,#e84545)",
  "linear-gradient(135deg,#3b82f6,#7c5cfc)",
  "linear-gradient(135deg,#1fd1a8,#3b82f6)",
  "linear-gradient(135deg,#e84545,#7c5cfc)",
  "linear-gradient(135deg,#f5c518,#1fd1a8)",
];

function getGrad(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return GRADS[Math.abs(h) % GRADS.length];
}

function getInitial(username) {
  return username ? username[0].toUpperCase() : "?";
}

// ── LazyImage ─────────────────────────────────────────────────────────────────
const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  style,
  onError,
  containerClassName,
  containerStyle,
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src || !imgRef.current) return;
    const el = imgRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  if (errored) return null;

  return (
    <div className={containerClassName} style={containerStyle}>
      {!loaded && <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />}
      <img
        ref={imgRef}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
});

// ── CommentAvatar ─────────────────────────────────────────────────────────────
const CommentAvatar = memo(function CommentAvatar({ avatar, username }) {
  const [imgError, setImgError] = useState(false);
  const showImg = avatar && !imgError;

  return (
    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-[rgba(255,255,255,0.1)] relative">
      {showImg ? (
        <LazyImage
          src={avatar}
          alt={username}
          className="w-full h-full object-cover"
          containerClassName="relative w-full h-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-[#080810] font-bold text-[12px] font-[Outfit]"
          style={{ background: getGrad(username) }}
        >
          {getInitial(username)}
        </div>
      )}
    </div>
  );
});

// ── CommentItem ───────────────────────────────────────────────────────────────
const CommentItem = memo(function CommentItem({ comment, onDelete }) {
  const formattedDate =
    comment.createdAt && !isNaN(new Date(comment.createdAt).getTime())
      ? new Date(comment.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Just now";

  const handleDelete = useCallback(() => onDelete(comment.id), [onDelete, comment.id]);

  return (
    <div className="flex gap-3 bg-[rgba(255,255,255,0.02)] p-3.5 rounded-[12px] border border-[rgba(255,255,255,0.04)] group hover:border-[rgba(255,255,255,0.08)] transition-colors">
      <CommentAvatar avatar={comment.user.avatar} username={comment.user.username} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[Outfit] font-bold text-[13px] text-[#f0f0f8]">
              {comment.user.username}
            </span>
            <span className="w-1 h-1 rounded-full bg-[rgba(255,255,255,0.2)]"></span>
            <span className="font-[Outfit] text-[10px] text-[rgba(240,240,248,0.3)] flex items-center gap-1">
              <Clock size={9} />
              {formattedDate}
            </span>
          </div>

          {comment.is_my_comment && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-[rgba(240,240,248,0.3)] hover:text-red-500 transition-all p-1"
              title="Delete comment"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <p className="font-[Outfit] text-[13px] text-[rgba(240,240,248,0.7)] leading-relaxed break-words whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
});

// ── Main GossipComments ─────────────────────────────────────────────────────────
export default function GossipComments({
  gossipId,
  onCommentAdded,
  onCommentDeleted,
  showHeader = true,
  onCommentsLoaded,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const mapComments = useCallback(
    (raw) =>
      (Array.isArray(raw) ? raw : []).map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        is_my_comment: c.is_my_comment,
        user: {
          username: c.username || "",
          avatar: c.avatar || null,
        },
      })),
    []
  );

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const commentsRes = await gossipService.getComments(gossipId);
      const commentsData = commentsRes.data || commentsRes;
      const finalComments = mapComments(commentsData);
      if (isMounted.current) {
        setComments(finalComments);
        if (onCommentsLoaded) onCommentsLoaded(finalComments.length);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [gossipId, mapComments, onCommentsLoaded]);

  useEffect(() => {
    if (gossipId) loadComments();
  }, [gossipId, loadComments]);

  const handleAddComment = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newComment.trim() || commenting) return;
      setCommenting(true);
      try {
        const res = await gossipService.addComment(gossipId, newComment.trim());
        const created = res?.data || res;

        if (isMounted.current) {
          // Append locally instead of refetching the whole list
          if (created && created.id) {
            const newEntry = {
              id: created.id,
              content: created.content ?? newComment.trim(),
              createdAt: created.created_at || new Date().toISOString(),
              is_my_comment: true,
              user: {
                username: created.username || "",
                avatar: created.avatar || null,
              },
            };
            setComments((prev) => [newEntry, ...prev]);
          } else {
            // Fallback: refetch only if the API didn't return the new comment
            await loadComments();
          }
          setNewComment("");
        }
        if (onCommentAdded) onCommentAdded();
      } catch (error) {
        console.error("Failed to add comment:", error);
      } finally {
        if (isMounted.current) setCommenting(false);
      }
    },
    [newComment, commenting, gossipId, onCommentAdded, loadComments]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      try {
        await gossipService.deleteComment(commentId);
        if (isMounted.current) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
        if (onCommentDeleted) onCommentDeleted();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    },
    [onCommentDeleted]
  );

  const handleInputChange = useCallback((e) => setNewComment(e.target.value), []);

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <LoadingState type="spinner" size="sm" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col p-4 md:p-5">
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <h4 className="font-[Outfit] font-semibold text-[14px] text-[#f0f0f8] m-0">Comments</h4>
          <span className="text-[11px] font-bold text-[#12121e] bg-[#f5c518] px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="flex gap-3 mb-5 relative">
        <input
          type="text"
          value={newComment}
          onChange={handleInputChange}
          placeholder="Add a comment..."
          className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-[#f0f0f8] font-[Outfit] text-[13px] outline-none focus:border-[#f5c518] focus:bg-[rgba(245,197,24,0.02)] transition-all"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || commenting}
          className="w-[46px] flex-shrink-0 bg-gradient-to-r from-[#f5c518] to-[#eab308] text-[#080810] rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(245,197,24,0.3)]"
        >
          {commenting ? (
            <div className="w-4 h-4 border-2 border-[#080810] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)] scrollbar-track-transparent">
        {comments.length === 0 ? (
          <div className="text-center py-6 bg-[rgba(255,255,255,0.01)] rounded-xl border border-dashed border-[rgba(255,255,255,0.05)] text-[rgba(240,240,248,0.4)] font-[Outfit] text-[13px]">
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onDelete={handleDeleteComment} />
          ))
        )}
      </div>
    </div>
  );
}

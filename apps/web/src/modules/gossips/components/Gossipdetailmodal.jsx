import { useState, useEffect, useRef, useCallback, memo } from "react";
import { CAT_CONFIG } from "../data/gossips";
import {
  X,
  Bookmark,
  Share2,
  MessageSquare,
  CheckCircle,
  Send,
  Trash2,
  Loader2,
  Edit2,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  Pencil,
  Reply,
  Check,
} from "lucide-react";
import { privateAxios } from "../../../utils/AxiosInstance";
import AuthPromptModal from "./Authpromptmodal";
import { ReportButton } from "../../Reports";

const ACCENT = "#f5c518";
const DEFAULT_CAT = { label: "Gossip", emoji: "💬", color: "#9333ea" };

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
function getInitial(username = "") {
  return username ? username[0].toUpperCase() : "Y";
}
function fmtCount(n) {
  const num = parseInt(n, 10) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return String(num);
}

// ── LazyImage ─────────────────────────────────────────────────────────────────
const LazyImage = memo(function LazyImage({ src, alt, className, style, onError, containerStyle }) {
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
    <div style={{ position: "relative", ...containerStyle }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.04)",
            animation: "pulse 2s infinite",
          }}
        />
      )}
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

// ── Avatar with lazy image ────────────────────────────────────────────────────
const CommentAvatar = memo(function CommentAvatar({ avatar, username }) {
  const [imgError, setImgError] = useState(false);
  const showImg = avatar && !imgError;
  return (
    <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden border border-white/10 mt-0.5 relative z-10">
      {showImg ? (
        <LazyImage
          src={avatar}
          alt={username}
          className="w-full h-full object-cover"
          containerStyle={{ width: "100%", height: "100%" }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-[#080810] font-bold text-[11px]"
          style={{ background: getGrad(username) }}
        >
          {getInitial(username)}
        </div>
      )}
    </div>
  );
});

// ── ErrorToast ────────────────────────────────────────────────────────────────
const ErrorToast = memo(function ErrorToast({ message, visible }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: "#1a1a2e",
        border: "1px solid rgba(232,69,69,0.45)",
        borderLeft: "3px solid #e84545",
        borderRadius: 12,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
        maxWidth: 320,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.96)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>⚠️</span>
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          color: "rgba(240,240,248,0.85)",
          lineHeight: 1.45,
        }}
      >
        {message}
      </span>
    </div>
  );
});

// ── CommentMenu ───────────────────────────────────────────────────────────────
function CommentMenu({ onEdit, onDelete }) {
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
        className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/8 transition-all duration-150"
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
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            color: "rgba(240,240,248,0.8)",
          }}
        >
          <Pencil size={12} style={{ color: "#3b82f6" }} /> Edit
        </button>
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
        <button
          onClick={() => {
            setOpen(false);
            onDelete();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#e84545]/10 transition-colors"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            color: "#e84545",
          }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── InlineReplyInput ──────────────────────────────────────────────────────────
function InlineReplyInput({
  replyingToName,
  onSubmit,
  onCancel,
  isLoggedIn,
  requireAuth,
  indentPixels = 0,
}) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-2 mb-1" style={{ marginLeft: `${indentPixels + 28}px` }}>
      <div
        className="rounded-[12px] border border-[#f5c518]/20 bg-[#f5c518]/[0.04] p-2.5"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Reply size={11} style={{ color: ACCENT }} />
          <span className="font-['Outfit'] text-[11px] font-semibold" style={{ color: ACCENT }}>
            Replying to <span className="font-bold">{replyingToName}</span>
          </span>
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") onCancel();
            }}
            placeholder={`Reply to ${replyingToName}…`}
            rows={2}
            disabled={posting}
            onClick={() => {
              if (!isLoggedIn) requireAuth("Sign in to drop your take in the comments! 💬");
            }}
            readOnly={!isLoggedIn}
            className="flex-1 rounded-[10px] p-[8px_12px] font-['Outfit'] text-[12px] text-[#f0f0f8] bg-white/[0.05] border border-white/[0.09] resize-none outline-none leading-relaxed disabled:opacity-50 transition-all focus:border-[#f5c518]/40"
            style={{ caretColor: ACCENT }}
          />
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || posting}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: text.trim() ? ACCENT : "rgba(255,255,255,0.06)",
                color: text.trim() ? "#080810" : "rgba(240,240,248,0.3)",
              }}
            >
              {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
            <button
              onClick={onCancel}
              disabled={posting}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.07] text-white/40 hover:text-white/70 hover:bg-white/10 transition-all disabled:opacity-40"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CommentNode ───────────────────────────────────────────────────────────────
function CommentNode({
  comment,
  depth = 0,
  parentName = null,
  onReply,
  onDelete,
  onEdit,
  editingComment,
  setEditingComment,
  savingEdit,
  onSubmitEdit,
  expandedReplies,
  setExpandedReplies,
  requireAuth,
  isLoggedIn = true,
  inlineReplyId,
  setInlineReplyId,
  onSubmitInlineReply,
}) {
  const isOwner = comment.is_my_comment || comment.isMyComment;
  const isEditing = editingComment?.id === comment.id;
  const showInlineReply = inlineReplyId === comment.id;
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  const hasReplies = replies.length > 0;
  const isExpanded = expandedReplies[comment.id] || false;

  const countAllDescendants = (c) => {
    const kids = Array.isArray(c.replies) ? c.replies : [];
    return kids.reduce((t, k) => t + 1 + countAllDescendants(k), 0);
  };
  const totalDescendants = countAllDescendants(comment);

  const username = comment.username || comment.user?.username || "";
  const avatar = comment.avatar || comment.user?.avatar || null;
  const indentPixels = depth === 0 ? 0 : 32 + (depth - 1) * 16;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleReplyClick = () => {
    if (requireAuth("Sign in to reply to comments!")) return;
    setInlineReplyId((prev) => (prev === comment.id ? null : comment.id));
  };

  const handleInlineSubmit = async (text) => {
    await onSubmitInlineReply(comment.id, text);
    setInlineReplyId(null);
    setExpandedReplies((prev) => ({ ...prev, [comment.id]: true }));
  };

  return (
    <div className={`w-full relative ${depth === 0 ? "mb-3" : "mt-2"}`}>
      <div
        className="flex gap-3 relative"
        style={depth > 0 ? { marginLeft: `${indentPixels}px` } : {}}
      >
        {depth > 0 && <div className="absolute -left-[18px] top-4 w-4 h-px bg-white/10" />}

        <CommentAvatar avatar={avatar} username={username} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-['Outfit'] text-[11px] font-bold text-white/70">
                {username}
              </span>
              {isOwner && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${ACCENT}22`, color: ACCENT }}
                >
                  YOU
                </span>
              )}
              <span className="text-[10px] text-white/20">{formatTimeAgo(comment.created_at)}</span>
            </div>
            {isOwner && !isEditing && (
              <CommentMenu
                onEdit={() => setEditingComment({ id: comment.id, text: comment.content })}
                onDelete={() => onDelete(comment.id)}
              />
            )}
          </div>

          {isEditing ? (
            <div className="mt-1.5 space-y-2">
              <textarea
                autoFocus
                value={editingComment.text}
                onChange={(e) =>
                  setEditingComment((prev) => ({
                    ...prev,
                    text: e.target.value,
                  }))
                }
                rows={2}
                className="w-full bg-white/5 border border-[#3b82f6]/40 rounded-lg p-2.5 outline-none resize-none font-['Outfit'] text-[12px] text-[#f0f0f8] leading-relaxed transition-colors"
                style={{ caretColor: ACCENT }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onSubmitEdit(comment.id, editingComment.text)}
                  disabled={savingEdit || !editingComment.text?.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5c518] text-[#080810] font-['Outfit'] text-[11px] font-bold disabled:opacity-50 transition-colors"
                >
                  {savingEdit ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Check size={10} />
                  )}{" "}
                  Save
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/60 font-['Outfit'] text-[11px] hover:bg-white/20 transition-colors"
                >
                  <X size={10} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-0.5">
              {parentName && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-['Outfit'] text-[11px] text-[#3b82f6]">
                    Replying to <span className="font-semibold">{parentName}</span>
                  </span>
                </div>
              )}
              <p className="font-['Outfit'] text-[13px] text-white/60 leading-relaxed break-words whitespace-pre-wrap">
                {comment.content}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={handleReplyClick}
                  className="flex items-center gap-1 text-[11px] font-['Outfit'] font-medium transition-colors"
                  style={{
                    color: showInlineReply ? ACCENT : "rgba(255,255,255,0.3)",
                  }}
                >
                  <Reply size={12} /> {showInlineReply ? "Cancel" : "Reply"}
                </button>
                {!isOwner && (
                  <ReportButton
                    moduleType="gossip_comment"
                    targetId={String(comment.id)}
                    contentPreview={comment.content}
                    isLoggedIn={isLoggedIn}
                    size="sm"
                    variant="icon"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showInlineReply && (
        <InlineReplyInput
          replyingToName={username}
          onSubmit={handleInlineSubmit}
          onCancel={() => setInlineReplyId(null)}
          isLoggedIn={isLoggedIn}
          requireAuth={requireAuth}
          indentPixels={depth === 0 ? 0 : indentPixels}
        />
      )}

      {hasReplies && depth === 0 && (
        <div className="mt-2" style={{ marginLeft: "44px" }}>
          <button
            onClick={() =>
              setExpandedReplies((prev) => ({
                ...prev,
                [comment.id]: !prev[comment.id],
              }))
            }
            className="flex items-center gap-2 text-[#f5c518] hover:text-[#e8b800] transition-colors"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200"
              style={{
                background: `${ACCENT}20`,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
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
                ? "Hide replies"
                : `View ${totalDescendants} ${totalDescendants === 1 ? "reply" : "replies"}`}
            </span>
          </button>
        </div>
      )}

      {hasReplies && (depth > 0 || isExpanded) && (
        <div className="w-full mt-1 relative">
          {depth === 0 && (
            <div className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: "19px" }} />
          )}
          {replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              depth={depth + 1}
              parentName={username}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              editingComment={editingComment}
              setEditingComment={setEditingComment}
              savingEdit={savingEdit}
              onSubmitEdit={onSubmitEdit}
              expandedReplies={expandedReplies}
              setExpandedReplies={setExpandedReplies}
              requireAuth={requireAuth}
              isLoggedIn={isLoggedIn}
              inlineReplyId={inlineReplyId}
              setInlineReplyId={setInlineReplyId}
              onSubmitInlineReply={onSubmitInlineReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
function GossipDetailModal({
  gossip: initialGossip,
  onClose,
  onBookmarkToggle,
  onGossipDeleted,
  onReactionChange,
  followMap = {},
  onFollowChange,
}) {
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });

  const [followErrorToast, setFollowErrorToast] = useState({
    visible: false,
    message: "",
  });
  const followErrorTimerRef = useRef(null);

  const showFollowError = useCallback((message) => {
    if (followErrorTimerRef.current) clearTimeout(followErrorTimerRef.current);
    setFollowErrorToast({ visible: true, message });
    followErrorTimerRef.current = setTimeout(
      () => setFollowErrorToast({ visible: false, message: "" }),
      4000
    );
  }, []);

  useEffect(
    () => () => {
      if (followErrorTimerRef.current) clearTimeout(followErrorTimerRef.current);
    },
    []
  );

  const requireAuth = useCallback(
    (message) => {
      if (!isLoggedIn) {
        setAuthPrompt({ open: true, message });
        return true;
      }
      return false;
    },
    [isLoggedIn]
  );

  const [gossip, setGossip] = useState(initialGossip);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [inlineReplyId, setInlineReplyId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingGossip, setEditingGossip] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState(initialGossip?.headline || "");
  const [editedExcerpt, setEditedExcerpt] = useState(initialGossip?.excerpt || "");

  const [fireCount, setFireCount] = useState(() => parseInt(initialGossip?.fire, 10) || 0);
  const [shockedCount, setShockedCount] = useState(() => parseInt(initialGossip?.shocked, 10) || 0);
  const [firedByMe, setFiredByMe] = useState(() => initialGossip?.userFired || false);
  const [shockedByMe, setShockedByMe] = useState(() => initialGossip?.userShocked || false);
  const [bookmarked, setBookmarked] = useState(() => initialGossip?.bookmarked || false);

  const [loadingFire, setLoadingFire] = useState(false);
  const [loadingShocked, setLoadingShocked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const [deletingGossip, setDeletingGossip] = useState(false);
  const [savingGossip, setSavingGossip] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const overlayRef = useRef(null);
  const cfg = CAT_CONFIG[gossip?.category] || DEFAULT_CAT;
  const imageUrl = gossip?.image_url || gossip?.image || null;
  const creatorId = gossip?.owners_id;
  const isOwnGossip = gossip?.is_my_gossip ?? initialGossip?.is_my_gossip ?? false;
  const canShowFollow = !!creatorId && !isOwnGossip;
  const isFollowing = creatorId ? (followMap[creatorId] ?? false) : false;

  // ── Fetch detail ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialGossip?.id) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const res = await privateAxios.get(`/api/gossips/${initialGossip.id}`);
        const data = res.data?.data || res.data;
        if (data) {
          setGossip(data);
          setEditedHeadline(data.headline || "");
          setEditedExcerpt(data.excerpt || "");
          setFireCount(parseInt(data.fire, 10) || 0);
          setShockedCount(parseInt(data.shocked, 10) || 0);
          setFiredByMe(data.userFired || false);
          setShockedByMe(data.userShocked || false);
          setBookmarked(data.bookmarked || false);
          const cid = data.owners_id;
          const own = data.is_my_gossip ?? false;
          if (cid && !own && followMap[cid] === undefined) {
            try {
              const fr = await privateAxios.get(`/api/follow/${cid}/is-following`);
              onFollowChange?.(
                cid,
                fr.data?.isFollowing ?? fr.data?.data?.isFollowing ?? fr.data?.following ?? false
              );
            } catch {
              onFollowChange?.(cid, data.isFollowing || false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch gossip detail:", err.message);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [initialGossip?.id]);

  // ── Fetch comments ────────────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await privateAxios.get(`/api/gossips/${initialGossip.id}/comments`);
      let data = [];
      if (res.data?.data?.comments && Array.isArray(res.data.data.comments))
        data = res.data.data.comments;
      else if (Array.isArray(res.data?.data)) data = res.data.data;
      else if (Array.isArray(res.data)) data = res.data;
      else if (res.data?.comments && Array.isArray(res.data.comments)) data = res.data.comments;
      if (!Array.isArray(data)) data = [];

      const sorted = [...data].sort((a, b) => {
        const aIs = a.is_my_comment || a.isMyComment;
        const bIs = b.is_my_comment || b.isMyComment;
        if (aIs && !bIs) return -1;
        if (!aIs && bIs) return 1;
        return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
      });
      setComments(sorted);
    } catch (err) {
      console.error("Failed to fetch comments:", err.message);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [initialGossip?.id]);

  useEffect(() => {
    if (initialGossip?.id) fetchComments();
  }, [initialGossip?.id, fetchComments]);

  // ── Comment count ─────────────────────────────────────────────────────────
  const countAllComments = useCallback((list) => {
    return list.reduce(
      (t, c) => t + 1 + (Array.isArray(c.replies) ? countAllComments(c.replies) : 0),
      0
    );
  }, []);
  const totalCommentCount = countAllComments(comments);

  // ── Reactions ─────────────────────────────────────────────────────────────
  const handleFire = useCallback(async () => {
    if (requireAuth("Sign in to react to gossips and show what's 🔥!")) return;
    if (loadingFire) return;
    const wasOn = firedByMe;
    const newCount = wasOn ? Math.max(0, fireCount - 1) : fireCount + 1;
    setFiredByMe(!wasOn);
    setFireCount(newCount);
    setLoadingFire(true);
    try {
      await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
        reaction: "fire",
      });
      onReactionChange?.(gossip.id, { userFired: !wasOn, fire: newCount });
    } catch {
      setFiredByMe(wasOn);
      setFireCount(wasOn ? newCount + 1 : Math.max(0, newCount - 1));
    } finally {
      setLoadingFire(false);
    }
  }, [firedByMe, fireCount, loadingFire, gossip?.id, requireAuth, onReactionChange]);

  const handleShocked = useCallback(async () => {
    if (requireAuth("Sign in to react to gossips — are you 😱 shocked?")) return;
    if (loadingShocked) return;
    const wasOn = shockedByMe;
    const newCount = wasOn ? Math.max(0, shockedCount - 1) : shockedCount + 1;
    setShockedByMe(!wasOn);
    setShockedCount(newCount);
    setLoadingShocked(true);
    try {
      await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
        reaction: "shocked",
      });
      onReactionChange?.(gossip.id, { userShocked: !wasOn, shocked: newCount });
    } catch {
      setShockedByMe(wasOn);
      setShockedCount(wasOn ? newCount + 1 : Math.max(0, newCount - 1));
    } finally {
      setLoadingShocked(false);
    }
  }, [shockedByMe, shockedCount, loadingShocked, gossip?.id, requireAuth, onReactionChange]);

  const handleBookmark = useCallback(async () => {
    if (requireAuth("Sign in to save gossips to your bookmarks!")) return;
    if (loadingBookmark) return;
    const was = bookmarked;
    setBookmarked(!was);
    setLoadingBookmark(true);
    try {
      await privateAxios.post(`/api/gossips/${gossip.id}/bookmark`);
      onBookmarkToggle?.();
    } catch {
      setBookmarked(was);
    } finally {
      setLoadingBookmark(false);
    }
  }, [bookmarked, loadingBookmark, gossip?.id, requireAuth, onBookmarkToggle]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/gossips/${gossip.id}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch (err) {
      console.error("Share failed:", err.message);
    }
  }, [gossip?.id]);

  const handleDeleteGossip = useCallback(async () => {
    setDeletingGossip(true);
    try {
      await privateAxios.delete(`/api/gossips/${gossip.id}`);
      onGossipDeleted?.(gossip.id);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert("Failed to delete gossip");
    } finally {
      setDeletingGossip(false);
    }
  }, [gossip?.id, onGossipDeleted, onClose]);

  const handleEditGossip = useCallback(async () => {
    if (!editedHeadline.trim() || !editedExcerpt.trim()) return;
    setSavingGossip(true);
    try {
      const res = await privateAxios.put(`/api/gossips/${gossip.id}`, {
        headline: editedHeadline.trim(),
        excerpt: editedExcerpt.trim(),
      });
      const updated = res.data?.data || res.data;
      setGossip((prev) => ({ ...prev, ...updated }));
      setEditingGossip(false);
    } catch (err) {
      console.error("Edit failed:", err.message);
      alert("Failed to update gossip");
    } finally {
      setSavingGossip(false);
    }
  }, [editedHeadline, editedExcerpt, gossip?.id]);

  const handleFollowToggle = useCallback(async () => {
    if (requireAuth("Sign in to follow creators and stay up to date!")) return;
    if (followLoading || !creatorId) return;
    const was = isFollowing;
    setFollowLoading(true);
    onFollowChange?.(creatorId, !was);
    try {
      if (was) await privateAxios.delete(`/api/follow/${creatorId}`);
      else await privateAxios.post(`/api/follow/${creatorId}`);
    } catch (err) {
      onFollowChange?.(creatorId, was);
      showFollowError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (was ? "Failed to unfollow." : "Failed to follow.")
      );
    } finally {
      setFollowLoading(false);
    }
  }, [followLoading, creatorId, isFollowing, requireAuth, onFollowChange, showFollowError]);

  // ── Comment helpers ───────────────────────────────────────────────────────
  const injectReply = useCallback((list, parentId, newComment) => {
    return list.map((c) => {
      if (c.id === parentId)
        return {
          ...c,
          replies: [
            { ...newComment, is_my_comment: true, isMyComment: true },
            ...(Array.isArray(c.replies) ? c.replies : []),
          ],
        };
      if (Array.isArray(c.replies) && c.replies.length > 0)
        return { ...c, replies: injectReply(c.replies, parentId, newComment) };
      return c;
    });
  }, []);

  const removeComment = useCallback((list, commentId) => {
    return list
      .filter((c) => c.id !== commentId)
      .map((c) => ({
        ...c,
        replies: Array.isArray(c.replies) ? removeComment(c.replies, commentId) : [],
      }));
  }, []);

  const updateComment = useCallback((list, commentId, updated) => {
    return list.map((c) => {
      if (c.id === commentId) return { ...updated, is_my_comment: true, isMyComment: true };
      if (Array.isArray(c.replies) && c.replies.length > 0)
        return { ...c, replies: updateComment(c.replies, commentId, updated) };
      return c;
    });
  }, []);

  const handlePostComment = useCallback(async () => {
    if (requireAuth("Sign in to drop your take in the comments! 💬")) return;
    if (!commentText.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const res = await privateAxios.post(`/api/gossips/${gossip.id}/comment`, {
        content: commentText.trim(),
      });
      const newComment = res.data?.data || res.data;
      if (newComment)
        setComments((prev) => [
          {
            ...newComment,
            is_my_comment: true,
            isMyComment: true,
            replies: [],
          },
          ...prev,
        ]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment:", err.message);
      alert("Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  }, [commentText, postingComment, gossip?.id, requireAuth]);

  const handleSubmitInlineReply = useCallback(
    async (parentId, text) => {
      if (!text.trim()) return;
      try {
        const res = await privateAxios.post(`/api/gossips/${gossip.id}/comment`, {
          content: text.trim(),
          parent_id: parentId,
        });
        const newComment = res.data?.data || res.data;
        if (newComment) setComments((prev) => injectReply(prev, parentId, newComment));
      } catch (err) {
        console.error("Failed to post reply:", err.message);
        alert("Failed to post reply");
        throw err;
      }
    },
    [gossip?.id, injectReply]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      setDeletingCommentId(commentId);
      try {
        await privateAxios.delete(`/api/gossips/comment/${commentId}`);
        setComments((prev) => removeComment(prev, commentId));
      } catch (err) {
        console.error("Failed to delete comment:", err.message);
        alert("Failed to delete comment");
      } finally {
        setDeletingCommentId(null);
      }
    },
    [removeComment]
  );

  const handleEditComment = useCallback(
    async (commentId, newContent) => {
      if (!newContent.trim()) return;
      setSavingEdit(true);
      try {
        const res = await privateAxios.put(`/api/gossips/comment/${commentId}`, {
          content: newContent.trim(),
        });
        const updated = res.data?.data || res.data;
        setComments((prev) => updateComment(prev, commentId, updated));
        setEditingComment(null);
      } catch (err) {
        console.error("Failed to edit comment:", err.message);
        alert("Failed to edit comment");
      } finally {
        setSavingEdit(false);
      }
    },
    [updateComment]
  );

  return (
    <>
      <ErrorToast message={followErrorToast.message} visible={followErrorToast.visible} />

      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />

      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        className="fixed inset-0 z-[400] bg-[rgba(8,8,16,0.9)] backdrop-blur-[10px] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-[640px] max-h-[90vh] flex flex-col bg-[#12121e] border border-white/10 rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Accent bar */}
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}44, transparent)`,
              flexShrink: 0,
            }}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
            style={{ flexShrink: 0 }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase"
                style={{
                  background: `${cfg.color}18`,
                  border: `1px solid ${cfg.color}40`,
                  color: cfg.color,
                }}
              >
                {cfg.emoji} {cfg.label}
              </span>
              {gossip?.verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2ecc71]">
                  <CheckCircle size={11} fill="#2ecc71" color="#2ecc71" /> VERIFIED
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Lazy hero image */}
            {imageUrl && !editingGossip && !loadingDetail && (
              <LazyImage
                src={imageUrl}
                alt={gossip?.headline || ""}
                className="w-full object-cover block"
                style={{ maxHeight: 220 }}
                containerStyle={{
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.03)",
                  maxHeight: 220,
                }}
              />
            )}

            <div className="px-6 py-5">
              {loadingDetail ? (
                <div className="space-y-3 mb-6 animate-pulse">
                  <div className="h-6 bg-white/[0.06] rounded-lg w-4/5" />
                  <div className="h-4 bg-white/[0.04] rounded w-1/3" />
                  <div className="h-4 bg-white/[0.04] rounded w-full" />
                  <div className="h-4 bg-white/[0.04] rounded w-5/6" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-white/[0.04] rounded-xl w-24" />
                    <div className="h-9 bg-white/[0.04] rounded-xl w-24" />
                  </div>
                </div>
              ) : editingGossip && isOwnGossip ? (
                <div className="space-y-4 mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <h4 className="font-bold text-[#f5c518]">Edit Gossip</h4>
                  <div>
                    <label className="text-[11px] text-white/50 font-bold mb-2 block">
                      Headline
                    </label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      maxLength={100}
                      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-400"
                      style={{ caretColor: ACCENT }}
                    />
                    <p className="text-[9px] text-white/30 mt-1">{editedHeadline.length}/100</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/50 font-bold mb-2 block">
                      Content
                    </label>
                    <textarea
                      value={editedExcerpt}
                      onChange={(e) => setEditedExcerpt(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-400 resize-none"
                      style={{ caretColor: ACCENT }}
                    />
                    <p className="text-[9px] text-white/30 mt-1">{editedExcerpt.length}/500</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleEditGossip}
                      disabled={savingGossip || !editedHeadline.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {savingGossip ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Saving…
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingGossip(false);
                        setEditedHeadline(gossip?.headline || "");
                        setEditedExcerpt(gossip?.excerpt || "");
                      }}
                      disabled={savingGossip}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-['Outfit'] text-[20px] font-black text-white leading-snug mb-3">
                    {gossip?.headline}
                  </h2>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-[11px] text-white/30 font-medium">
                      {gossip?.timeAgo || "recently"}
                    </span>
                    {gossip?.source && (
                      <span className="text-[11px] italic text-white/25">{gossip.source}</span>
                    )}
                  </div>
                  <p className="font-['Outfit'] text-[14px] text-white/60 leading-relaxed font-light mb-5">
                    {gossip?.excerpt || gossip?.headline}
                  </p>
                  {gossip?.tags && gossip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {gossip.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] rounded-full px-3 py-1 font-medium"
                          style={{
                            color: ACCENT,
                            background: `${ACCENT}10`,
                            border: `1px solid ${ACCENT}25`,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reaction bar */}
                  <div className="flex items-center gap-3 pb-5 border-b border-white/[0.06] flex-wrap">
                    {/* Fire */}
                    <button
                      onClick={handleFire}
                      disabled={loadingFire}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all select-none disabled:opacity-70"
                      style={{
                        background: firedByMe ? "rgba(232,69,69,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${firedByMe ? "rgba(232,69,69,0.4)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      {loadingFire ? (
                        <Loader2 size={15} className="animate-spin" style={{ color: "#e84545" }} />
                      ) : (
                        <span
                          style={{
                            fontSize: 16,
                            lineHeight: 1,
                            display: "inline-block",
                            filter: firedByMe ? "drop-shadow(0 0 5px #e84545)" : "none",
                            transform: firedByMe ? "scale(1.2)" : "scale(1)",
                            transition: "transform 0.15s, filter 0.15s",
                          }}
                        >
                          🔥
                        </span>
                      )}
                      <span
                        className="text-[12px] font-black tabular-nums"
                        style={{
                          color: firedByMe ? "#e84545" : "rgba(240,240,248,0.5)",
                        }}
                      >
                        {fmtCount(fireCount)}
                      </span>
                    </button>

                    {/* Shocked */}
                    <button
                      onClick={handleShocked}
                      disabled={loadingShocked}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all select-none disabled:opacity-70"
                      style={{
                        background: shockedByMe ? "rgba(245,197,24,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${shockedByMe ? "rgba(245,197,24,0.35)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      {loadingShocked ? (
                        <Loader2 size={15} className="animate-spin" style={{ color: "#f5c518" }} />
                      ) : (
                        <span
                          style={{
                            fontSize: 16,
                            lineHeight: 1,
                            display: "inline-block",
                            transform: shockedByMe ? "scale(1.2)" : "scale(1)",
                            transition: "transform 0.15s",
                          }}
                        >
                          😱
                        </span>
                      )}
                      <span
                        className="text-[12px] font-black tabular-nums"
                        style={{
                          color: shockedByMe ? "#f5c518" : "rgba(240,240,248,0.5)",
                        }}
                      >
                        {fmtCount(shockedCount)}
                      </span>
                    </button>

                    {/* Follow */}
                    {canShowFollow && (
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all select-none disabled:opacity-70"
                        style={{
                          background: isFollowing
                            ? "rgba(245,197,24,0.1)"
                            : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isFollowing ? "rgba(245,197,24,0.35)" : "rgba(255,255,255,0.07)"}`,
                        }}
                        title={isFollowing ? "Unfollow this user" : "Follow this user"}
                      >
                        {followLoading ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                            style={{ color: "#f5c518" }}
                          />
                        ) : isFollowing ? (
                          <UserCheck size={15} style={{ color: "#f5c518" }} />
                        ) : (
                          <UserPlus size={15} style={{ color: "rgba(240,240,248,0.5)" }} />
                        )}
                        <span
                          className="text-[12px] font-black"
                          style={{
                            color: isFollowing ? "#f5c518" : "rgba(240,240,248,0.5)",
                          }}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </span>
                      </button>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      {/* Share */}
                      <button
                        onClick={handleShare}
                        className="relative w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center hover:text-[#f5c518] text-white/40 transition-colors"
                      >
                        <Share2 size={15} />
                        {shareToast && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2ecc71] text-[#12121e] text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-10">
                            Copied!
                          </span>
                        )}
                      </button>

                      {/* Bookmark */}
                      <button
                        onClick={handleBookmark}
                        disabled={loadingBookmark}
                        className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center transition-all disabled:opacity-60"
                        style={{
                          color: bookmarked ? ACCENT : "rgba(240,240,248,0.4)",
                        }}
                      >
                        {loadingBookmark ? (
                          <Loader2 size={14} className="animate-spin" style={{ color: ACCENT }} />
                        ) : (
                          <Bookmark
                            size={15}
                            fill={bookmarked ? ACCENT : "none"}
                            color={bookmarked ? ACCENT : "rgba(240,240,248,0.4)"}
                            style={{
                              transform: bookmarked ? "scale(1.15)" : "scale(1)",
                              transition: "transform 0.15s",
                            }}
                          />
                        )}
                      </button>

                      {/* Report */}
                      {!isOwnGossip && gossip?.id && (
                        <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                          <ReportButton
                            moduleType="gossip"
                            targetId={String(gossip.id)}
                            targetUserId={gossip.owners_id ? String(gossip.owners_id) : undefined}
                            contentPreview={gossip.headline}
                            isLoggedIn={isLoggedIn}
                            size="sm"
                            variant="icon"
                          />
                        </div>
                      )}

                      {/* Delete (owner) */}
                      {isOwnGossip && (
                        <button
                          onClick={handleDeleteGossip}
                          disabled={deletingGossip}
                          className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-60"
                          title="Delete gossip"
                        >
                          {deletingGossip ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Comments */}
              {!editingGossip && (
                <div className="mt-5">
                  <h4 className="font-['Bebas_Neue'] text-[18px] tracking-widest text-white/50 uppercase mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-white/30" />
                    Comments
                    {!loadingComments && (
                      <span className="text-sm font-['Outfit'] font-normal ml-1 normal-case">
                        ({totalCommentCount})
                      </span>
                    )}
                    {loadingComments && (
                      <Loader2 size={14} className="animate-spin text-white/20 ml-1" />
                    )}
                  </h4>

                  <div className="mb-5">
                    <div className="flex gap-3">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment();
                          }
                        }}
                        placeholder={
                          isLoggedIn ? "Drop your take…" : "Sign in to join the conversation…"
                        }
                        rows={2}
                        disabled={postingComment}
                        onClick={() => {
                          if (!isLoggedIn)
                            requireAuth("Sign in to drop your take in the comments! 💬");
                        }}
                        readOnly={!isLoggedIn}
                        className="flex-1 rounded-[12px] p-[10px_14px] font-['Outfit'] text-[13px] text-[#f0f0f8] bg-white/[0.04] border border-white/[0.09] resize-none outline-none leading-relaxed disabled:opacity-50 transition-all cursor-text"
                        style={{
                          caretColor: ACCENT,
                          borderColor: !isLoggedIn ? "rgba(245,197,24,0.15)" : undefined,
                        }}
                      />
                      <button
                        onClick={handlePostComment}
                        disabled={!commentText.trim() || postingComment}
                        className="w-10 h-10 self-end rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                        style={{
                          background: commentText.trim() ? ACCENT : "rgba(255,255,255,0.06)",
                          color: commentText.trim() ? "#080810" : "rgba(240,240,248,0.3)",
                        }}
                      >
                        {postingComment ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                      </button>
                    </div>
                    {!isLoggedIn && (
                      <p className="text-[11px] text-white/25 mt-1.5 font-['Outfit'] text-center">
                        <button
                          className="text-[#f5c518] font-semibold hover:underline"
                          onClick={() =>
                            requireAuth("Sign in to drop your take in the comments! 💬")
                          }
                        >
                          Sign in
                        </button>{" "}
                        to comment, reply, react & save
                      </p>
                    )}
                  </div>

                  {loadingComments ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="p-4 rounded-[14px] border border-white/[0.06] bg-white/[0.02] animate-pulse"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 bg-white/[0.06] rounded w-24" />
                            <div className="h-3 bg-white/[0.04] rounded w-12 ml-auto" />
                          </div>
                          <div className="h-3 bg-white/[0.04] rounded w-full mb-1.5" />
                          <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-[12px] text-white/25 font-medium text-center py-6">
                      No comments yet. Be the first to spill the tea! ☕
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {comments.map((c) => (
                        <CommentNode
                          key={c.id}
                          comment={c}
                          depth={0}
                          parentName={null}
                          onReply={null}
                          onDelete={handleDeleteComment}
                          onEdit={setEditingComment}
                          editingComment={editingComment}
                          setEditingComment={setEditingComment}
                          savingEdit={savingEdit}
                          onSubmitEdit={handleEditComment}
                          expandedReplies={expandedReplies}
                          setExpandedReplies={setExpandedReplies}
                          requireAuth={requireAuth}
                          isLoggedIn={isLoggedIn}
                          inlineReplyId={inlineReplyId}
                          setInlineReplyId={setInlineReplyId}
                          onSubmitInlineReply={handleSubmitInlineReply}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GossipDetailModal;

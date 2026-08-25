import React, { useState, useEffect, useRef } from "react";
import { Loader2, Plus, MoreHorizontal, Pencil, Trash2, Check, X, Reply } from "lucide-react";
import { getComments, addComment, editComment, deleteComment } from "../services/feedService";
import { useToast } from "../../../shared/Toast";
import { useNavigate } from "react-router-dom";
import { ReportButton } from "../../Reports";

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

// ── 3-dot dropdown menu for comment owner ────────────────────────────────────
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
        className="w-6 h-6 rounded-full flex items-center justify-center text-[#f0f0f8]/30 hover:text-[#f0f0f8]/70 hover:bg-white/8 transition-all duration-150"
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Dropdown */}
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
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#e84545" }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

// ── Main CommentModal ─────────────────────────────────────────────────────────
export default function CommentModal({
  isOpen,
  onClose,
  postId,
  isLoggedIn,
  myProfile,
  onCountUpdate,
}) {
  const navigate = useNavigate();
  const toast = useToast();

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showAddComment, setShowAddComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // { id, text }
  const [savingEdit, setSavingEdit] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, name }
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }

  const refreshComments = async () => {
    const data = await getComments(postId);
    const list = Array.isArray(data) ? data : data?.comments || [];

    // Find total count: use API totalCount or calculate total comments including replies
    let count = typeof data === "object" && "totalCount" in data ? data.totalCount : 0;
    if (!count) {
      const countAll = (comments) => {
        let total = comments.length;
        comments.forEach((c) => {
          if (Array.isArray(c.replies)) {
            total += countAll(c.replies);
          }
        });
        return total;
      };
      count = countAll(list);
    }

    setTotalCount(count);
    setCommentsList(list);
    onCountUpdate?.(postId, count);
    return list;
  };

  useEffect(() => {
    if (!isOpen || !postId) {
      setCommentText("");
      setShowAddComment(false);
      setCommentsList([]);
      setEditingComment(null);
      setReplyingTo(null);
      return;
    }
    const load = async () => {
      setCommentsLoading(true);
      try {
        await refreshComments();
      } catch {
        setCommentsList([]);
      } finally {
        setCommentsLoading(false);
      }
    };
    load();
  }, [isOpen, postId]);

  useEffect(() => {
    if (!isOpen || !postId) return;
    const iv = setInterval(async () => {
      try {
        await refreshComments();
      } catch {}
    }, 15000);
    return () => clearInterval(iv);
  }, [isOpen, postId]);

  async function submitComment() {
    if (!commentText.trim() || !postId) return;
    setSubmittingComment(true);
    try {
      await addComment(postId, commentText.trim(), replyingTo?.id || null);
      toast.success("Comment added", null, 2000);
      setCommentText("");
      setShowAddComment(false);
      setReplyingTo(null);
      await refreshComments();
    } catch (err) {
      toast.error("Failed to add comment", err.message, 3000);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function submitEdit() {
    if (!editingComment?.text?.trim()) return;
    setSavingEdit(true);
    try {
      await editComment(editingComment.id, editingComment.text.trim());
      toast.success("Comment updated", null, 2000);
      setEditingComment(null);
      await refreshComments();
    } catch (err) {
      toast.error("Failed to update", err.message, 3000);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted", null, 2000);
      await refreshComments();
    } catch (err) {
      toast.error("Failed to delete", err.message, 3000);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#0d0d18] rounded-[20px] shadow-2xl ring-1 ring-white/10 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button
            onClick={onClose}
            className="text-[#f0f0f8]/60 hover:text-white font-['Outfit'] text-sm transition-colors"
          >
            Close
          </button>
          <span className="font-['Outfit'] text-sm font-bold text-white">
            Comments {totalCount > 0 && <span className="text-[#3b82f6]">({totalCount})</span>}
          </span>
          <div className="w-10" />
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-[#3b82f6] animate-spin" />
            </div>
          ) : commentsList.length === 0 ? (
            <div className="text-center py-10">
              <p className="font-['Outfit'] text-sm text-[#f0f0f8]/40">No comments yet</p>
              <p className="font-['Outfit'] text-xs text-[#f0f0f8]/25 mt-1">
                Be the first to comment
              </p>
            </div>
          ) : (
            (() => {
              const childrenMap = {};
              const allComments = [];

              const processComment = (c) => {
                // Prevent duplicates
                if (!allComments.some((item) => item.id === c.id)) {
                  allComments.push(c);
                }
                const parentId = c.parentId || c.parent_id;
                if (parentId) {
                  if (!childrenMap[parentId]) childrenMap[parentId] = [];
                  if (!childrenMap[parentId].some((child) => child.id === c.id)) {
                    childrenMap[parentId].push(c);
                  }
                }
                if (Array.isArray(c.replies)) {
                  c.replies.forEach((reply) => {
                    if (!reply.parentId && !reply.parent_id) {
                      reply.parentId = c.id;
                    }
                    processComment(reply);
                  });
                }
              };

              commentsList.forEach((c) => processComment(c));
              const rootComments = allComments.filter((c) => !(c.parentId || c.parent_id));

              // Count all descendants (nested replies) for a comment
              const countAllDescendants = (commentId) => {
                const directChildren = childrenMap[commentId] || [];
                let total = directChildren.length;
                directChildren.forEach((child) => {
                  total += countAllDescendants(child.id);
                });
                return total;
              };

              const renderCommentNode = (comment, depth = 0, parentName = null) => {
                const authorId = comment.author?.id || comment.user_id;
                const isOwner = myProfile && authorId === myProfile.id;
                const p = comment.author || comment.profiles || comment.user || {};
                const name =
                  p.displayName ||
                  p.display_name ||
                  p.username ||
                  p.name ||
                  authorId?.slice(0, 8) ||
                  "User";
                const avatarUrl = p.avatar || p.avatarUrl || p.avatar_url || null;
                const avatarColor = p.avatarColor || p.avatar_color || "#6366F1";
                const isEditing = editingComment?.id === comment.id;
                const replies = childrenMap[comment.id] || [];
                const hasReplies = replies.length > 0;
                const isExpanded = expandedReplies[comment.id] || false;
                const toggleReplies = () => {
                  setExpandedReplies((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }));
                };

                // Count all nested replies (not just direct children)
                const totalDescendants = countAllDescendants(comment.id);

                // Indentation increases with depth - cumulative margin
                const indentPixels = depth === 0 ? 0 : 32 + (depth - 1) * 16;
                const indentStyle = depth > 0 ? { marginLeft: `${indentPixels}px` } : {};

                return (
                  <div
                    key={comment.id}
                    className={`w-full relative ${depth === 0 ? "mb-3" : "mt-2"}`}
                  >
                    <div className="flex gap-3 relative" style={indentStyle}>
                      {depth > 0 && (
                        <div className="absolute -left-[18px] top-4 w-4 h-px bg-white/10" />
                      )}
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
                          name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-['Outfit'] text-xs font-bold text-[#f0f0f8]">
                              {name}
                            </span>
                            {isOwner && (
                              <span className="font-['Outfit'] text-[9px] px-1.5 py-0.5 rounded-full bg-[#3b82f6]/15 text-[#3b82f6] leading-none">
                                you
                              </span>
                            )}
                            <span className="font-['Outfit'] text-[10px] text-[#f0f0f8]/30">
                              {formatTimeAgo(comment.createdAt || comment.created_at)}
                            </span>
                          </div>
                          {/* 3-dot menu — only for owner */}
                          {isOwner && !isEditing && (
                            <CommentMenu
                              onEdit={() =>
                                setEditingComment({
                                  id: comment.id,
                                  text: comment.content || comment.comment_text,
                                })
                              }
                              onDelete={() => handleDelete(comment.id)}
                            />
                          )}
                        </div>

                        {/* Edit textarea */}
                        {isEditing ? (
                          <div className="mt-1.5 space-y-2">
                            <textarea
                              autoFocus
                              value={editingComment.text}
                              onChange={(e) =>
                                setEditingComment((prev) => ({ ...prev, text: e.target.value }))
                              }
                              rows={2}
                              className="w-full bg-white/5 border border-[#3b82f6]/40 rounded-lg p-2.5 outline-none resize-none font-['Outfit'] text-sm text-[#f0f0f8] leading-relaxed transition-colors"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={submitEdit}
                                disabled={savingEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3b82f6] text-white font-['Outfit'] text-xs font-bold hover:bg-[#2563eb] transition-colors disabled:opacity-50"
                              >
                                <Check size={11} /> {savingEdit ? "Saving…" : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingComment(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-[#f0f0f8]/60 font-['Outfit'] text-xs hover:bg-white/10 transition-colors"
                              >
                                <X size={11} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            {/* Show parent reference for replies */}
                            {parentName && (
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-['Outfit'] text-[11px] text-[#3b82f6]">
                                  Replying to <span className="font-semibold">{parentName}</span>
                                </span>
                              </div>
                            )}
                            <p className="font-['Outfit'] text-sm text-[#f0f0f8]/75 leading-relaxed break-words whitespace-pre-wrap">
                              {comment.content || comment.comment_text}
                            </p>
                            <div className="mt-1.5 flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setReplyingTo({ id: comment.id, name });
                                  setShowAddComment(true);
                                }}
                                className="flex items-center gap-1 text-[11px] font-['Outfit'] font-medium text-[#f0f0f8]/40 hover:text-[#3b82f6] transition-colors"
                              >
                                <Reply size={12} /> Reply
                              </button>
                              {/* Report this comment — only for non-owners */}
                              {!isOwner && (
                                <ReportButton
                                  moduleType="feed_comment"
                                  targetId={String(comment.id)}
                                  targetUserId={authorId ? String(authorId) : undefined}
                                  contentPreview={
                                    comment.content || comment.comment_text || comment.commentText
                                  }
                                  isLoggedIn={!!myProfile}
                                  size="sm"
                                  variant="icon"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Show/Hide Replies Button (YouTube style) - Show total descendants */}
                    {hasReplies && depth === 0 && (
                      <div className="mt-2" style={{ marginLeft: "44px" }}>
                        <button
                          onClick={toggleReplies}
                          className="flex items-center gap-2 text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-[#3b82f6]/20 flex items-center justify-center transition-transform ${isExpanded ? "rotate-180" : ""}`}
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

                    {/* Nested Replies - Only show if expanded (for root) or always for nested */}
                    {hasReplies && (depth > 0 || isExpanded) && (
                      <div className="w-full mt-1 relative">
                        {depth === 0 && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-white/10"
                            style={{ left: "19px" }}
                          />
                        )}
                        {replies.map((r) => renderCommentNode(r, depth + 1, name))}
                      </div>
                    )}
                  </div>
                );
              };

              return rootComments.map((c) => renderCommentNode(c, 0));
            })()
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t border-white/5 bg-[#12121e]/50">
          {!isLoggedIn ? (
            <div className="flex items-center justify-center gap-2 px-4 py-3">
              <span className="font-['Outfit'] text-xs text-[#f0f0f8]/40">
                Want to join the discussion?
              </span>
              <button
                onClick={() => navigate("/login")}
                className="font-['Outfit'] text-xs font-bold text-[#3b82f6] hover:underline"
              >
                Login
              </button>
            </div>
          ) : !showAddComment ? (
            <button
              onClick={() => setShowAddComment(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 font-['Outfit'] text-sm font-bold text-[#3b82f6] hover:bg-white/5 transition-colors"
            >
              <Plus size={18} /> Add Comment
            </button>
          ) : (
            <div className="p-4 space-y-3">
              {replyingTo && (
                <div className="flex items-center justify-between bg-[#3b82f6]/10 text-[#3b82f6] px-3 py-2 rounded-lg font-['Outfit'] text-xs">
                  <div className="flex items-center gap-2">
                    <Reply size={14} />
                    <span>
                      Replying to <strong>{replyingTo.name}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="hover:bg-[#3b82f6]/20 p-1 rounded-full text-[#3b82f6]/60 hover:text-[#3b82f6] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <textarea
                autoFocus
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                rows={3}
                className="w-full bg-white/5 border border-white/10 focus:border-[#3b82f6]/40 rounded-lg p-3 outline-none resize-none font-['Outfit'] text-sm text-[#f0f0f8] placeholder-white/30 leading-relaxed transition-colors"
              />
              <div className="flex items-center justify-between">
                <span className="font-['Outfit'] text-xs text-white/25">
                  {500 - commentText.length} left
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddComment(false);
                      setReplyingTo(null);
                    }}
                    className="px-4 py-1.5 rounded-full font-['Outfit'] text-xs font-bold text-[#f0f0f8]/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitComment}
                    disabled={!commentText.trim() || submittingComment}
                    className={`px-4 py-1.5 rounded-full font-['Outfit'] text-xs font-bold transition-all ${
                      commentText.trim() && !submittingComment
                        ? "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {submittingComment ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

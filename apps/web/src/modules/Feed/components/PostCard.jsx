import { useState, useRef, useEffect } from "react";
import {
  Bookmark,
  Trash2,
  MoreHorizontal,
  Star,
  MessageCircle,
  Share2,
  ChevronRight,
  Edit3,
  Loader2,
} from "lucide-react";
import FollowUnFollowToggleButton from "../../follow/components/FollowUnFollowToggleButton";
import { ReportButton } from "../../Reports";

const ACCENT = "#3b82f6";

export default function PostCard({
  post,
  onReact,
  onSave,
  onDelete,
  onShare,
  onViewProfile,
  onComment,
  onEdit,
  isOwner,
  currentUserId,
  isLoggedIn = false,
  onRequireAuth,
  loadingEmojiIdx = null,
}) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const POST_MENU = isOwner
    ? [
        ...(onEdit
          ? [
              {
                icon: <Edit3 size={14} />,
                label: "Edit Post",
                action: () => {
                  onEdit(post.id);
                  setMenuOpen(false);
                },
              },
            ]
          : []),
        ...(onDelete
          ? [
              {
                icon: <Trash2 size={14} />,
                label: "Delete Post",
                action: () => {
                  onDelete(post.id);
                  setMenuOpen(false);
                },
                danger: true,
              },
            ]
          : []),
      ]
    : [];

  return (
    <article className="bg-[#12121e] border-b border-white/5 p-4 pb-3 hover:bg-[#141428] transition-colors duration-150">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <button
          onClick={() => onViewProfile && onViewProfile(post.user, post.userId)}
          className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[13px] text-white flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          style={{
            background: post.gradient,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {post.avatarUrl ? (
            <img
              src={post.avatarUrl}
              alt={post.user}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            post.initials
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onViewProfile && onViewProfile(post.user, post.userId)}
              className="font-bold text-[13px] text-[#f0f0f8] hover:text-[#3b82f6] transition-colors cursor-pointer"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {post.user}
            </button>
            {post.role && (
              <span
                className="font-bold rounded-full px-2 text-[9px] uppercase tracking-wider"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: ACCENT,
                  background: `${ACCENT}18`,
                  border: `1px solid ${ACCENT}30`,
                }}
              >
                {post.role}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 mt-0.5 text-[11px] text-[#f0f0f8]/35"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span>{post.community}</span>
            <span className="text-white/10 opacity-50">·</span>
            <span>{post.timeAgo}</span>
          </div>
        </div>

        {/* Follow button - only for other users */}
        {!isOwner && post.userId && currentUserId && (
          <FollowUnFollowToggleButton
            targetUserId={post.userId}
            currentUserId={currentUserId}
            size="sm"
          />
        )}

        {/* Menu - only for owner */}
        {isOwner && POST_MENU.length > 0 && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-1.5 rounded-md transition-colors ${menuOpen ? "bg-white/5" : "bg-transparent"} text-[#f0f0f8]/45`}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute top-8 right-0 z-50 min-w-[196px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] py-1.5 overflow-hidden">
                {POST_MENU.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/5 ${item.danger ? "text-[#e84545]" : "text-[#f0f0f8]/85"}`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    <span
                      className={`flex-shrink-0 ${item.danger ? "text-[#e84545]" : "text-[#f0f0f8]/40"}`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.isSpoiler && !spoilerRevealed ? (
        <div
          onClick={() => setSpoilerRevealed(true)}
          className="bg-white/5 border border-white/10 rounded-xl p-3.5 mb-3 cursor-pointer text-center hover:bg-white/10 transition-colors"
        >
          <div
            className="font-bold text-[#f0f0f8]/50 text-[13px]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            🙈 Spoiler — tap to reveal
          </div>
        </div>
      ) : (
        <p
          className="text-[#f0f0f8]/85 text-sm font-light mb-3 leading-relaxed"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {post.content}
        </p>
      )}

      {/* Attached movie */}
      {post.attachedMovie && (
        <div className="flex items-center gap-3 bg-[#0d0d18] border border-white/10 rounded-xl p-2.5 mb-3 overflow-hidden hover:border-white/20 transition-all cursor-pointer">
          <img
            src={post.attachedMovie.image}
            alt={post.attachedMovie.title}
            className="w-10 h-14 object-cover rounded-lg flex-shrink-0 shadow-lg"
            loading="lazy"
            decoding="async"
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-[13px] text-[#f0f0f8] truncate"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {post.attachedMovie.title}
            </div>
            <div
              className="flex items-center gap-1.5 mt-1 font-bold text-[11px]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <div className="flex items-center gap-1 text-[#f5c518]">
                <Star size={10} fill="#f5c518" />
                <span>{post.attachedMovie.rating}</span>
              </div>
              <span className="text-white/10">·</span>
              <span className="text-[#f0f0f8]/40">{post.attachedMovie.year}</span>
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {post.attachedMovie.genre.map((g) => (
                <span
                  key={g}
                  className="text-[9px] font-bold text-[#f5c518] bg-[#f5c518]/10 border border-[#f5c518]/25 rounded-full px-2"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight size={14} className="text-[#f0f0f8]/25 mr-1" />
        </div>
      )}

      {/* Reactions */}
      <div className="flex gap-1.5 mb-2.5 overflow-x-auto scrollbar-none">
        {post.reactions.map((r, i) => {
          // Per-emoji glow color so each feels distinct
          const emojiColors = {
            "👍": "#3b82f6",
            "❤️": "#e84545",
            "🔥": "#f97316",
            "😱": "#f5c518",
          };
          const glowColor = emojiColors[r.emoji] || ACCENT;

          return (
            <button
              key={i}
              onClick={() => onReact(post.id, i)}
              disabled={loadingEmojiIdx !== null}
              className="flex items-center gap-1.5 px-2.5 rounded-full text-xs flex-shrink-0"
              style={{
                height: "30px",
                fontFamily: "'Outfit', sans-serif",
                background: "transparent",
                border: "none",
                color: r.reacted ? glowColor : "rgba(240,240,248,0.55)",
                fontWeight: r.reacted ? 700 : 400,
                transition: "all 0.15s ease",
                opacity: loadingEmojiIdx !== null && loadingEmojiIdx !== i ? 0.45 : 1,
                cursor: loadingEmojiIdx !== null ? "not-allowed" : "pointer",
              }}
            >
              {loadingEmojiIdx === i ? (
                <Loader2 size={13} className="animate-spin" style={{ color: glowColor }} />
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1,
                    display: "inline-block",
                    filter: r.reacted ? `drop-shadow(0 0 5px ${glowColor})` : "none",
                    transform: r.reacted ? "scale(1.25)" : "scale(1)",
                    transition: "transform 0.15s, filter 0.15s",
                  }}
                >
                  {r.emoji}
                </span>
              )}
              <span className="font-black tabular-nums">{r.count}</span>
            </button>
          );
        })}
      </div>

      {/* Action row */}
      <div className="flex border-t border-white/5 mt-1 pt-1">
        <button
          onClick={() => onComment && onComment(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-transparent border-none text-[#f0f0f8]/40 hover:text-[#f0f0f8]/70 transition-colors text-xs cursor-pointer"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <MessageCircle size={15} /> {post.comments > 0 ? post.comments : ""}
        </button>
        <button
          onClick={() => onShare && onShare(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-transparent border-none text-[#f0f0f8]/40 hover:text-[#f0f0f8]/70 transition-colors text-xs cursor-pointer"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <Share2 size={15} />
        </button>
        <button
          onClick={() => onSave(post.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 h-9 bg-transparent border-none text-xs cursor-pointer transition-all duration-200 ${post.saved ? "scale-110" : "scale-100"}`}
          style={{
            color: post.saved ? ACCENT : "rgba(240,240,248,0.4)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <Bookmark
            size={15}
            fill={post.saved ? ACCENT : "none"}
            color={post.saved ? ACCENT : "rgba(240,240,248,0.4)"}
            className="transition-all duration-200"
          />
        </button>
        {/* Report — only for non-owners */}
        {!isOwner && (
          <div className="flex-1 flex items-center justify-center h-9">
            <ReportButton
              moduleType="feed"
              targetId={String(post.id)}
              targetUserId={post.userId ? String(post.userId) : undefined}
              contentPreview={post.content}
              isLoggedIn={isLoggedIn}
              onRequireAuth={onRequireAuth}
              size="sm"
              variant="icon"
            />
          </div>
        )}
      </div>
    </article>
  );
}

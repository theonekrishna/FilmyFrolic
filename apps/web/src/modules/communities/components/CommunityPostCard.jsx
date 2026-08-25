import { useState } from "react";
import { MoreHorizontal, EyeOff, Eye } from "lucide-react";
import ReportButton from "../../Reports/components/ReportButton";

function CommunityPostCard({
  post,
  reactedIdxs = [],
  onReact = () => {},
  spoilerRevealed = false,
  onRevealSpoiler = () => {},
  onDelete = null,
  isOwner = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] px-[20px] py-[18px] transition-colors hover:border-[rgba(255,255,255,0.12)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-[14px]">
        <div className="flex items-center gap-[10px]">
          {post.userAvatar ? (
            <img
              src={post.userAvatar}
              alt={post.user}
              className="w-[40px] h-[40px] rounded-full flex-shrink-0 object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div
              className="w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center font-[Outfit] font-extrabold text-[13px] text-[#080810]"
              style={{ background: post.gradient }} // dynamic gradient - keep inline
            >
              {post.initials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-[7px]">
              <span className="font-[Outfit] text-[14px] font-semibold text-[#f0f0f8]">
                {post.user}
              </span>

              {post.role && (
                <span className="font-[Outfit] text-[9px] font-bold text-[#e84545] bg-[rgba(232,69,69,0.12)] border border-[rgba(232,69,69,0.25)] rounded-full px-[7px] py-[2px]">
                  {post.role}
                </span>
              )}
            </div>

            <span className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.3)]">
              {post.timeAgo}
            </span>
          </div>
        </div>

        {/* 3-dot menu - only for post owners */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-transparent border-none cursor-pointer p-[6px] rounded-[7px] text-[rgba(240,240,248,0.35)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#f0f0f8] transition"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-[4px] z-50 bg-[#1a1a2a] border border-[rgba(255,255,255,0.1)] rounded-[10px] p-[6px] min-w-[160px] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                {onDelete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.confirm("Are you sure you want to delete this post?")) {
                        onDelete(post.id);
                      }
                    }}
                    className="block w-full text-left bg-transparent border-none cursor-pointer font-[Outfit] text-[13px] text-[#e84545] px-[12px] py-[9px] rounded-[7px] hover:bg-[rgba(232,69,69,0.1)] transition"
                  >
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post content */}
      <div className="relative mb-[14px]">
        {post.isSpoiler && !spoilerRevealed ? (
          <div className="relative">
            <p className="font-[Outfit] text-[14px] text-[rgba(240,240,248,0.55)] leading-[1.65] m-0 blur-[5px] select-none">
              {post.content}
            </p>

            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,8,16,0.7)] rounded-[8px] backdrop-blur-[2px]">
              <button
                onClick={onRevealSpoiler}
                className="flex items-center gap-[8px] bg-[rgba(232,69,69,0.15)] border border-[rgba(232,69,69,0.35)] rounded-full px-[20px] py-[10px] cursor-pointer font-[Outfit] text-[13px] font-semibold text-[#e84545]"
              >
                <EyeOff size={14} />
                Spoiler — Click to reveal
              </button>
            </div>
          </div>
        ) : (
          <div>
            {post.isSpoiler && spoilerRevealed && (
              <div className="flex items-center gap-[6px] mb-[8px]">
                <Eye size={12} color="#e84545" />
                <span className="font-[Outfit] text-[11px] text-[#e84545] font-semibold">
                  Spoiler revealed
                </span>
              </div>
            )}

            <p className="font-[Outfit] text-[14px] text-[rgba(240,240,248,0.75)] leading-[1.65] m-0 font-light">
              {post.content}
            </p>

            {/* Attached images */}
            {(post.images?.length > 0 || post.mediaUrl) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(post.images || [post.mediaUrl]).filter(Boolean).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Attachment ${idx + 1}`}
                    className="max-h-[200px] max-w-full rounded-lg object-cover border border-white/[0.08]"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attached movie - Text only card */}
      {post.attachedMovie && (
        <div className="bg-[#0f0f1c] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-[12px] mb-[14px] cursor-pointer hover:border-[rgba(245,197,24,0.2)] transition">
          <div className="font-[Outfit] text-[13px] font-semibold text-[#f0f0f8] mb-[4px]">
            🎬 {post.attachedMovie.title}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)]">
              {post.attachedMovie.year}
            </span>
            <span className="text-[rgba(240,240,248,0.2)]">·</span>
            <span className="text-[#f5c518] text-[11px]">★ {post.attachedMovie.rating}/10</span>
          </div>
        </div>
      )}

      {/* Reactions & Actions */}
      <div className="flex items-center justify-between mb-[14px]">
        <div className="flex items-center gap-[6px] flex-wrap">
          {(() => {
            const defaultReactions = [
              { emoji: "👍", count: 0, reacted: false },
              { emoji: "❤️", count: 0, reacted: false },
              { emoji: "🔥", count: 0, reacted: false },
            ];
            const reactions =
              Array.isArray(post.reactions) && post.reactions.length > 0
                ? post.reactions
                : defaultReactions;
            return reactions;
          })().map((r, idx) => {
            const isActive = reactedIdxs.includes(idx);

            const adjustedCount = r.count + (isActive !== r.reacted ? (isActive ? 1 : -1) : 0);

            return (
              <button
                key={r.emoji}
                onClick={() => onReact(idx, r.emoji)}
                className={`flex items-center gap-[5px] rounded-full px-[11px] py-[5px] transition border ${
                  isActive
                    ? "bg-[rgba(232,69,69,0.1)] border-[rgba(232,69,69,0.4)]"
                    : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <span className="text-[14px]">{r.emoji}</span>

                <span
                  className={`font-[Outfit] text-[11px] font-semibold ${
                    isActive ? "text-[#e84545]" : "text-[rgba(240,240,248,0.5)]"
                  }`}
                >
                  {adjustedCount.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        <ReportButton
          moduleType="community_comment"
          targetId={String(post.id)}
          targetUserId={post.created_by}
          contentPreview={post.content?.substring(0, 50)}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}

export default CommunityPostCard;

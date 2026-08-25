const ACCENT = "#3b82f6";

import { Users, Check, Loader2 } from "lucide-react";

export default function MobileCommunityCard({
  community,
  joined,
  isJoining = false,
  onToggleJoin,
}) {
  return (
    <div className="mx-4 mb-3 bg-[#12121e] border border-white/[0.08] rounded-xl overflow-hidden cursor-pointer transition-colors duration-200 active:border-white/[0.18]">
      {/* Banner — 140px */}
      <div className="relative h-[140px] shrink-0">
        <img
          src={community.banner}
          alt={community.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,8,16,0.1)] to-[rgba(18,18,30,0.95)]" />

        {/* Trending / New badges */}
        <div className="absolute top-2 left-2 flex gap-[5px]">
          {community.isTrending && (
            <span className="bg-[rgba(232,69,69,0.88)] rounded-full px-2 py-0.5 font-[Outfit] text-[9px] font-bold text-white backdrop-blur-sm">
              🔥 TRENDING
            </span>
          )}
          {community.isNew && (
            <span className="rounded-full px-2 py-0.5 font-[Outfit] text-[9px] font-bold text-white backdrop-blur-sm bg-[#3b82f6]/80">
              ✨ NEW
            </span>
          )}
        </div>

        {/* Avatar — 40px, -20px overlap */}
        <div
          className="absolute -bottom-3 left-4 w-10 h-10 rounded-[10px] flex items-center justify-center text-lg border-2 border-[#12121e] shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
          style={{ background: community.avatarGradient }}
        >
          {community.avatarEmoji}
        </div>
      </div>

      {/* Content — 28px top padding to clear overlapping avatar */}
      <div className="px-4 pt-[26px] pb-3.5">
        {/* Name + member count row */}
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-[Outfit] text-[15px] font-bold text-[#f0f0f8] truncate">
              {community.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)] flex items-center gap-[3px]">
                <Users size={10} color="rgba(240,240,248,0.4)" />
                {community.members}
              </span>
              <span className="text-[rgba(240,240,248,0.18)] text-[10px]">·</span>
              <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)]">
                {community.postsToday} posts today
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="font-[Outfit] text-xs text-[rgba(240,240,248,0.45)] my-2 mb-2.5 leading-[1.55] font-light line-clamp-2">
          {community.description}
        </p>

        {/* Genre pills + Join button row */}
        <div className="flex items-center justify-between gap-2">
          {/* Genre pills */}
          <div className="flex gap-[5px] flex-wrap flex-1">
            {community.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="font-[Outfit] text-[9px] font-bold text-[#3b82f6] bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.28)] rounded-full px-2 py-[3px] tracking-wide"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleJoin(e);
              }}
              disabled={isJoining}
              className={`flex items-center gap-[5px] rounded-lg px-3.5 py-1.5 font-[Outfit] text-[11px] font-bold shrink-0 whitespace-nowrap transition-all duration-200 border-[1.5px] disabled:opacity-50 disabled:cursor-not-allowed ${
                joined
                  ? "bg-transparent text-[#3b82f6] border-[#3b82f6]"
                  : "bg-[#3b82f6] text-white border-[#3b82f6]"
              }`}
            >
              {isJoining ? (
                <Loader2 size={10} className="animate-spin" />
              ) : joined ? (
                <>
                  <Check size={10} strokeWidth={2.5} /> Joined
                </>
              ) : (
                "Join"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

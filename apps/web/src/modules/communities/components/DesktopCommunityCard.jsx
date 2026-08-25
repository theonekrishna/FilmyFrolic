const ACCENT = "#3b82f6";

import { Check, Loader2 } from "lucide-react";

export default function DesktopCommunityCard({
  community,
  joined,
  isJoining = false,
  onToggleJoin,
}) {
  return (
    <div className="bg-[#12121e] border border-white/[0.07] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col h-full hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="relative h-40 shrink-0">
        <img
          src={community.banner}
          alt={community.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(18,18,30,1)]" />

        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {community.isTrending && (
            <span className="bg-[rgba(232,69,69,0.85)] rounded-full px-2 py-[3px] font-[Outfit] text-[9px] font-bold text-white">
              🔥 TRENDING
            </span>
          )}
          {community.isNew && (
            <span className="rounded-full px-2 py-[3px] font-[Outfit] text-[9px] font-bold text-white bg-[#3b82f6]/80">
              ✨ NEW
            </span>
          )}
        </div>

        <div
          className="absolute -bottom-[22px] left-4 w-11 h-11 rounded-[10px] flex items-center justify-center text-xl border-2 border-[#12121e] shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-[1]"
          style={{ background: community.avatarGradient }}
        >
          {community.avatarEmoji}
        </div>
      </div>

      <div className="px-4 pt-7 pb-4 flex-1 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[Outfit] text-[15px] font-semibold text-[#f0f0f8] m-0 leading-tight">
            {community.name}
          </h3>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleJoin();
              }}
              disabled={isJoining}
              className={`rounded-lg px-3.5 py-1.5 font-[Outfit] text-[11px] font-bold shrink-0 flex items-center gap-[5px] transition-all duration-200 border disabled:opacity-50 disabled:cursor-not-allowed ${
                joined
                  ? "bg-transparent text-[#3b82f6] border-[#3b82f6]"
                  : "bg-[#3b82f6] text-white border-[#3b82f6]"
              }`}
            >
              {isJoining ? (
                <Loader2 size={11} className="animate-spin" />
              ) : joined ? (
                <>
                  <Check size={11} /> Joined
                </>
              ) : (
                "Join"
              )}
            </button>
          </div>
        </div>

        <p className="font-[Outfit] text-[13px] text-[rgba(240,240,248,0.45)] m-0 leading-normal font-light line-clamp-2">
          {community.description}
        </p>

        <div className="flex items-center gap-4">
          <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.4)] flex items-center gap-1">
            👥 {community.members}
          </span>
          <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.4)] flex items-center gap-1">
            📝 {community.postsToday} today
          </span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {community.genres.map((g) => (
            <span
              key={g}
              className="font-[Outfit] text-[10px] font-semibold text-[#3b82f6] bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.30)] rounded-full px-2 py-[3px]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

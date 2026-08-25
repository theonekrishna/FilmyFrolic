// ─── Mobile Daily Challenge Banner (100px, single row) ────────────────────────
import { Zap } from "lucide-react";

//constants
const GOLD = "#f5c518";

/**
 * @param {{ countdown: string, onPlay: () => void, game: Object|null, alreadyPlayed: boolean }} props
 */
function MobileDailyBanner({ countdown, onPlay, game, alreadyPlayed = false }) {
  const title = game?.title ?? "No Games Yet";
  const difficulty = game?.difficulty ?? "";

  // Difficulty badge color
  const diffColor =
    difficulty === "hard" ? "#ef4444" : difficulty === "medium" ? "#f59e0b" : "#22c55e";

  return (
    <div
      className="mx-4 mb-[14px] rounded-[14px] overflow-hidden border-[1.5px] animate-[ff-glow-pulse_3s_ease-in-out_infinite]"
      style={{
        background: "linear-gradient(135deg, rgba(245,197,24,0.10) 0%, rgba(249,115,22,0.07) 100%)",
        borderColor: "rgba(245,197,24,0.35)",
        boxShadow: "0 0 24px rgba(245,197,24,0.08)",
      }}
    >
      <div className="flex items-center h-[100px] px-[14px] gap-3">
        {/* Icon */}
        <div className="w-[46px] h-[46px] rounded-xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-[22px] shrink-0 overflow-hidden relative">
          <img
            src="/gameicon.gif"
            alt="Game Icon"
            className="absolute w-[160px] h-[160px] max-w-none object-cover mix-blend-screen pointer-events-none"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px] mb-[3px]">
            <span className="font-outfit text-[9px] font-extrabold text-orange-500 tracking-[1.5px]">
              DAILY CHALLENGE
            </span>
            {difficulty && (
              <span
                className="text-[8px] font-[700] tracking-[0.5px] rounded-full px-[6px] py-[1px]"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: `${diffColor}18`,
                  border: `1px solid ${diffColor}40`,
                  color: diffColor,
                }}
              >
                {difficulty.toUpperCase()}
              </span>
            )}
          </div>

          <div className="font-[Bebas_Neue] text-[17px] tracking-[1px] text-[#f0f0f8] leading-none mb-1 truncate">
            {title}
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-[5px]">
            <div className="w-[6px] h-[6px] rounded-full bg-[#e84545] shadow-[0_0_5px_#e84545] animate-[ff-glow-pulse_1s_infinite] shrink-0" />

            <span className="font-outfit text-[10px] text-white/40">
              Resets{" "}
              <span className="font-bold" style={{ color: GOLD }}>
                {countdown}
              </span>
            </span>
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={onPlay}
          disabled={!game}
          className="flex items-center gap-[5px] h-[38px] px-[14px] rounded-[10px] text-white text-[12px] font-bold font-outfit shrink-0 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: alreadyPlayed ? "rgba(255,255,255,0.1)" : "#f97316",
            boxShadow: alreadyPlayed ? "none" : "0 4px 14px rgba(249,115,22,0.4)",
          }}
        >
          {alreadyPlayed ? (
            <>✓ Done</>
          ) : (
            <>
              <Zap size={13} fill="#fff" color="#fff" />
              Play
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default MobileDailyBanner;

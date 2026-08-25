// ─── DailyChallengeBanner desktop ─────────────────────────────────────────────
//constants
const GOLD = "#f5c518";

/**
 * @param {{ countdown: string, onPlay: () => void, game: Object|null, gamesCount: number, alreadyPlayed: boolean }} props
 */
function DailyChallengeBanner({ countdown, onPlay, game, gamesCount = 0, alreadyPlayed = false }) {
  // Derive dynamic content from the game object
  const title = game?.title ?? "No Games Available";
  const description = game?.description ?? "Check back later for new challenges.";
  const difficulty = game?.difficulty ?? "";
  const questionCount = game?.games_questions?.length ?? gamesCount ?? "?";

  // Build a dynamic subtitle from game data
  const subtitle = `${title} — ${questionCount} Questions`;

  // Difficulty badge color
  const diffColor =
    difficulty === "hard" ? "#ef4444" : difficulty === "medium" ? "#f59e0b" : "#22c55e";

  return (
    <div
      className="relative rounded-[16px] overflow-hidden p-[20px_24px] animate-[ff-glow-pulse_3s_ease-in-out_infinite]"
      style={{
        background: "linear-gradient(135deg, rgba(245,197,24,0.1) 0%, rgba(249,115,22,0.08) 100%)",
        border: "1px solid rgba(245,197,24,0.3)",
      }}
    >
      <div className="flex items-center justify-between gap-[20px] flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-[10px]">
            <span className="text-[14px]">⚡</span>

            <span
              className="text-[11px] font-[800] tracking-[1.5px]"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "#f97316",
              }}
            >
              TODAY'S CHALLENGE
            </span>

            {difficulty && (
              <span
                className="text-[10px] font-[700] tracking-[1px] rounded-full px-2 py-[2px] ml-1"
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

          <h3
            className="text-[24px] tracking-[2px] text-[#f0f0f8] mb-[6px]"
            style={{
              fontFamily: "'Bebas Neue', cursive",
            }}
          >
            {subtitle}
          </h3>

          <p
            className="text-[13px] font-[300] mb-[14px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.5)",
            }}
          >
            {description}
          </p>

          <div className="flex items-center gap-[14px]">
            <button
              onClick={onPlay}
              disabled={!game}
              className="flex items-center gap-[7px] rounded-[9px] px-[22px] py-[10px] text-[13px] font-[700] text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: alreadyPlayed ? "rgba(255,255,255,0.1)" : "#f97316",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: alreadyPlayed ? "none" : "0 4px 16px rgba(249,115,22,0.4)",
              }}
            >
              {alreadyPlayed ? "✓ Played" : "▶ Play Now"}
            </button>

            <div className="flex items-center gap-[7px]">
              <div
                className="w-[7px] h-[7px] rounded-full animate-[ff-glow-pulse_1s_infinite]"
                style={{
                  background: "#e84545",
                  boxShadow: "0 0 6px #e84545",
                }}
              />

              <span
                className="text-[12px]"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "rgba(240,240,248,0.4)",
                }}
              >
                Resets in <span style={{ color: GOLD, fontWeight: 700 }}>{countdown}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty visual badge instead of hardcoded image */}
        <div
          className="w-[120px] h-[90px] rounded-[12px] overflow-hidden shrink-0 relative flex items-center justify-center"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: `linear-gradient(135deg, ${diffColor}15 0%, rgba(8,8,16,0.8) 100%)`,
          }}
        >
          <div className="flex flex-col items-center gap-1 relative w-full h-[60px] flex items-center justify-center">
            <img
              src="/gameicon.gif"
              alt="Game Icon"
              className="absolute w-[220px] h-[220px] max-w-none object-cover mix-blend-screen pointer-events-none"
            />
            {difficulty && (
              <span
                className="text-[10px] font-[700] tracking-[0.5px]"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: diffColor,
                }}
              >
                {difficulty.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyChallengeBanner;

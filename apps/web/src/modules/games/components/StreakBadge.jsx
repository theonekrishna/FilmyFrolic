// ─── StreakBadge (desktop ring version) ───────────────────────────────────────
//constants
const GOLD = "#f5c518";
const ACCENT = "#7c5cfc";

/**
 * Shows how many games the user has played out of total available.
 * @param {{ games: Array, gamesPlayed: number }} props
 */
function StreakBadge({ games = [], gamesPlayed = 0 }) {
  const total = games.length || 1;
  const pct = Math.min((gamesPlayed / total) * 100, 100);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const ringColor = pct >= 100 ? GOLD : ACCENT;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[110px] h-[110px]">
        <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />

          <circle
            cx="55"
            cy="55"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{
              filter: `drop-shadow(0 0 6px ${ringColor})`,
              transition: "stroke-dasharray 0.6s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px]">{pct >= 100 ? "🏆" : "🎮"}</span>
        </div>
      </div>

      <div className="text-center">
        <div
          className="leading-none"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 24,
            color: ringColor,
            letterSpacing: 2,
          }}
        >
          {gamesPlayed} / {total} Played
        </div>

        <div
          className="mt-[3px]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            color: "rgba(240,240,248,0.4)",
          }}
        >
          {pct >= 100
            ? "All games completed! 🎉"
            : `${total - gamesPlayed} ${total - gamesPlayed === 1 ? "game" : "games"} remaining`}
        </div>
      </div>
    </div>
  );
}

export default StreakBadge;

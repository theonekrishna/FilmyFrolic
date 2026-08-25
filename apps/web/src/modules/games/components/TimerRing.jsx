// ─── TimerRing ────────────────────────────────────────────────────────────────

// constants
const GOLD = "#f5c518";

function TimerRing({ timeLeft, total, size = 44 }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const pct = timeLeft / total;
  const color = timeLeft < 5 ? "#e84545" : timeLeft < 10 ? "#f97316" : GOLD;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
          style={{
            transition: "stroke-dasharray 0.9s linear, stroke 0.3s",
            filter: timeLeft < 5 ? "drop-shadow(0 0 4px #e84545)" : "none",
          }}
        />
      </svg>

      <div
        className="absolute inset-0 flex items-center justify-center tracking-[0.5px]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: size * 0.34,
          color,
        }}
      >
        {timeLeft}
      </div>
    </div>
  );
}

export default TimerRing;

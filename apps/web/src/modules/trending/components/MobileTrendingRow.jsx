import { Star } from "lucide-react";

import ChangePill from "./ChangePill";

// constants
const ACCENT = "#f5c518";
const RED = "#e84545";

// ─── Mobile trending row (compact) ───────────────────────────────────────────
export default function MobileTrendingRow({ movie, onPress }) {
  return (
    <div
      onClick={onPress}
      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
      style={{
        background: "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Rank */}
      <div className="flex-shrink-0 text-center" style={{ width: 28 }}>
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: movie.rank <= 3 ? 22 : 18,
            letterSpacing: 1,
            color: movie.rank <= 3 ? ACCENT : "rgba(240,240,248,0.25)",
            lineHeight: 1,
          }}
        >
          {movie.rank}
        </span>
      </div>

      {/* Change */}
      <ChangePill change={movie.change} />

      {/* Poster */}
      <img
        src={movie.image}
        alt={movie.title}
        className="flex-shrink-0 rounded-[7px]"
        style={{ width: 40, height: 54, objectFit: "cover" }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "#f0f0f8",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
        >
          {movie.title}
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={9} color={ACCENT} fill={ACCENT} />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: ACCENT,
            }}
          >
            {movie.rating.toFixed(1)}
          </span>
          <span style={{ color: "rgba(240,240,248,0.15)" }}>·</span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 10,
              color: "rgba(240,240,248,0.38)",
            }}
          >
            {movie.genre[0]}
          </span>
          {movie.hot && (
            <span
              style={{
                background: `${RED}18`,
                border: `1px solid ${RED}40`,
                borderRadius: 100,
                padding: "1px 6px",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 9,
                fontWeight: 700,
                color: RED,
              }}
            >
              🔥 Hot
            </span>
          )}
        </div>
      </div>

      {/* Views */}
      <div className="flex-shrink-0 text-right">
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 10,
            color: "rgba(240,240,248,0.28)",
          }}
        >
          {movie.views}
        </div>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 9,
            color: "rgba(240,240,248,0.2)",
          }}
        >
          views
        </div>
      </div>
    </div>
  );
}

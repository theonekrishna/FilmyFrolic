import { Star } from "lucide-react";

const ACCENT = "#f5c518";

// ─── Mobile top-3 spotlight card ─────────────────────────────────────────────
export default function MobileSpotlightCard({ movie, onPress }) {
  return (
    <div
      onClick={onPress}
      className="relative flex-shrink-0 rounded-[14px] overflow-hidden cursor-pointer"
      style={{
        width: 140,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Poster */}
      <img
        src={movie.image}
        alt={movie.title}
        className="w-full block"
        style={{ aspectRatio: "2/3", objectFit: "cover" }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Rank */}
      <div
        className="absolute top-[10px] left-[12px]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 42,
          color: movie.rank === 1 ? ACCENT : "rgba(240,240,248,0.25)",
          letterSpacing: 2,
          lineHeight: 1,
          textShadow: movie.rank === 1 ? `0 0 20px ${ACCENT}60` : "none",
        }}
      >
        #{movie.rank}
      </div>

      {/* #1 badge */}
      {movie.rank === 1 && (
        <div
          className="absolute top-[10px] right-[10px] rounded-[7px]"
          style={{
            background: ACCENT,
            padding: "3px 8px",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 8,
            fontWeight: 800,
            color: "#080810",
          }}
        >
          🔥 #1
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-[10px] left-[10px] right-[10px]">
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: "#f0f0f8",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            marginBottom: 4,
          }}
        >
          {movie.title}
        </div>
        <div className="flex items-center gap-1">
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
        </div>
      </div>
    </div>
  );
}

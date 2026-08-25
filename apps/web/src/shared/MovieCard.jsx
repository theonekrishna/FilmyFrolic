import { useState } from "react";
import { Heart, Star, Play } from "lucide-react";

const DIM = {
  sm: { width: 100, height: 150, titleSize: 11, stars: 8 },
  md: { width: 150, height: 220, titleSize: 13, stars: 10 },
  lg: { width: 180, height: 270, titleSize: 14, stars: 11 },
};

// ─── Shimmer keyframes injected once ──────────────────────────────────────────
const SHIMMER_CSS = `
@keyframes ff-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}`;
if (typeof document !== "undefined" && !document.getElementById("ff-shimmer-style")) {
  const s = document.createElement("style");
  s.id = "ff-shimmer-style";
  s.textContent = SHIMMER_CSS;
  document.head.appendChild(s);
}

// ─── Skeleton / Loading card ─────────────────────────────────────────────────

export function SkeletonCard({ size }) {
  const d = DIM[size];

  const shimmerStyle = {
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)",
    backgroundSize: "400px 100%",
    animation: "ff-shimmer 1.5s infinite linear",
  };

  return (
    <div className="flex-shrink-0" style={{ width: d.width }}>
      <div
        className="rounded-xl overflow-hidden"
        style={{ width: d.width, height: d.height, ...shimmerStyle }}
      />
      <div className="mt-2.5 rounded-lg" style={{ height: 12, width: "70%", ...shimmerStyle }} />
      <div className="mt-1.5 rounded-md" style={{ height: 10, width: "45%", ...shimmerStyle }} />
    </div>
  );
}

// ─── Error / fallback card ───────────────────────────────────────────────────
export function ErrorCard({ size }) {
  const d = DIM[size];

  return (
    <div className="flex-shrink-0" style={{ width: d.width }}>
      <div
        className="rounded-xl flex flex-col items-center justify-center gap-2.5"
        style={{
          width: d.width,
          height: d.height,
          background: "#12121e",
          border: "1px solid rgba(232,69,69,0.25)",
        }}
      >
        <span className="text-2xl">🎬</span>
        <span className="text-[11px] text-[rgba(240,240,248,0.3)] text-center px-3 font-outfit">
          Couldn't load poster
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SharedMovieCard({
  title = "Untitled",
  year,
  rating,
  imageUrl,
  size = "md",
  state = "default",
  wishlisted = false,
  onWishlist,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [hearted, setHearted] = useState(wishlisted);
  const [imgError, setImgError] = useState(false);

  const d = DIM[size];

  if (state === "loading") return <SkeletonCard size={size} />;
  if (state === "error" || imgError) return <ErrorCard size={size} />;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full max-w-[${d.width}px] flex-shrink-0 cursor-pointer select-none`}
    >
      {/* Poster */}
      <div
        className={`relative overflow-hidden rounded-xl bg-[#12121e] transition-transform duration-200`}
        style={{
          width: "100%",
          height: d.height,
          border: hovered ? "1px solid rgba(245,197,24,0.45)" : "1px solid rgba(255,255,255,0.07)",
          boxShadow: hovered
            ? "0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px rgba(245,197,24,0.15)"
            : "0 4px 20px rgba(0,0,0,0.6)",
          transform: hovered ? "scale(1.03)" : "scale(1)",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300`}
            style={{
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[#080810F5] to-transparent pointer-events-none" />

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setHearted((prev) => !prev);
            onWishlist?.();
          }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-opacity duration-200`}
          style={{
            background: hearted ? "rgba(232,69,69,0.85)" : "rgba(8,8,16,0.65)",
            border: `1px solid ${hearted ? "#e84545" : "rgba(255,255,255,0.18)"}`,
            backdropFilter: "blur(8px)",
            opacity: hovered || hearted ? 1 : 0,
          }}
        >
          <Heart
            size={12}
            color={hearted ? "#fff" : "#f0f0f8"}
            fill={hearted ? "#fff" : "transparent"}
            strokeWidth={hearted ? 2.5 : 1.8}
          />
        </button>

        {/* Play overlay */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#f5c518ea] shadow-[0_0_30px_rgba(245,197,24,0.45)]">
              <Play size={18} color="#080810" fill="#080810" />
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div
        className={`${d.titleSize} font-semibold text-[#f0f0f8] mt-2 leading-snug overflow-hidden line-clamp-2`}
      >
        {title}
      </div>

      {/* Year + rating */}
      <div className="flex items-center gap-1 mt-1">
        {year && (
          <span className="text-[11px] text-[rgba(240,240,248,0.4)] font-outfit">{year}</span>
        )}
        {rating !== undefined && (
          <>
            <span className="text-[10px] text-[rgba(240,240,248,0.2)]">·</span>
            <Star size={d.stars} color="#f5c518" fill="#f5c518" />
            <span className="text-[11px] font-bold text-[#f5c518]">{rating.toFixed(1)}</span>
          </>
        )}
      </div>
    </div>
  );
}

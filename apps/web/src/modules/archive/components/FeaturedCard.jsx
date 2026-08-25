import { Sparkles, Star, Play } from "lucide-react";
const ACCENT = "#f5c518";

function FeaturedCard({ movie, onClick }) {
  return (
    <div className="px-4 pb-[8px] mb-[8px]">
      <div
        onClick={onClick}
        className="relative w-full h-[220px] rounded-[20px] overflow-hidden cursor-pointer border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-yellow-400/20 hover:shadow-[0_12px_40px_rgba(245,197,24,0.15)] active:scale-[0.98] group"
      >
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,8,16,0.97) 0%, rgba(8,8,16,0.7) 40%, rgba(8,8,16,0.1) 70%, transparent 100%)",
          }}
        />

        <div
          className="absolute top-[16px] left-[16px] flex items-center gap-[6px] h-[30px] rounded-[8px] px-[12px] backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
          style={{ background: ACCENT, boxShadow: `0 2px 12px ${ACCENT}55` }}
        >
          <Sparkles size={12} color="#080810" />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "11px",
              fontWeight: 800,
              color: "#080810",
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            Featured
          </span>
        </div>

        <div
          className="absolute top-[14px] right-[16px] flex items-center gap-[5px] rounded-[10px] px-[11px] py-[5px] border border-[rgba(255,255,255,0.12)] backdrop-blur-md transition-all duration-300 group-hover:scale-105"
          style={{ background: "rgba(8,8,16,0.8)" }}
        >
          <Star size={11} color={ACCENT} fill={ACCENT} />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              color: ACCENT,
            }}
          >
            {movie.rating.toFixed(1)}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-[18px] flex items-end justify-between gap-[14px]">
          <div className="flex-1 min-w-0">
            <h3
              className="truncate transition-colors duration-300 group-hover:text-yellow-400"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "28px",
                letterSpacing: 1.6,
                color: "#f0f0f8",
                margin: "0 0 6px",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              {movie.title}
            </h3>

            <div className="flex items-center gap-[8px] flex-wrap">
              {movie.genre?.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="transition-all duration-300 hover:scale-105 hover:bg-white/20"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.7)",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {g}
                </span>
              ))}

              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 11,
                  color: "rgba(240,240,248,0.4)",
                }}
              >
                {movie.year}
              </span>

              {movie.duration && (
                <>
                  <span style={{ color: "rgba(240,240,248,0.2)", fontSize: 11 }}>·</span>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: "rgba(240,240,248,0.4)",
                    }}
                  >
                    {movie.duration}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center gap-[8px] h-[40px] px-[16px] rounded-full shrink-0 whitespace-nowrap transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(245,197,24,0.4)] active:scale-95 group"
            style={{
              background: ACCENT,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "#080810",
              boxShadow: `0 4px 16px ${ACCENT}55`,
              minHeight: "unset",
            }}
          >
            <Play size={13} color="#080810" fill="#080810" />
            Watch
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturedCard;

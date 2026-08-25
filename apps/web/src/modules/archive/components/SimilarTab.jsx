import { Star } from "lucide-react";

const ACCENT = "#f5c518";

export default function SimilarTab({ similar, navigate }) {
  return (
    <div>
      <h3
        className="mb-3.5 ml-4 text-[18px]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: 1.5,
          color: "#f0f0f8",
        }}
      >
        You might also like
      </h3>

      {/* Horizontal scroll 110×165px cards */}
      <div
        className="flex gap-2.5 px-4 py-2 overflow-x-auto scroll-snap-x mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {similar.map((m) => (
          <div
            key={m.id}
            onClick={() => navigate(`/content/movie/${m.id}`)}
            className="flex-shrink-0 cursor-pointer"
            style={{ width: 110, scrollSnapAlign: "start" }}
          >
            <div
              className="relative mb-1.5 rounded-[10px] overflow-hidden"
              style={{
                width: 110,
                height: 165,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(8,8,16,0.85) 0%, transparent 55%)",
                }}
              />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5">
                <Star size={8} color={ACCENT} fill={ACCENT} />
                <span
                  className="text-[9px] font-bold"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: ACCENT,
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {m.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div
              className="text-[11px] font-semibold overflow-hidden whitespace-nowrap text-ellipsis"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#f0f0f8" }}
            >
              {m.title}
            </div>
            <div
              className="text-[9px] mt-0.5"
              style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.35)" }}
            >
              {m.year}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

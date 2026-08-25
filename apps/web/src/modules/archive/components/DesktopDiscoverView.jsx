import { Star } from "lucide-react";
import { FILTERS } from "../data/archive";
const ACCENT = "#f5c518";

export default function DesktopDiscoverView({ movies, navigate, filter, setFilter, query }) {
  return (
    <div>
      <div className="pt-6 flex items-center gap-[10px]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="h-[36px] px-[20px] rounded-full text-[14px] cursor-pointer font-['Outfit'] transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              border:
                filter === f.value
                  ? `1.5px solid ${ACCENT}65`
                  : "1.5px solid rgba(255,255,255,0.12)",
              background: filter === f.value ? `${ACCENT}18` : "rgba(255,255,255,0.05)",
              fontWeight: filter === f.value ? 700 : 600,
              color: filter === f.value ? ACCENT : "rgba(240,240,248,0.6)",
              boxShadow: filter === f.value ? `0 0 16px ${ACCENT}35` : "none",
            }}
          >
            {f.label}
          </button>
        ))}

        <span className="ml-auto font-['Outfit'] text-[13px] text-[rgba(240,240,248,0.4)]">
          <span style={{ color: ACCENT, fontWeight: 600 }}>{movies.length}</span> titles
          {query && (
            <>
              {" "}
              · matching "<span className="text-[#f0f0f8] font-medium">{query}</span>"
            </>
          )}
        </span>
      </div>

      <div className="grid gap-[24px] pt-[28px] pb-[80px] [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/content/movie/${movie.id}`)}
            className="cursor-pointer group transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-full pb-[150%] rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.08)] mb-[12px] shadow-lg transition-all duration-300 group-hover:border-yellow-400/30 group-hover:shadow-[0_12px_40px_rgba(245,197,24,0.25)]">
              <img
                src={movie.image}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.7) 40%, transparent 70%)",
                }}
              />
              <div
                className="absolute bottom-[8px] left-[8px] flex items-center gap-[4px] backdrop-blur-sm rounded-full px-[8px] py-[2px] transition-all duration-300 group-hover:scale-105"
                style={{ background: "rgba(8,8,16,0.8)" }}
              >
                <Star size={10} color={ACCENT} fill={ACCENT} />
                <span className="font-['Outfit'] text-[11px] font-bold" style={{ color: ACCENT }}>
                  {movie.rating.toFixed(1)}
                </span>
              </div>

              {movie.badge && (
                <div
                  className="absolute top-[8px] right-[8px] rounded-[6px] px-[8px] py-[2px] text-[9px] font-bold text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
                  style={{ background: `${ACCENT}dd` }}
                >
                  {movie.badge}
                </div>
              )}
            </div>

            <div className="font-['Outfit'] text-[14px] font-semibold text-[#f0f0f8] overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-300 group-hover:text-yellow-400">
              {movie.title}
            </div>

            <div className="font-['Outfit'] text-[11px] text-[rgba(240,240,248,0.4)] mt-[3px]">
              {movie.genre?.[0] ? `${movie.year} · ${movie.genre[0]}` : movie.year}
            </div>
          </div>
        ))}

        {movies.length === 0 && (
          <div className="col-span-full text-center py-[64px] px-[24px] text-[rgba(240,240,248,0.3)] font-['Outfit'] text-[14px]">
            No titles found.
          </div>
        )}
      </div>
    </div>
  );
}

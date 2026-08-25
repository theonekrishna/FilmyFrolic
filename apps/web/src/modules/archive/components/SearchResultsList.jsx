import { Film } from "lucide-react";
const ACCENT = "#f5c518";

export default function SearchResultsList({ results, query, navigate }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-15 gap-3">
        <Film size={40} color="rgba(240,240,248,0.12)" />
        <div className="font-['Bebas Neue'] text-[22px] tracking-[1.5px] text-[rgba(240,240,248,0.35)] text-center">
          No results for "{query}"
        </div>
        <div className="font-['Outfit'] text-[13px] text-[rgba(240,240,248,0.25)] text-center">
          Try a different title, actor, or genre
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-5 gap-5">
      <div className="px-4 pb-2 text-[12px] font-['Outfit'] text-[rgba(240,240,248,0.3)]">
        <span className="font-semibold" style={{ color: ACCENT }}>
          {results.length}
        </span>{" "}
        result{results.length !== 1 ? "s" : ""} for{" "}
        <span className="text-[rgba(240,240,248,0.6)] font-medium">"{query}"</span>
      </div>

      {results.map((movie) => (
        <div
          key={movie.id}
          onClick={() => navigate(`/content/movie/${movie.id}`)}
          className="flex items-center gap-3 h-18 px-4 cursor-pointer border-b border-[rgba(255,255,255,0.04)] last:border-none transition-colors duration-150 hover:bg-[rgba(255,255,255,0.03)]"
          onTouchStart={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          onTouchEnd={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div className="w-15 h-15 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(255,255,255,0.08)]">
            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-['Outfit'] text-[14px] font-semibold text-[#f0f0f8] truncate mb-1">
              {movie.title}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap overflow-hidden text-[11px] text-[rgba(240,240,248,0.38)]">
              <span className="flex-shrink-0">{movie.year}</span>
              {movie.genre?.[0] && (
                <>
                  <span className="flex-shrink-0 text-[rgba(240,240,248,0.18)]">·</span>
                  <span className="truncate">{movie.genre[0]}</span>
                </>
              )}
              {movie.duration && (
                <>
                  <span className="flex-shrink-0 text-[rgba(240,240,248,0.18)]">·</span>
                  <span className="flex-shrink-0">{movie.duration}</span>
                </>
              )}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
            style={{
              background: `${ACCENT}12`,
              border: `1px solid ${ACCENT}28`,
            }}
          >
            <div
              className="font-['Bebas Neue'] text-[17px] tracking-[0.5px] leading-none"
              style={{ color: ACCENT }}
            >
              {movie.rating.toFixed(1)}
            </div>
            <div className="font-['Outfit'] text-[8px] text-[rgba(240,240,248,0.3)] leading-[1.2]">
              /5
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

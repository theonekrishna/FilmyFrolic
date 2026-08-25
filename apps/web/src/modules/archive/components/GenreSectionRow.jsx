import { ChevronRight, Star } from "lucide-react";
const ACCENT = "#f5c518";

export default function GenreSectionRow({ genre, movies, navigate }) {
  if (movies.length === 0) return null;

  return (
    <section className="pt-[24px]">
      <div className="flex items-center justify-between px-4 mb-[14px]">
        <div className="flex items-center gap-3">
          <span className="text-[18px]">🎬</span>
          <h3 className="font-['Bebas_Neue'] text-[20px] tracking-[1.5px] text-[#f0f0f8] leading-none">
            {genre}
          </h3>
          <div
            className="w-[6px] h-[6px] rounded-full mb-[2px] animate-pulse"
            style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
          />
        </div>

        <button
          onClick={() => navigate(`/content/archive`)}
          className="flex items-center gap-[3px] font-['Outfit'] text-[13px] font-semibold cursor-pointer py-[4px] px-3 rounded-full transition-all duration-300 hover:bg-yellow-400/10 hover:scale-105 active:scale-95"
          style={{ color: ACCENT }}
        >
          More
          <ChevronRight size={14} color={ACCENT} />
        </button>
      </div>

      <div className="ff-hscroll flex gap-[14px] px-4 pt-[8px] pb-[16px] snap-x snap-mandatory">
        {movies.slice(0, 8).map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/content/movie/${movie.id}`)}
            className="w-[110px] flex-shrink-0 cursor-pointer snap-start transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative w-[110px] h-[165px] rounded-[14px] overflow-hidden border border-[rgba(255,255,255,0.07)] mb-[10px] shadow-lg transition-all duration-300 hover:border-yellow-400/30 hover:shadow-[0_8px_25px_rgba(245,197,24,0.2)]">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(8,8,16,0.85) 0%, transparent 55%)",
                }}
              />
              <div
                className="absolute bottom-[10px] left-[10px] flex items-center gap-[4px] backdrop-blur-sm rounded-full px-[8px] py-[2px]"
                style={{ background: "rgba(8,8,16,0.8)" }}
              >
                <Star size={10} color={ACCENT} fill={ACCENT} />
                <span
                  className="font-['Outfit'] text-[11px] font-bold"
                  style={{
                    color: ACCENT,
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {movie.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="font-['Outfit'] text-[13px] font-semibold text-[#f0f0f8] leading-[1.3] overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-300 hover:text-yellow-400">
              {movie.title}
            </div>
            <div className="font-['Outfit'] text-[11px] text-[rgba(240,240,248,0.35)] mt-[4px]">
              {movie.year}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

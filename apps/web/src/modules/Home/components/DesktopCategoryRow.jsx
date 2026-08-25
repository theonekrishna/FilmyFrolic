import { Star, ChevronRight } from "lucide-react";

export default function DesktopCategoryRow({
  title,
  movies = [],
  badge,
  badgeColor = "#f5c518",
  navigate,
  onSeeAll,
}) {
  const safeMovies = Array.isArray(movies) ? movies : [];

  return (
    <section className="mb-0">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bebas text-[20px] md:text-[22px] tracking-[2px] text-[#f0f0f8]">
            {title}
          </h3>

          {badge && (
            <span
              className="text-[10px] font-bold uppercase rounded-full px-[10px] py-[2px]"
              style={{
                color: badgeColor,
                background: `${badgeColor}18`,
                border: `1px solid ${badgeColor}40`,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <button
          onClick={onSeeAll ?? (() => navigate("/content/archive"))}
          className="flex items-center gap-[3px] text-[#f5c518] text-xs font-semibold"
        >
          See All <ChevronRight size={13} />
        </button>
      </div>

      <div className="px-4 md:px-8">
        <div
          className="
            flex gap-4
            overflow-x-auto
            scroll-smooth
            snap-x snap-mandatory
            pt-1 pb-3
            scrollbar-hide
            cursor-grab active:cursor-grabbing
          "
        >
          {safeMovies.map((movie) => {
            if (!movie || !movie.id) return null;

            const rating =
              typeof movie.rating === "number" && !Number.isNaN(movie.rating) ? movie.rating : 0;

            return (
              <div
                key={movie.id}
                onClick={() => navigate(`/content/movie/${movie.id}`)}
                className="
                  w-[130px] md:w-[170px]
                  shrink-0 cursor-pointer snap-start
                  transition-all duration-300 ease-out
                  hover:scale-[1.06]
                  hover:-translate-y-1
                "
              >
                <div
                  className="
                    relative w-[130px] md:w-[170px]
                    h-[195px] md:h-[255px]
                    rounded-xl overflow-hidden mb-2
                    border border-white/[0.08]
                    transition-all duration-300
                    hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]
                    bg-white/5
                  "
                >
                  {movie.image && (
                    <img
                      src={movie.image}
                      alt={movie.title ?? ""}
                      className="
                        w-full h-full object-cover
                        transition-transform duration-500
                        hover:scale-110
                      "
                    />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,16,0.85)_0%,transparent_55%)]" />

                  <div className="absolute bottom-2 left-2 flex items-center gap-[4px] bg-black/60 rounded-[6px] px-[8px] py-[3px]">
                    <Star size={10} color="#f5c518" fill="#f5c518" />
                    <span className="text-[11px] font-bold text-[#f5c518]">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  {movie.type === "Series" && (
                    <div className="absolute top-[8px] left-[8px] bg-black/70 rounded-[6px] px-[7px] py-[2px] text-[9px] font-bold text-white backdrop-blur">
                      Series
                    </div>
                  )}
                </div>

                <div className="text-[12px] md:text-[13px] font-semibold text-white truncate transition-colors duration-300 hover:text-[#f5c518]">
                  {movie.title ?? "Untitled"}
                </div>

                <div className="text-[10px] text-white/40 mt-[2px]">{movie.year ?? ""}</div>
              </div>
            );
          })}

          {safeMovies.length === 0 && (
            <div className="text-white/30 text-xs py-6">No titles found.</div>
          )}
        </div>
      </div>
    </section>
  );
}

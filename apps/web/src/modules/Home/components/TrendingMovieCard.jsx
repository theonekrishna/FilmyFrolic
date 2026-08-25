import { Heart, Star } from "lucide-react";

export default function TrendingMovieCard({ movie, navigate, liked, setLiked }) {
  const isLiked = liked.has(movie.id);

  return (
    <div
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
          rounded-[12px] overflow-hidden mb-2
          border border-white/[0.08]
          transition-all duration-300
          hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]
        "
      >
        <img
          src={movie.image}
          alt={movie.title}
          className="
            w-full h-full object-cover
            transition-transform duration-500
            hover:scale-110
          "
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,16,0.85)_0%,transparent_55%)]" />

        {movie.badge && (
          <div className="absolute top-[8px] left-[8px] bg-[rgba(232,69,69,0.9)] rounded-[6px] px-[7px] py-[2px] text-[9px] font-bold text-white backdrop-blur">
            {movie.badge}
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-[4px] bg-black/60 rounded-[6px] px-[8px] py-[3px]">
          <Star size={10} color="#f5c518" fill="#f5c518" />
          <span className="text-[11px] font-bold text-[#f5c518]">{movie.rating.toFixed(1)}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((prev) => {
              const next = new Set(prev);
              next.has(movie.id) ? next.delete(movie.id) : next.add(movie.id);
              return next;
            });
          }}
          className="
            absolute top-[8px] right-[8px]
            w-8 h-8 rounded-full
            bg-black/60 flex items-center justify-center
            backdrop-blur
            transition-transform duration-300
            hover:scale-125
          "
        >
          <Heart
            size={14}
            color={isLiked ? "#e84545" : "rgba(240,240,248,0.75)"}
            fill={isLiked ? "#e84545" : "none"}
          />
        </button>
      </div>

      <div className="text-[12px] md:text-[13px] font-semibold text-white truncate transition-colors duration-300 hover:text-[#f5c518]">
        {movie.title}
      </div>

      <div className="text-[10px] text-white/40 mt-[2px]">{movie.year}</div>
    </div>
  );
}

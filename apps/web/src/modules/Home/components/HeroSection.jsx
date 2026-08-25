import { Star, Clock } from "lucide-react";

export default function HeroSection({ movie }) {
  if (!movie) return null;

  const rating = typeof movie.rating === "number" && !Number.isNaN(movie.rating) ? movie.rating : 0;

  return (
    <div className="relative w-full h-[240px] md:h-[520px] overflow-hidden select-none">
      {/* Background */}
      {movie.image && (
        <img
          src={movie.image}
          alt={movie.title ?? ""}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/95 via-[#080810]/55 to-transparent" />

      {/* Bottom Fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-4 md:px-12 pb-6 md:pb-0 z-10">
        {movie.badge && (
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1 mb-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold text-red-500 tracking-widest uppercase">
              {movie.badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-[32px] md:text-[64px] tracking-[3px] text-[#f0f0f8] leading-[0.95] drop-shadow-xl font-bold">
          {movie.title ?? "Untitled"}
        </h2>

        {/* Meta Row */}
        <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap text-sm">
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <Star size={12} fill="#f5c518" />
            {rating.toFixed(1)}
          </div>

          <span className="text-white/20">·</span>

          <span className="text-white/60 text-xs">{movie.year ?? ""}</span>

          {movie.duration && (
            <>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Clock size={11} />
                {movie.duration}
              </div>
            </>
          )}

          {movie.genre?.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[11px] text-white/60 border border-white/20 bg-white/10 px-2 py-[2px] rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Description */}
        {movie.description && (
          <p className="text-sm text-white/60 max-w-[480px] line-clamp-2 mb-5 hidden sm:block">
            {movie.description}
          </p>
        )}
      </div>
    </div>
  );
}

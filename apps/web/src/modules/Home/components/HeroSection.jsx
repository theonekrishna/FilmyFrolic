import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSection({ movie, movies = [] }) {
  const navigate = useNavigate();
  const slideList = movies && movies.length > 0 ? movies : movie ? [movie] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 4 seconds unless hovered
  useEffect(() => {
    if (slideList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slideList.length, isPaused]);

  if (slideList.length === 0) return null;

  const currentMovie = slideList[currentIndex] || slideList[0];
  const rating =
    typeof currentMovie.rating === "number" && !Number.isNaN(currentMovie.rating)
      ? currentMovie.rating
      : 0;

  const handleBannerClick = () => {
    if (currentMovie.id) {
      navigate(`/content/movie/${currentMovie.id}`);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleBannerClick}
      className="relative w-full h-[260px] md:h-[520px] overflow-hidden select-none cursor-pointer group"
    >
      {/* Background Image Slides */}
      {slideList.map((m, idx) => (
        <div
          key={m.id || idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {m.image && (
            <img
              src={m.image}
              alt={m.title ?? ""}
              draggable={false}
              className="w-full h-full object-cover object-top"
            />
          )}
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080810]/95 via-[#080810]/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/50 to-transparent z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-4 md:px-12 pb-8 md:pb-0 z-20 pointer-events-none">
        {currentMovie.badge && (
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1 mb-3 w-fit">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold text-red-500 tracking-widest uppercase">
              {currentMovie.badge}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-[28px] md:text-[56px] tracking-[2px] text-[#f0f0f8] leading-[0.95] drop-shadow-xl font-bold font-['Bebas_Neue',sans-serif]">
          {currentMovie.title ?? "Untitled"}
        </h2>

        {/* Meta Row */}
        <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap text-sm font-['Outfit',sans-serif]">
          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <Star size={12} fill="#f5c518" />
            {rating.toFixed(1)}
          </div>

          <span className="text-white/20">·</span>
          <span className="text-white/60 text-xs">{currentMovie.year ?? ""}</span>

          {currentMovie.duration && (
            <>
              <span className="text-white/20">·</span>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Clock size={11} />
                {currentMovie.duration}
              </div>
            </>
          )}

          {currentMovie.genre?.slice(0, 2).map((g) => (
            <span
              key={g}
              className="text-[11px] text-white/60 border border-white/20 bg-white/10 px-2 py-[2px] rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Description */}
        {currentMovie.description && (
          <p className="text-sm text-white/60 max-w-[520px] line-clamp-2 mb-5 hidden sm:block font-['Outfit',sans-serif]">
            {currentMovie.description}
          </p>
        )}
      </div>

      {/* Manual Slide Arrows (visible on hover) */}
      {slideList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? slideList.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hidden md:block"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % slideList.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 border border-white/10 text-white/70 hover:text-white hover:bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hidden md:block"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Dots / Indicators */}
      {slideList.length > 1 && (
        <div className="absolute bottom-4 right-4 md:right-12 z-30 flex items-center gap-2">
          {slideList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-7 bg-yellow-400" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

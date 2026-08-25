import { Trash2, Play, Star, CheckCircle } from "lucide-react";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";

export default function MobileWatchlistCard({
  movie,
  isWatched,
  onMarkWatched,
  onRemove,
  onPress,
}) {
  return (
    <div
      onClick={onPress}
      className="flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors"
      onTouchStart={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Poster */}
      <div className="relative shrink-0">
        <img
          src={movie.image}
          alt={movie.title}
          className={`w-[60px] h-[82px] object-cover rounded-[10px] block ${
            isWatched ? "brightness-75" : ""
          }`}
        />

        {isWatched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center"
              style={{ background: `${ACCENT}cc` }}
            >
              <CheckCircle size={14} color="#080810" />
            </div>
          </div>
        )}

        {movie.type === "series" && !isWatched && (
          <div className="absolute top-[5px] left-[5px] bg-[rgba(124,92,252,0.9)] rounded-[5px] px-[5px] py-[2px] text-[7px] font-bold text-white">
            TV
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div
          className={`font-semibold text-[13px] truncate ${
            isWatched ? "text-[rgba(240,240,248,0.5)]" : "text-[#f0f0f8]"
          }`}
        >
          {movie.title}
        </div>

        <div className="flex items-center gap-1.5">
          <Star size={9} color={GOLD} fill={GOLD} />

          <span className="text-[10px] font-bold" style={{ color: GOLD }}>
            {movie.rating.toFixed(1)}
          </span>

          <span className="text-[rgba(240,240,248,0.2)]">·</span>

          <span className="text-[10px] text-[rgba(240,240,248,0.4)]">{movie.year}</span>

          <span className="text-[rgba(240,240,248,0.2)]">·</span>

          <span className="text-[10px] text-[rgba(240,240,248,0.4)]">{movie.genre[0]}</span>
        </div>

        {/* Action Row */}
        <div className="flex gap-1.5 mt-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkWatched();
            }}
            className={`flex items-center gap-1 h-6 px-2.5 rounded-full text-[9px] font-bold border ${
              isWatched
                ? "text-[#1fd1a8] border-[#1fd1a845] bg-[#1fd1a818]"
                : "text-[rgba(240,240,248,0.5)] border-white/10 bg-white/5"
            }`}
          >
            <CheckCircle size={9} />
            {isWatched ? "Watched" : "Mark"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-[rgba(232,69,69,0.08)] border border-[rgba(232,69,69,0.2)]"
          >
            <Trash2 size={10} color="#e84545" />
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 h-6 px-2.5 rounded-full text-[9px] font-extrabold"
            style={{ background: GOLD, color: "#080810" }}
          >
            <Play size={8} fill="#080810" color="#080810" />
            {isWatched ? "Rewatch" : "Watch"}
          </button>
        </div>
      </div>
    </div>
  );
}

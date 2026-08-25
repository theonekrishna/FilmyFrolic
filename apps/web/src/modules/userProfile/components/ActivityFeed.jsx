import { Star, Clock } from "lucide-react";
import { ACTIVITY } from "../data/userprofile";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";

export default function ActivityFeed() {
  const typeColor = (t) => (t === "review" ? ACCENT : t === "watchlist" ? GOLD : "#e84545");

  const typeLabel = (t) =>
    t === "review" ? "Reviewed" : t === "watchlist" ? "Added to Watchlist" : "Liked";
  return (
    <div className="flex flex-col gap-[10px]">
      {ACTIVITY.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-[14px] bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] px-[16px] py-[13px] cursor-pointer transition-colors duration-[180ms]"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${ACCENT}25`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
        >
          <img
            src={a.image}
            alt={a.movie}
            className="w-[46px] h-[62px] object-cover rounded-[8px] shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[6px] mb-[4px] flex-wrap">
              <span
                className="font-[Outfit] text-[11px] font-[700] px-[8px] py-[2px] rounded-[100px]"
                style={{
                  color: typeColor(a.type),
                  background: `${typeColor(a.type)}15`,
                }}
              >
                {typeLabel(a.type)}
              </span>
            </div>

            <div className="font-[Outfit] text-[13px] font-[600] text-[#f0f0f8] overflow-hidden whitespace-nowrap text-ellipsis">
              {a.movie}
            </div>

            {a.rating !== undefined && (
              <div className="flex items-center gap-[2px] mt-[4px]">
                {Array.from({ length: 10 }).map((_, j) => (
                  <Star
                    key={j}
                    size={9}
                    color={j < a.rating ? GOLD : "rgba(240,240,248,0.1)"}
                    fill={j < a.rating ? GOLD : "transparent"}
                  />
                ))}

                <span className="font-[Outfit] text-[10px] text-[GOLD] font-[700] ml-[4px]">
                  {a.rating}/10
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-[4px] shrink-0">
            <Clock size={10} color="rgba(240,240,248,0.3)" />

            <span className="font-[Outfit] text-[10px] text-[rgba(240,240,248,0.3)]">
              {a.timeAgo}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

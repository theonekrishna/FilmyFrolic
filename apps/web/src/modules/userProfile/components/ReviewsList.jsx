import { Star, MessageSquare, Heart } from "lucide-react";
import { REVIEWS } from "../../Home/data/movies";
const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";

export default function ReviewsList() {
  return (
    <div className="flex flex-col gap-[12px]">
      {REVIEWS.slice(0, 5).map((r) => (
        <div
          key={r.id}
          className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[18px] cursor-pointer transition-colors duration-[180ms]"
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${ACCENT}20`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
        >
          <div className="flex items-center gap-[10px] mb-[10px] flex-wrap">
            <span className="font-[Outfit] text-[13px] font-[700] flex-1" style={{ color: ACCENT }}>
              {r.movie}
            </span>

            <div className="flex gap-[2px]">
              {Array.from({ length: 10 }).map((_, j) => (
                <Star
                  key={j}
                  size={9}
                  color={j < r.rating ? GOLD : "rgba(240,240,248,0.1)"}
                  fill={j < r.rating ? GOLD : "transparent"}
                />
              ))}
            </div>

            <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)]">
              {r.timeAgo}
            </span>
          </div>

          <p
            className="font-[Outfit] text-[13px] text-[rgba(240,240,248,0.65)] mb-[10px] leading-[1.6] font-[300] overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {r.text}
          </p>

          <div className="flex gap-[14px]">
            <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)] flex items-center gap-[4px]">
              <Heart size={11} /> {r.likes.toLocaleString()}
            </span>

            <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)] flex items-center gap-[4px]">
              <MessageSquare size={11} /> {r.comments}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

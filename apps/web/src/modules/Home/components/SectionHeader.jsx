import { ChevronRight } from "lucide-react";

export default function SectionHeader({
  title,
  badge,
  badgeColor = "#f5c518",
  onSeeAll,
  padH = 16,
}) {
  const padClass = padH === 32 ? "px-8" : "px-4";

  return (
    <div className={`ff-section-header flex items-center justify-between mb-3 ${padClass}`}>
      <div className="flex items-center gap-[9px]">
        <h3 className="ff-section-title font-bebas text-[22px] md:text-[22px] tracking-[2px] text-[#f0f0f8] leading-none m-0">
          {title}
        </h3>

        {badge && (
          <span
            className="font-outfit text-[10px] font-bold uppercase rounded-full px-[9px] py-[2px] tracking-[0.4px]"
            style={{
              color: badgeColor,
              background: `${badgeColor}18`,
              border: `1px solid ${badgeColor}35`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="font-outfit flex items-center gap-[3px] text-[12px] font-semibold text-[#f5c518] bg-transparent border-none cursor-pointer py-1"
        >
          See All
          <ChevronRight size={13} color="#f5c518" />
        </button>
      )}
    </div>
  );
}

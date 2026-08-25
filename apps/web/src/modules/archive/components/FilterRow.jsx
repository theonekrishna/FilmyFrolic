import { SlidersHorizontal } from "lucide-react";
import { FILTERS } from "../data/archive";
const ACCENT = "#f5c518";

function FilterRow({ active, onSelect }) {
  return (
    <div className="ff-hscroll flex gap-[8px] px-4 py-[12px] shrink-0">
      {FILTERS.map((f) => {
        const isActive = active === f.value;

        return (
          <button
            key={f.value}
            onClick={() => onSelect(f.value)}
            className="ff-badge h-[32px] px-[16px] rounded-full shrink-0 whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              border: `1.5px solid ${isActive ? `${ACCENT}65` : "rgba(255,255,255,0.1)"}`,
              background: isActive ? `${ACCENT}15` : "rgba(255,255,255,0.04)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "13px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? ACCENT : "rgba(240,240,248,0.55)",
              boxShadow: isActive ? `0 0 12px ${ACCENT}30` : "none",
            }}
          >
            {f.label}
          </button>
        );
      })}

      <div
        className="w-[1px] h-[32px] shrink-0 self-center mx-[4px]"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />

      <button
        className="ff-badge flex items-center gap-[6px] h-[32px] px-[14px] rounded-full shrink-0 whitespace-nowrap cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/10 active:scale-95"
        style={{
          border: "1.5px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          color: "rgba(240,240,248,0.55)",
        }}
      >
        <SlidersHorizontal
          size={12}
          color="rgba(240,240,248,0.5)"
          className="transition-transform duration-300 hover:rotate-90"
        />
        Sort
      </button>
    </div>
  );
}

export default FilterRow;

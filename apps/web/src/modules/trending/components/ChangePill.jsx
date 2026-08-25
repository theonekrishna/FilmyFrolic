import { ChevronUp, ChevronDown, Minus } from "lucide-react";

//constants
const RED = "#e84545";

// ─── Change pill ──────────────────────────────────────────────────────────────
export default function ChangePill({ change }) {
  const up = change.startsWith("+");
  const down = change.startsWith("-");
  const col = up ? "#2ecc71" : down ? RED : "rgba(240,240,248,0.3)";
  const Icon = up ? ChevronUp : down ? ChevronDown : Minus;

  return (
    <div className="flex items-center gap-[2px] flex-shrink-0 min-w-[30px]">
      <Icon size={13} color={col} strokeWidth={2.5} />
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: col,
        }}
      >
        {change === "—" ? "" : change.replace(/[+-]/, "")}
      </span>
    </div>
  );
}

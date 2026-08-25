// ─── AnswerButton (shared, adapts height via prop) ────────────────────────────
import { useState } from "react";

function AnswerButton({ label, state, onSelect, height = 52 }) {
  const [hovered, setHovered] = useState(false);

  // States: default, selected, correct, wrong, reveal
  const isDefault = state === "default";
  const isSelected = state === "selected";
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const isReveal = state === "reveal";

  // Background colors
  const bg = isCorrect
    ? "rgba(34,197,94,0.20)" // Green for correct
    : isWrong
      ? "rgba(239,68,68,0.20)" // Red for wrong
      : isSelected
        ? "rgba(124,92,252,0.25)" // Purple for selected
        : isReveal
          ? "rgba(255,255,255,0.03)"
          : hovered
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.04)";

  // Border colors
  const border = isCorrect
    ? "#22c55e" // Green
    : isWrong
      ? "#ef4444" // Red
      : isSelected
        ? "#7c5cfc" // Purple accent
        : isReveal
          ? "rgba(255,255,255,0.08)"
          : hovered
            ? "rgba(124,92,252,0.5)"
            : "rgba(255,255,255,0.10)";

  // Text colors
  const textColor = isCorrect
    ? "#22c55e" // Green
    : isWrong
      ? "#ef4444" // Red
      : isSelected
        ? "#7c5cfc" // Purple
        : isReveal
          ? "rgba(240,240,248,0.4)"
          : "#f0f0f8";

  // Icons
  const getIcon = () => {
    if (isCorrect) return "✓";
    if (isWrong) return "✗";
    if (isSelected) return "●";
    return null;
  };

  const icon = getIcon();

  return (
    <button
      onClick={onSelect}
      disabled={!isDefault && !isSelected}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between w-full px-[18px] rounded-[12px] transition-all duration-200"
      style={{
        height: height,
        border: `2px solid ${border}`,
        background: bg,
        cursor: isDefault || isSelected ? "pointer" : "default",
        boxShadow: isSelected
          ? `0 0 15px ${border}40`
          : isCorrect
            ? `0 0 10px ${border}30`
            : "none",
      }}
    >
      <span
        className="text-left font-semibold"
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 14,
          color: textColor,
        }}
      >
        {label}
      </span>

      {icon && (
        <span
          className="flex-shrink-0 leading-none"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: isSelected ? 16 : 22,
            color: textColor,
            fontWeight: "bold",
          }}
        >
          {icon}
        </span>
      )}
    </button>
  );
}

export default AnswerButton;

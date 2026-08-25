import { useState, useCallback, memo } from "react";
import { ChevronRight } from "lucide-react";

const SettingsRow = memo(function SettingsRow({
  title,
  label, // Alias for title used in some provided snippets
  description,
  desc, // Alias for description
  value,
  action,
  onClick,
  danger = false,
  border = true,
  children,
}) {
  const [hovered, setHovered] = useState(false);
  const displayLabel = label || title;
  const displayDesc = desc || description;

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const stopPropagation = useCallback((e) => e.stopPropagation(), []);

  const content = (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: danger ? "#e84545" : "#f0f0f8",
            marginBottom: displayDesc ? 3 : 0,
          }}
        >
          {displayLabel}
        </div>
        {displayDesc && (
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.38)",
              fontWeight: 300,
            }}
          >
            {displayDesc}
          </div>
        )}
      </div>
      <div onClick={stopPropagation} style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {value && (
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.35)",
            }}
          >
            {value}
          </span>
        )}
        {action || children}
        {onClick && <ChevronRight size={14} color="rgba(240,240,248,0.25)" />}
      </div>
    </>
  );

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "17px 22px",
        gap: 16,
        cursor: onClick ? "pointer" : "default",
        background: onClick && hovered ? "rgba(255,255,255,0.025)" : "transparent",
        borderBottom: border ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "background 0.15s",
      }}
    >
      {content}
    </div>
  );
});

export default SettingsRow;

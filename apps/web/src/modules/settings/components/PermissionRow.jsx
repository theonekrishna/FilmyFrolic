import { memo } from "react";
import { User, Check } from "lucide-react";

const PermissionRow = memo(function PermissionRow({
  label,
  desc,
  options,
  value,
  onChange,
  icon,
  accent = "#3b82f6",
}) {
  const IconComponent = icon || User;
  return (
    <div style={{ padding: "18px 22px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${accent}15`,
            border: `1px solid ${accent}28`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComponent size={16} color={accent} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#f0f0f8",
              marginBottom: 3,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.38)",
              fontWeight: 300,
            }}
          >
            {desc}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 100,
              background: opt === value ? `${accent}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${opt === value ? `${accent}50` : "rgba(255,255,255,0.08)"}`,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              fontWeight: opt === value ? 700 : 400,
              color: opt === value ? accent : "rgba(240,240,248,0.5)",
              cursor: "pointer",
              transition: "all 0.18s",
              outline: "none",
            }}
          >
            {opt === value && (
              <Check size={11} color={accent} style={{ marginRight: 4, display: "inline" }} />
            )}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
});

export default PermissionRow;

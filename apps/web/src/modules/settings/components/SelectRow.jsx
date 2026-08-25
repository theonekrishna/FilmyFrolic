import { useState, useCallback, memo } from "react";
import { ChevronDown, Check } from "lucide-react";

const ACCENT = "#1fd1a8";

const SelectRow = memo(function SelectRow({ label, options, value, onChange, border = true }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (opt) => {
      onChange(opt);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div
      style={{
        position: "relative",
        borderBottom: border ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyBetween: "space-between",
          padding: "17px 22px",
          gap: 16,
          cursor: "pointer",
        }}
        onClick={toggleOpen}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#f0f0f8",
            flex: 1,
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.45)",
            }}
          >
            {value}
          </span>
          <ChevronDown
            size={13}
            color="rgba(240,240,248,0.3)"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </div>
      {open && (
        <div
          style={{
            background: "#1a1a2a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            margin: "0 12px 12px",
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                cursor: "pointer",
                background: opt === value ? `${ACCENT}10` : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (opt !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (opt !== value) e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  color: opt === value ? ACCENT : "rgba(240,240,248,0.6)",
                }}
              >
                {opt}
              </span>
              {opt === value && <Check size={13} color={ACCENT} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default SelectRow;

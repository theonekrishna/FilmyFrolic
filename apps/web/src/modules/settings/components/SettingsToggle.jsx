import { memo } from "react";

const ACCENT = "#1fd1a8";

const SettingsToggle = memo(function SettingsToggle({ value, onChange, accent = ACCENT }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 100,
        background: value ? accent : "rgba(255,255,255,0.1)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.25s",
        flexShrink: 0,
        border: `1px solid ${value ? accent : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
});

export default SettingsToggle;

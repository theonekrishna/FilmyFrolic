import { memo } from "react";

const SettingsCard = memo(function SettingsCard({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div
          style={{
            padding: "10px 22px 6px",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(240,240,248,0.25)",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default SettingsCard;

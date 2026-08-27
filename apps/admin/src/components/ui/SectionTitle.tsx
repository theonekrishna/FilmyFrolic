import React from "react";

interface SectionTitleProps {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, sub, action }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${A}18`,
            border: `1px solid ${A}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: A,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <h1
            style={{
              fontFamily: B,
              fontSize: 24,
              letterSpacing: 2,
              color: "#f0f0f8",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {sub && (
            <p
              style={{
                fontFamily: F,
                fontSize: 12,
                color: "rgba(240,240,248,0.45)",
                margin: "3px 0 0",
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
};

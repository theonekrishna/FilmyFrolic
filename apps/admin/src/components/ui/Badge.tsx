import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "info" | "neutral";
  color?: string;
  size?: "sm" | "md";
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  color,
  size = "md",
}) => {
  const getColors = () => {
    if (color) {
      return { bg: `${color}15`, border: `${color}30`, text: color };
    }
    switch (variant) {
      case "success":
        return { bg: "rgba(0,184,148,0.15)", border: "rgba(0,184,148,0.3)", text: "#00b894" };
      case "danger":
        return { bg: "rgba(232,69,69,0.15)", border: "rgba(232,69,69,0.3)", text: "#e84545" };
      case "warning":
        return { bg: "rgba(253,203,110,0.15)", border: "rgba(253,203,110,0.3)", text: "#fdcb6e" };
      case "info":
        return { bg: "rgba(9,132,227,0.15)", border: "rgba(9,132,227,0.3)", text: "#0984e3" };
      case "neutral":
        return {
          bg: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          text: "rgba(240,240,248,0.6)",
        };
      case "primary":
      default:
        return { bg: "rgba(108,92,231,0.15)", border: "rgba(108,92,231,0.3)", text: "#6c5ce7" };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 100,
        padding: size === "sm" ? "2px 8px" : "4px 10px",
        fontFamily: F,
        fontSize: size === "sm" ? 10 : 11,
        fontWeight: 700,
        color: colors.text,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};

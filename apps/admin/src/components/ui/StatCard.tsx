import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon,
  color = "#6c5ce7",
  trend,
}) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: B,
            fontSize: 13,
            letterSpacing: 1.5,
            color: "rgba(240,240,248,0.5)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: B,
            fontSize: 28,
            letterSpacing: 1,
            color: "#f0f0f8",
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          {value}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {sub && (
            <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.38)" }}>
              {sub}
            </span>
          )}

          {trend !== undefined && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontFamily: F,
                fontSize: 11,
                fontWeight: 700,
                color: trend >= 0 ? "#00b894" : "#e84545",
              }}
            >
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

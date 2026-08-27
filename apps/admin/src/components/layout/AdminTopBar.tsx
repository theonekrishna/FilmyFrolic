import React from "react";
import { Menu, ChevronRight, Globe, Lock } from "lucide-react";
import { authService } from "../../services/auth/authService";

interface AdminTopBarProps {
  sectionLabel: string;
  onMenu: () => void;
  onNav?: () => void;
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const A = "#6c5ce7";
const RED = "#e84545";

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ sectionLabel, onMenu, onNav }) => {
  const handleViewSite = () => {
    if (onNav) {
      onNav();
      return;
    }
    const env = (import.meta as any).env;
    const siteUrl = env?.VITE_CLIENT_URL || "https://filmy-frolic-new-frontend.onrender.com";
    window.open(siteUrl, "_blank");
  };

  return (
    <div
      style={{
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        gap: 14,
        background: "#09090f",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <button
        onClick={onMenu}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "rgba(240,240,248,0.5)",
          display: "flex",
          padding: 4,
          minHeight: "unset",
        }}
      >
        <Menu size={18} />
      </button>

      <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.25)" }}>Admin</span>
      <ChevronRight size={12} color="rgba(240,240,248,0.2)" />
      <span
        style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "rgba(240,240,248,0.75)" }}
      >
        {sectionLabel}
      </span>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            background: `${A}15`,
            border: `1px solid ${A}30`,
            borderRadius: 100,
            padding: "3px 12px",
            fontFamily: F,
            fontSize: 11,
            fontWeight: 700,
            color: A,
          }}
        >
          ⬡ ADMIN CONSOLE
        </span>

        <button
          onClick={handleViewSite}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "6px 12px",
            fontFamily: F,
            fontSize: 12,
            color: "rgba(240,240,248,0.75)",
            cursor: "pointer",
            minHeight: "unset",
          }}
        >
          <Globe size={13} /> View Site ↗
        </button>

        <button
          onClick={() => authService.logout()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(232,69,69,0.1)",
            border: "1px solid rgba(232,69,69,0.25)",
            borderRadius: 8,
            padding: "6px 12px",
            fontFamily: F,
            fontSize: 12,
            color: RED,
            cursor: "pointer",
            minHeight: "unset",
          }}
        >
          <Lock size={13} /> Logout
        </button>
      </div>
    </div>
  );
};

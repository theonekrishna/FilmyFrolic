import React from "react";
import { Shield, Lock } from "lucide-react";
import { Section, ADMIN_NAV_ITEMS } from "../../constants/adminNavigation";
import { authService } from "../../services/auth/authService";

interface AdminSidebarProps {
  section: Section;
  onSection: (s: Section) => void;
  collapsed: boolean;
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";
const RED = "#e84545";
const GOLD = "#fdcb6e";

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ section, onSection, collapsed }) => {
  const adminUser = authService.getAdminUser();

  return (
    <aside
      style={{
        width: collapsed ? 0 : 230,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#09090f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.25s",
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: "16px 16px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg,${A},#5e3fd8)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: `0 4px 14px ${A}35`,
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: B,
                fontSize: 15,
                letterSpacing: 2,
                color: "#f0f0f8",
                lineHeight: 1.1,
              }}
            >
              FILMY FROLIC
            </div>
            <div
              style={{ fontFamily: F, fontSize: 10, color: A, fontWeight: 700, letterSpacing: 1.5 }}
            >
              ADMIN PANEL
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = item.id === section;
          return (
            <button
              key={item.id}
              onClick={() => onSection(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: active ? `${A}15` : "transparent",
                border: active ? `1px solid ${A}25` : "1px solid transparent",
                borderRadius: 10,
                marginBottom: 2,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) =>
                !active &&
                ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")
              }
              onMouseLeave={(e) =>
                !active && ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
            >
              <span style={{ color: active ? A : "rgba(240,240,248,0.38)", flexShrink: 0 }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? A : "rgba(240,240,248,0.6)",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {item.label}
              </span>
              {item.badge !== undefined && (
                <span
                  style={{
                    background: RED,
                    borderRadius: 100,
                    padding: "1px 7px",
                    fontFamily: F,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Fixed Profile Card Pinned At Bottom */}
      <div
        style={{
          padding: "12px 10px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          whiteSpace: "nowrap",
          flexShrink: 0,
          background: "#09090f",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg,${GOLD},${RED})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: B,
              fontSize: 13,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {adminUser.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: F,
                fontSize: 12,
                fontWeight: 600,
                color: "#f0f0f8",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {adminUser.name}
            </div>
            <div
              style={{
                fontFamily: F,
                fontSize: 10,
                color: "rgba(240,240,248,0.35)",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {adminUser.email}
            </div>
          </div>
          <button
            onClick={() => authService.logout()}
            title="Sign Out"
            style={{
              background: "rgba(232,69,69,0.12)",
              border: "1px solid rgba(232,69,69,0.25)",
              borderRadius: 8,
              padding: "6px 8px",
              color: RED,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(232,69,69,0.25)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(232,69,69,0.12)")
            }
          >
            <Lock size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

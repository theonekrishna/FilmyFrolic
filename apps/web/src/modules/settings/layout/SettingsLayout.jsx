import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Bell, Layers, ShieldAlert, Info, ChevronLeft, FileText } from "lucide-react";

export default function SettingsLayout() {
  const navigate = useNavigate();
  const ACCENT = "#1fd1a8";

  const SETTINGS_GROUPS = [
    {
      id: "account",
      label: "Account",
      icon: User,
      accent: ACCENT,
      desc: "Profile, avatar, password, connected accounts",
      path: "/settings/account",
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Bell,
      accent: "#f5c518",
      desc: "Notifications, spoilers, language",
      path: "/settings/preferences",
    },

    {
      id: "privacy",
      label: "Privacy",
      icon: ShieldAlert,
      accent: "#3b82f6",
      desc: "Who can follow & view your data",
      path: "/settings/privacy",
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      accent: "#94a3b8",
      desc: "App version, policies, contribute",
      path: "/settings/about",
    },

    //policies adding into this group
    {
      id: "policies",
      label: "Policies",
      icon: FileText,
      accent: "#8b5cf6",
      desc: "Terms, privacy & community guidelines",
      path: "/settings/policies",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-[#f0f0f8]">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "30px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={18} color="rgba(240,240,248,0.5)" />
        </button>
        <div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 28,
              letterSpacing: 3,
              margin: 0,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              color: "rgba(240,240,248,0.3)",
              margin: "4px 0 0",
              fontWeight: 300,
            }}
          >
            Manage your Filmy Frolic experience
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 p-8 pt-6 gap-10">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-[320px] shrink-0">
          <div
            style={{
              background: "#12121e",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16,
              padding: "12px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {SETTINGS_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <NavLink
                  key={group.id}
                  to={group.path}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    background: isActive ? `${group.accent}15` : "transparent",
                    border: `1px solid ${isActive ? `${group.accent}30` : "transparent"}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: isActive ? "transparent" : "rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color={isActive ? group.accent : "rgba(240,240,248,0.3)"} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Bebas Neue', cursive",
                            fontSize: 16,
                            letterSpacing: 1,
                            color: isActive ? group.accent : "#f0f0f8",
                          }}
                        >
                          {group.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 11,
                            color: "rgba(240,240,248,0.25)",
                            marginTop: 1,
                          }}
                        >
                          {group.desc}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

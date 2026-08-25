import { NavLink, useLocation } from "react-router-dom";
import { Search, Bell, Menu } from "lucide-react";
import SearchBar from "../shared/SearchBar";
import UserAvatar from "../shared/UseAvatar";
import { useNotifications } from "../context/NotificationContext";

// ─── Accent by module route ───────────────────────────────────────────────────
function getModuleAccent(pathname) {
  if (pathname.startsWith("/entertain")) return "#7c5cfc";
  if (pathname.startsWith("/social")) return "#3b82f6";
  if (pathname.startsWith("/user")) return "#1fd1a8";
  if (pathname.startsWith("/content")) return "#f5c518";
  return "#e84545"; // CORE / Home
}

function fireSidebarToggle() {
  window.dispatchEvent(new CustomEvent("ff-toggle-sidebar"));
}

// ─── Core/TopBar ─────────────────────────────────────────────────────────────
export default function TopBar({ title, subtitle }) {
  const location = useLocation();
  const accent = getModuleAccent(location.pathname);
  const { totalUnread } = useNotifications();

  return (
    <>
      <header className="h-[56px] bg-[rgba(8,8,16,0.92)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.07)] flex items-center px-4 gap-[10px] sticky top-0 z-40">
        {/* ── Desktop: hamburger toggle ── */}
        <button
          className="ff-topbar-hamburger w-[36px] h-[36px] rounded-[10px] bg-transparent border border-[rgba(255,255,255,0.08)] flex items-center justify-center cursor-pointer shrink-0 p-0 transition"
          onClick={fireSidebarToggle}
          title="Toggle sidebar"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Menu size={16} color="rgba(240,240,248,0.6)" />
        </button>

        {/* ── Mobile logo ── */}
        <NavLink
          to="/"
          className="ff-topbar-mobile-logo hidden items-center gap-2 no-underline shrink-0"
        >
          <div
            className="w-[32px] h-[32px] rounded-[9px] flex items-center justify-center text-[16px] shrink-0"
            style={{
              background: "linear-gradient(135deg, #f5c518, #e84545)",
              boxShadow: "0 2px 10px rgba(245,197,24,0.3)",
            }}
          >
            🎬
          </div>
          <span
            className="font-['Bebas_Neue'] text-[18px] tracking-[2px] leading-none"
            style={{
              color: "#f5c518",
              textShadow: "0 0 20px rgba(245,197,24,0.3)",
            }}
          >
            Filmy Frolic
          </span>
        </NavLink>

        {/* ── Page title (optional) ── */}
        {title && (
          <div className="shrink-0">
            <h1
              className="font-['Bebas_Neue'] text-[20px] tracking-[1.5px] leading-none m-0"
              style={{ color: "#f0f0f8" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="font-['Outfit'] text-[11px] m-0 leading-[1.3] font-light whitespace-nowrap"
                style={{ color: "rgba(240,240,248,0.38)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* ── Desktop: centered SearchBar ── */}
        <div className="ff-topbar-search flex-1 flex justify-center max-w-[480px] mx-auto">
          <SearchBar placeholder="Search movies, actors, shows…" />
        </div>

        {/* ── Mobile flex spacer ── */}
        <div className="ff-topbar-spacer hidden flex-1"></div>

        {/* ── Right action cluster ── */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile: search icon button */}
          <button
            className="ff-topbar-mobile-search-btn hidden w-[40px] h-[40px] rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] flex items-center justify-center cursor-pointer p-0 flex-shrink-0 transition hover:bg-[rgba(255,255,255,0.1)]"
            aria-label="Search"
          >
            <Search size={17} color="rgba(240,240,248,0.7)" />
          </button>

          {/* Notification bell */}
          <NavLink
            to="/notifications"
            aria-label="Notifications"
            className="no-underline flex-shrink-0"
            onClick={() => window.dispatchEvent(new Event("ff-notifications-visited"))}
          >
            <div className="relative w-[40px] h-[40px] rounded-[12px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center cursor-pointer transition hover:bg-[rgba(255,255,255,0.09)]">
              <Bell size={17} color="rgba(240,240,248,0.7)" />
              {totalUnread > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-[3px] rounded-full flex items-center justify-center text-[9px] font-extrabold text-white leading-none"
                  style={{ background: "#e84545", boxShadow: "0 0 6px rgba(232,69,69,0.6)" }}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
          </NavLink>

          {/* Desktop: Avatar */}
          <NavLink to="/user/profile" className="ff-topbar-avatar no-underline flex-shrink-0">
            <UserAvatar name="John Doe" size="sm" status="online" accentColor={accent} />
          </NavLink>
        </div>
      </header>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .ff-topbar-hamburger         { display: none !important; }
          .ff-topbar-mobile-logo       { display: flex !important; }
          .ff-topbar-search            { display: none !important; }
          .ff-topbar-spacer            { display: flex !important; }
          .ff-topbar-trending          { display: none !important; }
          .ff-topbar-mobile-search-btn { display: flex !important; }
          .ff-topbar-avatar            { display: none !important; }
        }
      `}</style>
    </>
  );
}

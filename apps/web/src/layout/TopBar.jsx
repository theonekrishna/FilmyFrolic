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
      <header className="h-[60px] bg-[#080810]/95 backdrop-blur-xl border-b border-white/10 flex items-center px-4 md:px-6 justify-between gap-4 sticky top-0 z-40">
        {/* ── Left cluster: Hamburger, Mobile Logo & Page Title ── */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          {/* Desktop hamburger toggle */}
          <button
            className="ff-topbar-hamburger w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer shrink-0 p-0 transition-colors hover:bg-white/10"
            onClick={fireSidebarToggle}
            title="Toggle sidebar"
          >
            <Menu size={17} color="rgba(240,240,248,0.7)" />
          </button>

          {/* Mobile logo */}
          <NavLink
            to="/"
            className="ff-topbar-mobile-logo hidden items-center gap-2 no-underline shrink-0"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0"
              style={{
                background: "linear-gradient(135deg, #f5c518, #e84545)",
                boxShadow: "0 2px 10px rgba(245,197,24,0.3)",
              }}
            >
              🎬
            </div>
            <span
              className="font-['Bebas_Neue'] text-[18px] tracking-[1.5px] leading-none"
              style={{
                color: "#f5c518",
                textShadow: "0 0 20px rgba(245,197,24,0.3)",
              }}
            >
              Filmy Frolic
            </span>
          </NavLink>

          {/* Page title (optional) */}
          {title && (
            <div className="shrink-0 flex flex-col justify-center min-w-0">
              <h1 className="font-['Bebas_Neue',cursive] text-[20px] tracking-[1.5px] text-[#f0f0f8] leading-tight m-0">
                {title}
              </h1>
              {subtitle && (
                <p className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.45)] m-0 leading-none font-light whitespace-nowrap mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Desktop: centered SearchBar ── */}
        <div className="ff-topbar-search flex-1 flex justify-center max-w-[480px] mx-auto">
          <SearchBar placeholder="Search movies, actors, users, communities, #hashtags..." />
        </div>

        {/* ── Mobile flex spacer ── */}
        <div className="ff-topbar-spacer hidden flex-1" />

        {/* ── Right action cluster ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile search icon button */}
          <button
            className="ff-topbar-mobile-search-btn hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer p-0 flex-shrink-0 transition-colors hover:bg-white/10"
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
            <div className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10">
              <Bell size={17} color="rgba(240,240,248,0.7)" />
              {totalUnread > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white leading-none border border-[#080810]"
                  style={{ background: "#e84545", boxShadow: "0 0 8px rgba(232,69,69,0.7)" }}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
          </NavLink>

          {/* Desktop Avatar */}
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

import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Gamepad2, Users, User } from "lucide-react";
import { useMobileSearch } from "../context/SearchContext";

const TABS = [
  { id: "home", label: "Home", icon: Home, path: "/", accent: "text-[#e84545]" },
  {
    id: "discover",
    label: "Discover",
    icon: Search,
    path: "/content/archive",
    accent: "text-[#f5c518]",
    isSearch: true,
  },
  { id: "play", label: "Play", icon: Gamepad2, path: "/entertain/games", accent: "text-[#7c5cfc]" },
  {
    id: "social",
    label: "Social",
    icon: Users,
    path: "/social/feed",
    accent: "text-[#3b82f6]",
    badge: true,
  },
  { id: "profile", label: "Profile", icon: User, path: "/user/profile", accent: "text-[#1fd1a8]" },
];

function isTabActive(tab, pathname) {
  if (tab.path === "/") return pathname === "/";
  return pathname === tab.path || pathname.startsWith(tab.path.split("?")[0]);
}

export default function BottomTabBar({ className }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSearch } = useMobileSearch();

  return (
    <div className={className}>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-[#0d0d18] border-t border-[rgba(255,255,255,0.07)] shadow-[0_-4px_28px_rgba(0,0,0,0.65)] pb-[env(safe-area-inset-bottom,20px)] px-[env(safe-area-inset-left,8px)] pr-[env(safe-area-inset-right,8px)]`}
      >
        {TABS.map((tab) => {
          const active = isTabActive(tab, location.pathname);
          const Icon = tab.icon;

          const handleTap = () => {
            if (tab.isSearch && location.pathname.includes("/content/archive")) {
              openSearch();
              return;
            }
            navigate(tab.path);
          };

          return (
            <button
              key={tab.id}
              onClick={handleTap}
              aria-label={tab.label}
              className={`flex-1 flex flex-col items-center justify-center h-14 relative cursor-pointer select-none transition-opacity duration-150 ${
                active ? "gap-1" : "gap-0"
              }`}
            >
              {/* Active accent line */}
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 h-[2px] rounded-b-[3px] transition-all duration-300`}
                style={{
                  width: active ? 32 : 0,
                  backgroundColor: active ? tab.accent.replace("text-", "#") : "transparent",
                  boxShadow: active ? `0 0 10px ${tab.accent.replace("text-", "#")}` : "none",
                }}
              />

              {/* Icon + badge */}
              <div className="relative">
                <Icon
                  size={22}
                  color={active ? tab.accent.replace("text-", "#") : "rgba(240,240,248,0.38)"}
                  strokeWidth={active ? 2.4 : 1.7}
                  className={`transition-colors duration-200`}
                  style={
                    active
                      ? { filter: `drop-shadow(0 0 6px ${tab.accent.replace("text-", "#")}80)` }
                      : {}
                  }
                />

                {tab.badge && !active && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#e84545] border-[1.5px] border-[#0d0d18] shadow-[0_0_6px_rgba(232,69,69,0.7)]" />
                )}
              </div>

              {/* Label */}
              <span
                className={`block overflow-hidden whitespace-nowrap font-outfit text-[10px] font-bold leading-none transition-all duration-200 ${
                  active ? "max-h-[14px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer to prevent content from being hidden behind the fixed bar */}
      <div className="h-14" />
    </div>
  );
}

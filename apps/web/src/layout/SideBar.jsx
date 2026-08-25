import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Newspaper,
  MessageSquare,
  Users,
  Radio,
  Film,
  FileText,
  MessageCircle,
  Gamepad2,
  Smile,
  Settings,
  ScrollText,
  ChevronRight,
  LogOut,
  LogIn,
  UserPlus,
  Power,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/Profilecontext";
import { useFollowCounts } from "../modules/follow/hooks/useFollow";
import { privateAxios } from "../utils/AxiosInstance";
import { useModules } from "../context/ModulesContext";
import { supabase } from "../utils/supabaseClient"; // ← adjust path if your client lives elsewhere

// ─── Keyframes ───────────────────────────────────────────────────
const SIDEBAR_KF = `
@keyframes ff-sb-card-in {
  from { opacity:0; transform:translateY(-6px) scale(0.97); }
  to   { opacity:1; transform:translateY(0)    scale(1);    }
}
@keyframes ff-sb-lock-bounce {
  0%,100% { transform:translateY(0);   }
  40%     { transform:translateY(-3px); }
  70%     { transform:translateY(1px);  }
}
@keyframes ff-sb-ring-spin { to { transform:rotate(360deg); } }
@keyframes ff-sb-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
@keyframes ff-sb-pulse {
  0%,100% { opacity: 0.4; }
  50%     { opacity: 0.9; }
}
@keyframes ff-sb-fade-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}`;

if (typeof document !== "undefined" && !document.getElementById("ff-sb-kf")) {
  const s = document.createElement("style");
  s.id = "ff-sb-kf";
  s.textContent = SIDEBAR_KF;
  document.head.appendChild(s);
}

// ─── Navigation config ────────────────────────────────────────────
const ALL_MODULES = [
  {
    moduleKey: "core",
    label: null,
    accent: "#f5c518",
    items: [{ icon: Home, label: "Home", path: "/" }],
  },
  {
    moduleKey: "social",
    label: "Social",
    accent: "#3b82f6",
    items: [
      { icon: Newspaper, label: "Feed", path: "/social/feed" },
      { icon: MessageSquare, label: "Messages", path: "/social/messages" },
      { icon: Radio, label: "Rooms", path: "/social/rooms" },
      { icon: Users, label: "Communities", path: "/social/communities" },
    ],
  },
  {
    moduleKey: "content",
    label: "Content",
    accent: "#f5c518",
    items: [
      { icon: Film, label: "Archive", path: "/content/archive" },
      { icon: FileText, label: "Articles", path: "/content/articles" },
      { icon: MessageCircle, label: "Gossips", path: "/content/gossip" },
    ],
  },
  {
    moduleKey: "entertainment",
    label: "Entertain",
    accent: "#7c5cfc",
    items: [
      { icon: Gamepad2, label: "Games", path: "/entertain/games" },
      { icon: Smile, label: "Memes", path: "/entertain/memes" },
    ],
  },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", path: "/settings", authRequired: true },
  // { icon: ScrollText, label: "Policies", path: "/user/policies" }, coomented out becuase we moved policies into inside settings
];

// ─── Helpers ─────────────────────────────────────────────────────
function isPathActive(path, pathname) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

const W_EXPANDED = 252;
const W_COLLAPSED = 62;

// ══════════════════════════════════════════════════════════════════
//  LOGOUT CONFIRM POPOVER
// ══════════════════════════════════════════════════════════════════
function LogoutPopover({ onConfirm, onCancel, side = "bottom" }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          zIndex: 999,
          ...(side === "right"
            ? {
                left: "calc(100% + 14px)",
                top: "50%",
                transform: "translateY(-50%)",
                width: 220,
              }
            : { top: 0, left: 0, right: 0, width: "100%" }),
          boxSizing: "border-box",
          borderRadius: 12,
          background: "linear-gradient(145deg,#131318,#1c1c24)",
          border: "1px solid rgba(232,69,69,0.2)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          padding: 12,
          fontFamily: "'Outfit',sans-serif",
          overflow: "hidden",
          animation: "ff-sb-card-in 0.18s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {side === "right" && (
          <div
            style={{
              position: "absolute",
              left: -5,
              top: "50%",
              transform: "translateY(-50%) rotate(45deg)",
              width: 10,
              height: 10,
              background: "#131318",
              border: "1px solid rgba(232,69,69,0.2)",
              borderTop: "none",
              borderRight: "none",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              minWidth: 28,
              borderRadius: "50%",
              background: "rgba(232,69,69,0.1)",
              border: "1px solid rgba(232,69,69,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Power size={12} color="#e84545" strokeWidth={2.2} />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#f0f0f8",
                lineHeight: 1.2,
              }}
            >
              Sign out?
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 2,
                fontSize: 10,
                color: "rgba(240,240,248,0.38)",
                lineHeight: 1.3,
              }}
            >
              You'll stay on this page
            </p>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 10,
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: 11.5,
              fontWeight: 600,
              color: "rgba(240,240,248,0.65)",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg,#e84545,#c0392b)",
              border: "none",
              cursor: "pointer",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#fff",
              fontFamily: "inherit",
              boxShadow: "0 3px 10px rgba(232,69,69,0.28)",
              transition: "opacity 0.15s,transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.88";
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
//  LOGGED-IN PROFILE CARD
// ══════════════════════════════════════════════════════════════════
function UserProfileCard({
  user,
  collapsed,
  followCounts,
  postsCount,
  avatarError,
  setAvatarError,
  onLogout,
}) {
  const [showLogout, setShowLogout] = useState(false);
  return (
    <div
      className="relative flex-shrink-0 mx-2.5 mb-2 rounded-[14px]"
      style={{
        background:
          "linear-gradient(160deg,rgba(245,197,24,0.055) 0%,rgba(255,255,255,0.018) 100%)",
        border: "1px solid rgba(245,197,24,0.13)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(245,197,24,0.09)",
        animation: "ff-sb-fade-in 0.25s ease both",
        overflow: "visible",
      }}
    >
      <div
        style={{
          height: 1,
          borderRadius: "14px 14px 0 0",
          background:
            "linear-gradient(90deg,transparent 0%,rgba(245,197,24,0.55) 50%,transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "ff-sb-shimmer 4s linear infinite",
        }}
      />
      <div
        className={`flex items-center gap-2.5 transition-all duration-300 ${collapsed ? "justify-center py-2.5" : "px-3 pt-2.5 pb-2"}`}
      >
        <div className="relative flex-shrink-0">
          {user.avatar && !avatarError ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-9 h-9 rounded-full object-cover"
              style={{
                border: "2px solid rgba(245,197,24,0.38)",
                boxShadow: "0 2px 14px rgba(245,197,24,0.18)",
              }}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-outfit font-extrabold text-[12px] text-[#080810] flex-shrink-0"
              style={{
                background: user.gradient,
                border: "2px solid rgba(245,197,24,0.38)",
                boxShadow: "0 2px 14px rgba(245,197,24,0.18)",
              }}
            >
              {user.initials}
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#1fd1a8",
              border: "2px solid #0d0d18",
              boxShadow: "0 0 6px rgba(31,209,168,0.55)",
            }}
          />
        </div>
        <div
          className={`flex-1 min-w-0 overflow-hidden transition-[max-width,opacity] duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"}`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="font-outfit text-[13px] font-semibold text-[#f0f0f8] whitespace-nowrap truncate leading-snug">
                {user.displayName}
              </div>
              <div className="font-outfit text-[10.5px] text-[#f0f0f8]/35 mt-[1px] whitespace-nowrap leading-snug">
                @{user.username}
              </div>
            </div>
            <button
              onClick={() => setShowLogout((v) => !v)}
              title="Sign Out"
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                flexShrink: 0,
                border: showLogout
                  ? "1px solid rgba(232,69,69,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
                background: showLogout ? "rgba(232,69,69,0.13)" : "rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "border-color 0.2s,background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(232,69,69,0.45)";
                e.currentTarget.style.background = "rgba(232,69,69,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!showLogout) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <LogOut
                size={11}
                color={showLogout ? "#e84545" : "rgba(240,240,248,0.4)"}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>
      </div>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ${collapsed ? "max-h-0 opacity-0" : "max-h-[50px] opacity-100"}`}
      >
        <div className="grid grid-cols-3" style={{ borderTop: "1px solid rgba(245,197,24,0.09)" }}>
          {[
            { value: followCounts.followers, label: "Followers" },
            { value: followCounts.following, label: "Following" },
            { value: postsCount ?? 0, label: "Posts" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-1 py-2 cursor-pointer"
              style={{
                borderRight: i < 2 ? "1px solid rgba(245,197,24,0.07)" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,197,24,0.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span className="font-bebas text-[15px] text-[#f5c518] leading-none">{s.value}</span>
              <span className="font-outfit text-[8px] font-black text-[#f0f0f8]/28 tracking-[1.2px] uppercase mt-[2px] leading-none">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {showLogout && (
        <LogoutPopover
          side={collapsed ? "right" : "bottom"}
          onCancel={() => setShowLogout(false)}
          onConfirm={() => {
            setShowLogout(false);
            onLogout();
          }}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  GUEST PROFILE CARD
// ══════════════════════════════════════════════════════════════════
function GuestProfileCard({ collapsed }) {
  const navigate = useNavigate();
  if (collapsed) {
    return (
      <div className="flex justify-center py-2.5 flex-shrink-0">
        <button
          onClick={() => navigate("/login")}
          aria-label="Sign in"
          title="Sign In"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px dashed rgba(245,197,24,0.4)",
            background: "rgba(255,255,255,0.03)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: 0,
            flexShrink: 0,
            transition: "border-color 0.2s,background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#f5c518";
            e.currentTarget.style.background = "rgba(245,197,24,0.09)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(245,197,24,0.4)";
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              animation: "ff-sb-ring-spin 10s linear infinite",
              opacity: 0.18,
            }}
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#f5c518"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          </svg>
          <svg
            style={{
              width: 13,
              height: 13,
              animation: "ff-sb-lock-bounce 2.6s ease-in-out infinite",
              flexShrink: 0,
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(245,197,24,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <div
      className="flex-shrink-0 mx-2.5 mb-2 rounded-[14px]"
      style={{
        border: "1px dashed rgba(245,197,24,0.18)",
        background: "rgba(245,197,24,0.022)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        animation: "ff-sb-fade-in 0.25s ease both",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 1,
          background: "linear-gradient(90deg,transparent,rgba(245,197,24,0.42),transparent)",
          backgroundSize: "200% 100%",
          animation: "ff-sb-shimmer 3.5s linear infinite",
        }}
      />
      <div className="flex items-center gap-3 px-3 pt-3 pb-2.5">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px dashed rgba(245,197,24,0.32)",
            background: "rgba(245,197,24,0.045)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              animation: "ff-sb-ring-spin 10s linear infinite",
              opacity: 0.14,
            }}
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#f5c518"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          </svg>
          <svg
            style={{
              width: 13,
              height: 13,
              animation: "ff-sb-lock-bounce 2.6s ease-in-out infinite",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(245,197,24,0.68)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-outfit text-[12.5px] font-semibold whitespace-nowrap truncate"
            style={{ color: "rgba(240,240,248,0.62)" }}
          >
            Not signed in
          </div>
          <div
            className="font-outfit text-[10px] mt-[2px] whitespace-nowrap"
            style={{ color: "rgba(240,240,248,0.28)" }}
          >
            Sign in to see your profile
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 px-3 pb-3">
        <button
          onClick={() => navigate("/login")}
          className="flex-1 flex items-center justify-center gap-1.5 font-outfit font-bold text-[11.5px] rounded-[8px]"
          style={{
            padding: "6px 0",
            background: "linear-gradient(135deg,#f5c518,#e84545)",
            color: "#080810",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(245,197,24,0.18)",
            transition: "opacity 0.15s,transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.85";
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <LogIn size={11} strokeWidth={2.5} /> Sign In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="flex-1 flex items-center justify-center gap-1.5 font-outfit font-semibold text-[11.5px] rounded-[8px]"
          style={{
            padding: "6px 0",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(245,197,24,0.18)",
            color: "rgba(245,197,24,0.75)",
            cursor: "pointer",
            transition: "background 0.15s,border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(245,197,24,0.08)";
            e.currentTarget.style.borderColor = "rgba(245,197,24,0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(245,197,24,0.18)";
          }}
        >
          <UserPlus size={11} strokeWidth={2.2} /> Sign Up
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MAIN SIDEBAR
// ══════════════════════════════════════════════════════════════════
export default function Sidebar({ className }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isEnabled } = useModules();
  // ── Read profile from shared context — no duplicate API call ────────────────
  const { sharedProfile, profileLoaded } = useProfile();

  const visibleModules = ALL_MODULES.filter((mod) => isEnabled(mod.moduleKey));

  // Derive the user object from ProfileContext instead of a separate API call.
  // avatarError is local UI state (can't live in context).
  const [avatarError, setAvatarError] = useState(false);
  const [postsCount, setPostsCount] = useState(0);

  // Build a normalised user object from sharedProfile (matches the shape
  // that UserProfileCard / GuestProfileCard expect).
  const isLoggedIn = !!sharedProfile?.id;
  const user = isLoggedIn
    ? {
        id: sharedProfile.id,
        displayName: sharedProfile.displayName || sharedProfile.display_name || "User",
        username: sharedProfile.username || "user",
        avatar: sharedProfile.avatar_url || "",
        gradient: sharedProfile.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
        initials: sharedProfile.initials || "U",
        email: sharedProfile.email,
        bio: sharedProfile.bio,
      }
    : null;

  // Reset avatar error when the avatar URL changes (e.g. after upload).
  const avatarUrl = sharedProfile?.avatar_url;
  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  const { counts: hookFollowCounts } = useFollowCounts(user?.id);

  // ── Live override for follow counts. Starts from the hook's value and
  // gets pushed forward by the realtime subscription below. ────────────
  const [liveFollowCounts, setLiveFollowCounts] = useState(null);
  useEffect(() => {
    // Whenever the hook's own value changes (e.g. user switches), reset the override.
    setLiveFollowCounts(null);
  }, [user?.id]);
  const followCounts = liveFollowCounts ?? hookFollowCounts;

  // ── Fetch posts count from /api/profile/me (not in ProfileContext) ───────────
  const fetchPostsCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await privateAxios.get("/api/profile/me");
      if (res.data?.success) {
        setPostsCount(res.data.data?.total_posts_count ?? 0);
      }
    } catch {
      // silently ignore - keep previous/0 value
    }
  }, [user?.id]);

  // ── Fetch follow counts directly from Supabase (used to refresh the
  // local override on realtime "follows" events). Adjust column names
  // below ("following_id" / "follower_id") to match your schema if different. ─
  const fetchFollowCountsLive = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", user.id),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user.id),
      ]);
      setLiveFollowCounts({
        followers: followers ?? 0,
        following: following ?? 0,
      });
    } catch {
      // silently ignore - keep previous value
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPostsCount();
  }, [fetchPostsCount]);

  // ── Realtime: keep followers/following/posts counts live ──────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-counts-${user.id}`)
      // Follow counts
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
        },
        () => {
          fetchFollowCountsLive();
        }
      )
      // Feed posts
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feeds",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPostsCount();
        }
      )
      // Gossip posts
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gossips",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPostsCount();
        }
      )
      // Memes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memes",
          filter: `created_by=eq.${user.id}`,
        },
        () => {
          fetchPostsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFollowCountsLive, fetchPostsCount]);

  // Use profileLoaded from context as the loading flag (replaces loadingUser).
  const loadingUser = !profileLoaded;

  function handleLogout() {
    try {
      signOut();
    } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
    window.location.reload();
  }

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ff-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [tooltip, setTooltip] = useState(null);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ff-sidebar-collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
    setTooltip(null);
  }

  useEffect(() => {
    const handler = () => {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("ff-sidebar-collapsed", next ? "1" : "0");
        } catch {}
        return next;
      });
      setTooltip(null);
    };
    window.addEventListener("ff-toggle-sidebar", handler);
    return () => window.removeEventListener("ff-toggle-sidebar", handler);
  }, []);

  const activeMod = visibleModules.find((mod) =>
    mod.items.some((item) => isPathActive(item.path, location.pathname))
  );
  const activeAccent = activeMod?.accent ?? "#f5c518";
  const itemPL = collapsed ? 23 : 14;

  function showTooltip(e, label, accent) {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2, accent });
  }
  function hideTooltip() {
    setTooltip(null);
  }

  return (
    <>
      <aside
        className={`ff-sidebar flex flex-col h-screen sticky top-0 flex-shrink-0 z-50 bg-[#0d0d18] border-r border-r-white/5 shadow-[2px_0_28px_rgba(0,0,0,0.6)] transition-[width,min-width] duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? "w-[62px] min-w-[62px]" : "w-[252px] min-w-[252px]"} ${className ?? ""}`}
        style={{ overflow: "visible" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `radial-gradient(ellipse 70% 28% at 0% 18%,${activeAccent}07 0%,transparent 70%)`,
            transition: "background 0.6s ease",
          }}
        />

        <div className="flex flex-col h-full relative z-10" style={{ overflow: "visible" }}>
          {/* ════ LOGO ROW ════ */}
          <div className="relative flex items-center flex-shrink-0 px-3 gap-2.5 h-16">
            <div
              onClick={collapsed ? toggle : undefined}
              title={collapsed ? "Expand sidebar" : undefined}
              className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg text-[16px] select-none"
              style={{
                background: "linear-gradient(135deg,#f5c518,#e84545)",
                boxShadow: "0 2px 14px rgba(245,197,24,0.3)",
                cursor: collapsed ? "pointer" : "default",
                transition: "transform 0.15s,box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.07)";
                e.currentTarget.style.boxShadow = "0 4px 22px rgba(245,197,24,0.48)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 14px rgba(245,197,24,0.3)";
              }}
            >
              🎬
            </div>
            <div
              className={`flex-1 flex items-center gap-2 overflow-hidden transition-[opacity,max-width] duration-200 ${collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[300px]"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-bebas text-[21px] tracking-[2.5px] leading-[1.1] whitespace-nowrap bg-gradient-to-r from-[#f5c518] to-[#f0f0f8] bg-clip-text text-transparent">
                  Filmy Frolic
                </div>
                <div
                  className="font-outfit text-[8.5px] font-black uppercase tracking-[3px] whitespace-nowrap transition-colors duration-400"
                  style={{ color: activeAccent }}
                >
                  Premium
                </div>
              </div>
            </div>
            {!collapsed && (
              <button
                onClick={toggle}
                title="Collapse"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              >
                <ChevronRight
                  size={12}
                  style={{
                    transform: "rotate(180deg)",
                    color: "rgba(240,240,248,0.3)",
                  }}
                />
              </button>
            )}
            {collapsed && (
              <div className="absolute pointer-events-none" style={{ left: W_COLLAPSED - 12 }}>
                <ChevronRight size={11} style={{ color: "rgba(240,240,248,0.18)" }} />
              </div>
            )}
          </div>

          {/* ════ PROFILE CARD ════ */}
          {loadingUser ? (
            <div
              className={`flex-shrink-0 mx-2.5 mb-2 rounded-[14px] flex items-center gap-2.5 ${collapsed ? "justify-center py-2.5" : "px-3 py-3"}`}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  animation: "ff-sb-pulse 1.4s infinite",
                }}
              />
              {!collapsed && (
                <div className="flex-1 space-y-2">
                  <div
                    className="h-3.5 rounded-md"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      animation: "ff-sb-pulse 1.4s 0.1s infinite",
                    }}
                  />
                  <div
                    className="h-3 rounded-md w-2/3"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      animation: "ff-sb-pulse 1.4s 0.2s infinite",
                    }}
                  />
                </div>
              )}
            </div>
          ) : user ? (
            <UserProfileCard
              user={user}
              collapsed={collapsed}
              followCounts={followCounts}
              postsCount={postsCount}
              avatarError={avatarError}
              setAvatarError={setAvatarError}
              onLogout={handleLogout}
            />
          ) : (
            <GuestProfileCard collapsed={collapsed} />
          )}

          {/* ════ NAV ════ */}
          <nav
            className="flex-1 overflow-y-auto hide-scrollbar px-1.5"
            style={{ overflowX: "visible" }}
          >
            {visibleModules.map((mod, modIdx) => (
              <div key={mod.moduleKey} className="mb-0.5">
                {modIdx > 0 && (
                  <div
                    className={`h-px bg-white/10 transition-[margin] duration-300 ${collapsed ? "my-2 mx-1" : "mt-1.5 mb-2 mx-0.5"}`}
                  />
                )}
                {mod.label && (
                  <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ${collapsed ? "max-h-0 opacity-0" : "max-h-[26px] opacity-100"}`}
                  >
                    <div className="flex items-center gap-1.5 px-1.5 pb-1.5">
                      <div
                        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                        style={{
                          background: mod.accent,
                          boxShadow: `0 0 6px ${mod.accent}`,
                        }}
                      />
                      <span
                        className="font-outfit text-[8.5px] font-black uppercase tracking-[2.5px] whitespace-nowrap"
                        style={{ color: mod.accent, opacity: 0.65 }}
                      >
                        {mod.label}
                      </span>
                    </div>
                  </div>
                )}
                {mod.items.map((item) => {
                  const isActive = isPathActive(item.path, location.pathname);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-2.5 rounded-[10px] mb-[2px] relative"
                      style={{
                        paddingTop: 9,
                        paddingBottom: 9,
                        paddingLeft: itemPL,
                        paddingRight: 10,
                        minWidth: W_EXPANDED - 20,
                        transition: "background 0.18s,box-shadow 0.18s",
                        boxShadow: isActive
                          ? `inset 3px 0 0 ${mod.accent},0 2px 10px rgba(0,0,0,0.28)`
                          : "none",
                        background: isActive ? `${mod.accent}0f` : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        showTooltip(e, item.label, mod.accent);
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                        hideTooltip();
                      }}
                    >
                      <item.icon
                        size={15}
                        color={isActive ? mod.accent : "rgba(240,240,248,0.36)"}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        className={`font-outfit text-[13px] flex-1 whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"} ${isActive ? "font-semibold text-white" : "font-medium text-white/48"}`}
                      >
                        {item.label}
                      </span>
                      {isActive && !collapsed && (
                        <div
                          className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                          style={{
                            background: mod.accent,
                            boxShadow: `0 0 8px ${mod.accent}`,
                          }}
                        />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}

            <div
              className={`h-px bg-white/10 transition-[margin] duration-300 ${collapsed ? "my-2 mx-1" : "my-2 mx-0.5"}`}
            />

            {BOTTOM_ITEMS.filter((item) => !item.authRequired || user).map((item) => {
              const isActive = isPathActive(item.path, location.pathname);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2.5 rounded-[10px] mb-[2px] relative"
                  style={{
                    paddingTop: 9,
                    paddingBottom: 9,
                    paddingLeft: itemPL,
                    paddingRight: 10,
                    minWidth: W_EXPANDED - 20,
                    transition: "background 0.18s",
                    background: isActive ? "rgba(255,255,255,0.055)" : "transparent",
                    boxShadow: isActive ? "inset 3px 0 0 rgba(240,240,248,0.22)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.032)";
                    showTooltip(e, item.label, "rgba(240,240,248,0.5)");
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                    hideTooltip();
                  }}
                >
                  <item.icon
                    size={15}
                    color={isActive ? "#f0f0f8" : "rgba(240,240,248,0.3)"}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ flexShrink: 0 }}
                  />
                  <span
                    className={`font-outfit text-[13px] flex-1 whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ${collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"} ${isActive ? "font-semibold text-white" : "text-white/38"}`}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            <div className="h-3" />
          </nav>
        </div>
      </aside>

      {collapsed && tooltip && (
        <div
          className="fixed rounded-[8px] px-3 py-1.5 font-outfit font-semibold text-[12px] text-[#f0f0f8] z-[9999] pointer-events-none whitespace-nowrap"
          style={{
            left: W_COLLAPSED + 10,
            top: tooltip.y,
            transform: "translateY(-50%)",
            background: "#14141d",
            border: `1px solid ${tooltip.accent}32`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="absolute w-2 h-2"
            style={{
              left: -5,
              top: "50%",
              transform: "translateY(-50%) rotate(45deg)",
              background: "#14141d",
              borderLeft: `1px solid ${tooltip.accent}32`,
              borderBottom: `1px solid ${tooltip.accent}32`,
            }}
          />
          {tooltip.label}
        </div>
      )}
    </>
  );
}

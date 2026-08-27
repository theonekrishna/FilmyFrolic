import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../services/adminApi";
import { supabase } from "../../../services/supabase";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageSquare,
  Gamepad2,
  Shield,
  Bell,
  BarChart3,
  Settings,
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Ban,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Send,
  ChevronRight,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Menu,
  Globe,
  Zap,
  RefreshCw,
  Download,
  Lock,
  Unlock,
  CheckCircle,
  Flag,
  UserCheck,
  ShieldAlert,
  Film as FilmIcon,
  PenLine,
  BarChart2,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ADMIN_USERS,
  ADMIN_MOVIES,
  ADMIN_ARTICLES,
  ADMIN_GOSSIP,
  ADMIN_COMMUNITIES,
  ADMIN_POSTS,
  ADMIN_ROOMS,
  ADMIN_QUIZZES,
  ADMIN_MEMES,
  ADMIN_REPORTS,
  SENT_NOTIFICATIONS,
  USER_GROWTH,
  MODULE_USAGE,
  DAU_TREND,
  CONTENT_VIEWS,
  CONTENT_FEEDBACK,
  CAST_CREW,
  type UserRole,
  type UserStatus,
  type ContentStatus,
  type FeedbackStatus,
  type FeedbackCategory,
  type ContentFeedbackType,
  type ReportReason,
  type ReportType,
} from "../data/AdminData";

// ─── Constants ────────────────────────────────────────────────────────────────

const A = "#7c5cfc"; // admin purple
const GOLD = "#f5c518";
const RED = "#e84545";
const GREEN = "#2ecc71";
const BLUE = "#4d91ff";
const TEAL = "#1fd1a8";

type Section =
  | "overview"
  | "users"
  | "content"
  | "contentFeedback"
  | "social"
  | "entertain"
  | "moderation"
  | "notifications"
  | "analytics"
  | "settings";

const NAV: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "users", label: "Users", icon: <Users size={16} />, badge: 10 },
  { id: "content", label: "Content", icon: <Film size={16} /> },
  { id: "contentFeedback", label: "Content Feedback", icon: <Flag size={16} />, badge: 4 },
  { id: "social", label: "Social", icon: <MessageSquare size={16} /> },
  { id: "entertain", label: "Entertainment", icon: <Gamepad2 size={16} /> },
  { id: "moderation", label: "Moderation", icon: <Shield size={16} />, badge: 5 },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

const F = "'Outfit', sans-serif";
const B = "'Bebas Neue', cursive";
const card = {
  background: "#12121e",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
};

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        background: `${color}18`,
        border: `1px solid ${color}30`,
        borderRadius: 100,
        padding: "2px 10px",
        fontFamily: F,
        fontSize: 11,
        fontWeight: 700,
        color,
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}

function Btn({
  label,
  color = A,
  icon,
  onClick,
  danger,
  sm,
}: {
  label?: string;
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  sm?: boolean;
}) {
  const c = danger ? RED : color;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        cursor: "pointer",
        padding: sm ? "4px 10px" : "7px 14px",
        background: `${c}14`,
        border: `1px solid ${c}30`,
        borderRadius: 8,
        fontFamily: F,
        fontSize: 12,
        fontWeight: 700,
        color: c,
        transition: "background 0.15s",
        minHeight: "unset",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${c}28`)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = `${c}14`)}
    >
      {icon}
      {label && label}
    </button>
  );
}

function SectionTitle({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ color: A }}>{icon}</div>
        <h2 style={{ fontFamily: B, fontSize: 26, letterSpacing: 2, color: "#f0f0f8", margin: 0 }}>
          {title}
        </h2>
      </div>
      {sub && (
        <p
          style={{
            fontFamily: F,
            fontSize: 13,
            color: "rgba(240,240,248,0.4)",
            margin: 0,
            fontWeight: 300,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}) {
  return (
    <div
      style={{ ...card, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.4)", fontWeight: 500 }}
        >
          {label.toUpperCase()}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${color}15`,
            border: `1px solid ${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div
          style={{ fontFamily: B, fontSize: 34, letterSpacing: 1, color: "#f0f0f8", lineHeight: 1 }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.35)", marginTop: 4 }}
          >
            {sub}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {trend >= 0 ? <ArrowUp size={12} color={GREEN} /> : <ArrowDown size={12} color={RED} />}
          <span
            style={{
              fontFamily: F,
              fontSize: 11,
              color: trend >= 0 ? GREEN : RED,
              fontWeight: 600,
            }}
          >
            {Math.abs(trend)}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "0 12px",
        height: 38,
        flex: 1,
        maxWidth: 320,
      }}
    >
      <Search size={14} color="rgba(240,240,248,0.3)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: F,
          fontSize: 13,
          color: "#f0f0f8",
          caretColor: A,
        }}
      />
    </div>
  );
}

function SubTabs({
  tabs,
  active,
  onTab,
}: {
  tabs: string[];
  active: string;
  onTab: (t: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        marginBottom: 20,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: 0,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTab(t)}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: `2px solid ${active === t ? A : "transparent"}`,
            padding: "8px 16px 9px",
            fontFamily: F,
            fontSize: 13,
            fontWeight: active === t ? 700 : 400,
            color: active === t ? A : "rgba(240,240,248,0.4)",
            cursor: "pointer",
            marginBottom: -1,
            transition: "all 0.15s",
            whiteSpace: "nowrap" as const,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Admin Sidebar ────────────────────────────────────────────────────────────

function AdminSidebar({
  section,
  onSection,
  collapsed,
}: {
  section: Section;
  onSection: (s: Section) => void;
  collapsed: boolean;
}) {
  const adminUser = (() => {
    try {
      const demo = localStorage.getItem("ff_admin_auth");
      if (demo) {
        const parsed = JSON.parse(demo);
        return {
          name: parsed.user?.name || "Demo Admin",
          email: parsed.user?.email || "admin@filmyfrolic.com",
          role: (parsed.role || "admin").toUpperCase(),
        };
      }
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        return {
          name: parsed.displayName || parsed.username || "Admin User",
          email: parsed.email || "admin@filmyfrolic.com",
          role: (parsed.role || "admin").toUpperCase(),
        };
      }
    } catch {
      // fallback
    }
    return { name: "Super Admin", email: "admin@filmyfrolic.app", role: "ADMIN" };
  })();

  const handleLogout = () => {
    localStorage.removeItem("ff_admin_auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    supabase.auth.signOut();
    window.location.href = "/login";
  };

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
          whiteSpace: "nowrap" as const,
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
        {NAV.map((item) => {
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
                whiteSpace: "nowrap" as const,
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
          whiteSpace: "nowrap" as const,
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
            onClick={handleLogout}
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
}

// ─── Admin Top Bar ────────────────────────────────────────────────────────────

function AdminTopBar({
  sectionLabel,
  onMenu,
  onNav,
}: {
  sectionLabel: string;
  onMenu: () => void;
  onNav: () => void;
}) {
  const handleViewSite = () => {
    const siteUrl =
      import.meta.env.VITE_CLIENT_URL || "https://filmy-frolic-new-frontend.onrender.com";
    window.open(siteUrl, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("ff_admin_auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    supabase.auth.signOut();
    window.location.href = "/login";
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
          onClick={handleLogout}
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
}

// ─── SECTION: OVERVIEW ────────────────────────────────────────────────────────

function OverviewSection() {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [stats, logs] = await Promise.all([adminApi.getOverview(), adminApi.getAuditLogs()]);
        if (isMounted) {
          if (stats) setOverviewData(stats);
          if (Array.isArray(logs) && logs.length > 0) {
            setActivities(logs);
          }
        }
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultActivity = [
    {
      icon: <UserCheck size={14} />,
      text: 'New user "chloem" registered',
      time: "2m ago",
      color: GREEN,
    },
    {
      icon: <Flag size={14} />,
      text: "Post flagged for spam in Sci-Fi Fanatics",
      time: "5m ago",
      color: RED,
    },
    {
      icon: <Film size={14} />,
      text: 'Movie "Realm of Ash" featured by moderator',
      time: "18m ago",
      color: GOLD,
    },
    {
      icon: <Shield size={14} />,
      text: "User @yukit suspended for policy violation",
      time: "42m ago",
      color: A,
    },
    {
      icon: <Bell size={14} />,
      text: "Platform broadcast sent to active users",
      time: "1h ago",
      color: BLUE,
    },
    {
      icon: <BarChart2 size={14} />,
      text: "Daily games leaderboard updated",
      time: "2h ago",
      color: TEAL,
    },
  ];

  const recentActivity =
    activities.length > 0
      ? activities.map((act) => ({
          icon: act.icon ? (
            <span style={{ color: act.iconColor }}>{act.icon}</span>
          ) : (
            <Activity size={14} />
          ),
          text:
            act.description ||
            `${act.admin_name || "Admin"} performed ${act.action} on ${act.module}`,
          time: act.created_at
            ? new Date(act.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now",
          color: act.iconColor || A,
        }))
      : defaultActivity;

  const totalUsersVal =
    overviewData?.totalUsers !== undefined ? overviewData.totalUsers.toLocaleString() : "84,200";
  const dailyActiveVal =
    overviewData?.dailyActive !== undefined ? overviewData.dailyActive.toLocaleString() : "61,000";
  const totalContentVal =
    overviewData?.totalContent !== undefined ? overviewData.totalContent.toLocaleString() : "1,240";
  const openReportsVal =
    overviewData?.openReports !== undefined ? overviewData.openReports.toString() : "7";
  const communitiesVal =
    overviewData?.communities !== undefined ? overviewData.communities.toString() : "48";
  const quizzesPlayedVal =
    overviewData?.quizzesPlayed !== undefined
      ? overviewData.quizzesPlayed.toLocaleString()
      : "42.1K";

  return (
    <div>
      <SectionTitle
        icon={<LayoutDashboard size={20} />}
        title="OVERVIEW"
        sub="Real-time platform health, active users, and key metrics"
      />

      {/* KPI Grid — Balanced 6-card row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Total Users"
          value={totalUsersVal}
          sub="Registered accounts"
          icon={<Users size={16} />}
          color={BLUE}
          trend={12}
        />
        <StatCard
          label="Daily Active"
          value={dailyActiveVal}
          sub="Last 24 hours"
          icon={<Activity size={16} />}
          color={A}
          trend={8}
        />
        <StatCard
          label="Total Content"
          value={totalContentVal}
          sub="Movies, articles, gossip"
          icon={<Film size={16} />}
          color={GOLD}
          trend={5}
        />
        <StatCard
          label="Open Reports"
          value={openReportsVal}
          sub="Awaiting action"
          icon={<AlertTriangle size={16} />}
          color={RED}
          trend={-2}
        />
        <StatCard
          label="Communities"
          value={communitiesVal}
          sub="Active groups"
          icon={<MessageSquare size={16} />}
          color={TEAL}
          trend={3}
        />
        <StatCard
          label="Quizzes Played"
          value={quizzesPlayedVal}
          sub="Total games played"
          icon={<Award size={16} />}
          color={GREEN}
          trend={18}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        {/* User growth chart */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            USER GROWTH
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={USER_GROWTH}>
              <defs>
                <linearGradient id="ovGradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop key="ov-users-start" offset="5%" stopColor={A} stopOpacity={0.25} />
                  <stop key="ov-users-end" offset="95%" stopColor={A} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ovGradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop key="ov-active-start" offset="5%" stopColor={TEAL} stopOpacity={0.2} />
                  <stop key="ov-active-end" offset="95%" stopColor={TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="ov-grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                key="ov-xaxis"
                dataKey="month"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="ov-yaxis"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                key="ov-tooltip"
                contentStyle={{
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#f0f0f8" }}
              />
              <Area
                key="ov-total-users"
                type="monotone"
                dataKey="users"
                stroke={A}
                fill="url(#ovGradUsers)"
                strokeWidth={2}
              />
              <Area
                key="ov-active-users"
                type="monotone"
                dataKey="active"
                stroke={TEAL}
                fill="url(#ovGradActive)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* Custom legend to avoid recharts duplicate-key warning */}
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            {[
              { color: A, label: "Total Users" },
              { color: TEAL, label: "Active Users" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: item.color,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.5)" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...card, padding: "22px 20px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            RECENT ACTIVITY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom:
                    i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${item.color}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: item.color,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 12,
                      color: "rgba(240,240,248,0.72)",
                      lineHeight: 1.45,
                    }}
                  >
                    {item.text}
                  </div>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 10,
                      color: "rgba(240,240,248,0.28)",
                      marginTop: 2,
                    }}
                  >
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Health */}
      <div style={{ ...card, padding: "22px 24px" }}>
        <div
          style={{
            fontFamily: B,
            fontSize: 16,
            letterSpacing: 1.5,
            color: "#f0f0f8",
            marginBottom: 16,
          }}
        >
          MODULE HEALTH
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: 12,
          }}
        >
          {moduleHealth.map((m) => (
            <div
              key={m.name}
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${m.color}20`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontFamily: B, fontSize: 13, letterSpacing: 1.5, color: m.color }}>
                  {m.name}
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: m.status === "Healthy" ? GREEN : GOLD,
                    boxShadow: `0 0 6px ${m.status === "Healthy" ? GREEN : GOLD}`,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: F,
                  fontSize: 12,
                  fontWeight: 700,
                  color: m.status === "Healthy" ? GREEN : GOLD,
                  marginBottom: 2,
                }}
              >
                {m.status}
              </div>
              <div style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.35)" }}>
                {m.users}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: USERS ───────────────────────────────────────────────────────────

function UsersSection() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "moderator" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "banned">(
    "all"
  );

  function toggleStatus(id: string, status: UserStatus) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }
  function changeRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  const visible = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const roleColor = (r: UserRole) => {
    if (r === "admin") return "#e84545";
    if (r === "moderator") return "#7c5cfc";
    if (r === "article_writer") return GOLD;
    return TEAL;
  };
  const statusColor = (s: UserStatus) => (s === "active" ? GREEN : s === "suspended" ? GOLD : RED);

  return (
    <div>
      <SectionTitle
        icon={<Users size={20} />}
        title="USER MANAGEMENT"
        sub={`${users.length} registered users · manage roles, status and permissions`}
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search name, username, email…"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "0 12px",
            height: 38,
            fontFamily: F,
            fontSize: 13,
            color: "rgba(240,240,248,0.7)",
            cursor: "pointer",
          }}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="article_writer">Article Writer</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "0 12px",
            height: 38,
            fontFamily: F,
            fontSize: 13,
            color: "rgba(240,240,248,0.7)",
            cursor: "pointer",
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
        <div style={{ marginLeft: "auto" }}>
          <Btn label="Export CSV" icon={<Download size={13} />} color={TEAL} />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 80px 160px",
            gap: 12,
            padding: "12px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {["User", "Email", "Role", "Status", "Posts", "Reviews", "Actions"].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: F,
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(240,240,248,0.35)",
                letterSpacing: 0.5,
              }}
            >
              {h.toUpperCase()}
            </span>
          ))}
        </div>
        {visible.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 80px 80px 160px",
              gap: 12,
              padding: "13px 18px",
              borderBottom: i < visible.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              alignItems: "center",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            {/* User */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: u.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: B,
                  fontSize: 13,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {u.name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f0f0f8",
                    whiteSpace: "nowrap" as const,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.name}
                </div>
                <div style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.35)" }}>
                  @{u.username}
                </div>
              </div>
            </div>
            {/* Email */}
            <span
              style={{
                fontFamily: F,
                fontSize: 12,
                color: "rgba(240,240,248,0.5)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
              }}
            >
              {u.email}
            </span>
            {/* Role */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                style={{
                  background: `${roleColor(u.role)}15`,
                  border: `1px solid ${roleColor(u.role)}30`,
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 700,
                  color: roleColor(u.role),
                  cursor: "pointer",
                }}
              >
                <option value="user">User</option>
                <option value="article_writer">Writer</option>
                <option value="moderator">Mod</option>
                <option value="admin">Admin</option>
              </select>
              {u.adminRole && (
                <span
                  style={{
                    fontFamily: F,
                    fontSize: 9,
                    color: "rgba(240,240,248,0.4)",
                    textTransform: "capitalize" as const,
                  }}
                >
                  {u.adminRole.replace("_", " ")}
                </span>
              )}
            </div>
            {/* Status */}
            <Pill label={u.status} color={statusColor(u.status)} />
            {/* Posts */}
            <span
              style={{
                fontFamily: F,
                fontSize: 12,
                color: "rgba(240,240,248,0.6)",
                textAlign: "right" as const,
              }}
            >
              {u.posts}
            </span>
            {/* Reviews */}
            <span
              style={{
                fontFamily: F,
                fontSize: 12,
                color: "rgba(240,240,248,0.6)",
                textAlign: "right" as const,
              }}
            >
              {u.reviews}
            </span>
            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {u.status !== "suspended" && u.status !== "banned" && (
                <Btn
                  sm
                  label="Suspend"
                  color={GOLD}
                  icon={<Lock size={11} />}
                  onClick={() => toggleStatus(u.id, "suspended")}
                />
              )}
              {u.status === "suspended" && (
                <Btn
                  sm
                  label="Restore"
                  color={GREEN}
                  icon={<Unlock size={11} />}
                  onClick={() => toggleStatus(u.id, "active")}
                />
              )}
              {u.status !== "banned" && (
                <Btn
                  sm
                  label="Ban"
                  danger
                  icon={<Ban size={11} />}
                  onClick={() => toggleStatus(u.id, "banned")}
                />
              )}
              {u.status === "banned" && (
                <Btn
                  sm
                  label="Unban"
                  color={TEAL}
                  icon={<Unlock size={11} />}
                  onClick={() => toggleStatus(u.id, "active")}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: F,
          fontSize: 12,
          color: "rgba(240,240,248,0.3)",
          marginTop: 12,
          textAlign: "center" as const,
        }}
      >
        Showing {visible.length} of {users.length} users
      </div>
    </div>
  );
}

// ─── SECTION: CONTENT ─────────────────────────────────────────────────────────

function ContentSection() {
  const [tab, setTab] = useState("Movies");
  const [movies, setMovies] = useState(ADMIN_MOVIES);
  const [articles, setArticles] = useState(ADMIN_ARTICLES);
  const [gossip, setGossip] = useState(ADMIN_GOSSIP);
  const [castCrew, setCastCrew] = useState(CAST_CREW);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Helper to get feedback count for content
  const getFeedbackCount = (contentId: string, type: ContentFeedbackType) => {
    return CONTENT_FEEDBACK.filter(
      (f) => f.contentId === contentId && f.type === type && f.status === "pending"
    ).length;
  };

  // Movies - External (read-only from FilyDock)
  function toggleMovieFeatured(id: string) {
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)));
  }
  function toggleMovieStatus(id: string) {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "published" ? "hidden" : "published" } : m
      )
    );
  }

  // Articles - External (read-only from FilyDock)
  function toggleArticleStatus(id: string) {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "published" ? "hidden" : "published" } : a
      )
    );
  }

  // Gossip - Internal (user-generated, fully editable)
  function toggleGossipStatus(id: string) {
    setGossip((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: g.status === "published" ? "hidden" : "published" } : g
      )
    );
  }
  function deleteGossip(id: string) {
    setGossip((prev) => prev.filter((g) => g.id !== id));
  }

  // Cast & Crew - External (read-only from FilyDock)
  function toggleCastFeatured(id: string) {
    setCastCrew((prev) => prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c)));
  }

  // Sync from FilyDock
  function syncFromFilyDock() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000); // Simulate API call
  }

  const sColor = (s: ContentStatus) => (s === "published" ? GREEN : s === "hidden" ? RED : GOLD);
  const roleColor = (r: string) => {
    if (r === "actor") return GOLD;
    if (r === "director") return A;
    if (r === "producer") return BLUE;
    if (r === "writer") return TEAL;
    if (r === "cinematographer" || r === "composer" || r === "editor") return RED;
    return "rgba(240,240,248,0.5)";
  };

  return (
    <div>
      <SectionTitle
        icon={<Film size={20} />}
        title="CONTENT MANAGEMENT"
        sub="Movies, articles, cast & crew from FilyDock · Gossip is internal content"
      />
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 0,
          flexWrap: "wrap" as const,
          alignItems: "center",
        }}
      >
        <SubTabs
          tabs={["Movies", "Articles", "Gossip", "Cast & Crew"]}
          active={tab}
          onTab={setTab}
        />
        <div style={{ flex: 1 }} />
        {/* Show Add button only for Gossip (internal content) */}
        {tab === "Gossip" && (
          <div style={{ marginBottom: 20 }}>
            <Btn label="Add Gossip" icon={<Plus size={13} />} color={A} />
          </div>
        )}
        {/* Show Sync button for external content */}
        {(tab === "Movies" || tab === "Articles" || tab === "Cast & Crew") && (
          <div style={{ marginBottom: 20 }}>
            <Btn
              label={syncing ? "Syncing..." : "Sync from FilyDock"}
              icon={<RefreshCw size={13} />}
              color={BLUE}
              onClick={syncFromFilyDock}
            />
          </div>
        )}
      </div>

      {tab === "Movies" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search movies…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 80px 1fr 80px 80px 1fr 110px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["", "Title", "Year", "Genre", "Rating", "Status", "Featured", "Actions"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                )
              )}
            </div>
            {movies
              .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
              .map((m, i, arr) => {
                const feedbackCount = getFeedbackCount(m.id, "movie");
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 2fr 80px 1fr 80px 80px 1fr 110px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={m.image}
                        style={{ width: 34, height: 48, objectFit: "cover", borderRadius: 6 }}
                        alt={m.title}
                      />
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <span
                      style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}
                    >
                      {m.title}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.45)" }}>
                      {m.year}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.45)" }}>
                      {m.genre}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Star size={11} fill={GOLD} color={GOLD} />
                      <span style={{ fontFamily: F, fontSize: 12, color: GOLD, fontWeight: 700 }}>
                        {m.rating}
                      </span>
                    </div>
                    <Pill label={m.status} color={sColor(m.status)} />
                    <button
                      onClick={() => toggleMovieFeatured(m.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: F,
                        fontSize: 12,
                        color: m.featured ? GOLD : "rgba(240,240,248,0.3)",
                        minHeight: "unset",
                      }}
                    >
                      {m.featured ? (
                        <ToggleRight size={20} color={GOLD} />
                      ) : (
                        <ToggleLeft size={20} color="rgba(240,240,248,0.2)" />
                      )}
                      {m.featured ? "Featured" : "Off"}
                    </button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                      <Btn
                        sm
                        icon={m.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                        color={GOLD}
                        onClick={() => toggleMovieStatus(m.id)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === "Articles" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search articles…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 100px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Title", "Author", "Category", "Published", "Views", "Status", "Actions"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                )
              )}
            </div>
            {articles
              .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
              .map((a, i, arr) => {
                const feedbackCount = getFeedbackCount(a.id, "article");
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 100px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontFamily: F,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f0f0f8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {a.title}
                      </span>
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            minWidth: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                            padding: "0 4px",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {a.author}
                    </span>
                    <Pill label={a.category} color={BLUE} />
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                      {a.published}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {a.views.toLocaleString()}
                    </span>
                    <Pill label={a.status} color={sColor(a.status)} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                      <Btn
                        sm
                        icon={a.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                        color={GOLD}
                        onClick={() => toggleArticleStatus(a.id)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === "Gossip" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search gossip…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 120px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Headline", "Source", "Tags", "Published", "Views", "Status", "Actions"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                )
              )}
            </div>
            {gossip
              .filter((g) => g.headline.toLowerCase().includes(search.toLowerCase()))
              .map((g, i, arr) => (
                <div
                  key={g.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 120px",
                    gap: 10,
                    padding: "11px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f0f8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {g.headline}
                  </span>
                  <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                    {g.source}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {g.tags.slice(0, 2).map((t) => (
                      <Pill key={t} label={t} color={A} />
                    ))}
                  </div>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                    {g.published}
                  </span>
                  <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                    {g.views.toLocaleString()}
                  </span>
                  <Pill label={g.status} color={sColor(g.status)} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn sm icon={<Edit3 size={12} />} color={BLUE} />
                    <Btn
                      sm
                      icon={g.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                      color={GOLD}
                      onClick={() => toggleGossipStatus(g.id)}
                    />
                    <Btn sm icon={<Trash2 size={12} />} danger onClick={() => deleteGossip(g.id)} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === "Cast & Crew" && (
        <div>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search cast & crew by name or role…"
          />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 1fr 100px 1fr 90px 100px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["", "Name", "Role", "Credits", "Popular Movies", "Featured", "Actions"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.35)",
                    letterSpacing: 0.5,
                  }}
                >
                  {h.toUpperCase()}
                </span>
              ))}
            </div>
            {castCrew
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.role.toLowerCase().includes(search.toLowerCase())
              )
              .map((c, i, arr) => {
                const feedbackCount = getFeedbackCount(c.id, "cast");
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 1fr 100px 1fr 90px 100px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={c.image}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "50%" }}
                        alt={c.name}
                      />
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}
                      >
                        {c.name}
                      </div>
                      {c.birthYear && (
                        <div
                          style={{ fontFamily: F, fontSize: 10, color: "rgba(240,240,248,0.3)" }}
                        >
                          Born {c.birthYear}
                        </div>
                      )}
                    </div>
                    <Pill
                      label={c.role.replace("_", " ").toUpperCase()}
                      color={roleColor(c.role)}
                    />
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {c.credits} {c.credits === 1 ? "film" : "films"}
                    </span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                      {c.popularMovies.slice(0, 2).map((movie) => (
                        <span
                          key={movie}
                          style={{
                            fontFamily: F,
                            fontSize: 10,
                            color: "rgba(240,240,248,0.4)",
                            background: "rgba(255,255,255,0.04)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {movie}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleCastFeatured(c.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: F,
                        fontSize: 11,
                        color: c.featured ? GOLD : "rgba(240,240,248,0.3)",
                        minHeight: "unset",
                      }}
                    >
                      {c.featured ? (
                        <ToggleRight size={18} color={GOLD} />
                      ) : (
                        <ToggleLeft size={18} color="rgba(240,240,248,0.2)" />
                      )}
                      {c.featured ? "Yes" : "No"}
                    </button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: SOCIAL ──────────────────────────────────────────────────────────

function SocialSection() {
  const [tab, setTab] = useState("Communities");
  const [communities, setCommunities] = useState(ADMIN_COMMUNITIES);
  const [posts, setPosts] = useState(ADMIN_POSTS);
  const [rooms, _setRooms] = useState(ADMIN_ROOMS);
  const [search, setSearch] = useState("");

  function toggleCommunityStatus(id: string) {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "suspended" : "active" } : c
      )
    );
  }
  function toggleVerified(id: string) {
    setCommunities((prev) => prev.map((c) => (c.id === id ? { ...c, verified: !c.verified } : c)));
  }
  function removePost(id: string) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "removed" } : p)));
  }

  const roomColor = (s: string) => (s === "live" ? GREEN : s === "scheduled" ? BLUE : RED);

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.topic.toLowerCase().includes(search.toLowerCase()) ||
      c.moderator.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionTitle
        icon={<MessageSquare size={20} />}
        title="SOCIAL MANAGEMENT"
        sub={`${communities.length} communities · manage posts, moderation and live rooms`}
      />
      <SubTabs tabs={["Communities", "Posts", "Rooms"]} active={tab} onTab={setTab} />

      {tab === "Communities" && (
        <div>
          {/* Search and Actions */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search communities, topics, moderators…"
            />
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <Btn label="Export CSV" icon={<Download size={13} />} color={TEAL} />
              <Btn label="Add Community" icon={<Plus size={13} />} color={A} />
            </div>
          </div>

          <div style={{ ...card, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 1fr 80px 80px 1fr 1fr 160px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["", "Community", "Topic", "Members", "Posts", "Moderator", "Status", "Actions"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                )
              )}
            </div>
            {filteredCommunities.map((c, i, arr) => (
              <div
                key={c.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 2fr 1fr 80px 80px 1fr 1fr 160px",
                  gap: 10,
                  padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <img
                  src={
                    c.image ||
                    "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=60&h=60&fit=crop"
                  }
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                  alt={c.name}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#f0f0f8",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {c.name}
                      {c.verified && <CheckCircle size={13} color={BLUE} />}
                    </div>
                    {c.description && (
                      <div
                        style={{
                          fontFamily: F,
                          fontSize: 10,
                          color: "rgba(240,240,248,0.3)",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {c.description}
                      </div>
                    )}
                  </div>
                </div>
                <Pill label={c.topic} color={A} />
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.6)" }}>
                  {c.members.toLocaleString()}
                </span>
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.6)" }}>
                  {c.posts.toLocaleString()}
                </span>
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.5)" }}>
                  {c.moderator}
                </span>
                <Pill
                  label={c.status}
                  color={c.status === "active" ? GREEN : c.status === "suspended" ? GOLD : RED}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                  <Btn
                    sm
                    label={c.verified ? "Unverify" : "Verify"}
                    color={BLUE}
                    onClick={() => toggleVerified(c.id)}
                  />
                  <Btn
                    sm
                    label={c.status === "active" ? "Suspend" : "Restore"}
                    color={c.status === "active" ? GOLD : GREEN}
                    onClick={() => toggleCommunityStatus(c.id)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              fontFamily: F,
              fontSize: 12,
              color: "rgba(240,240,248,0.3)",
              marginTop: 12,
              textAlign: "center" as const,
            }}
          >
            Showing {filteredCommunities.length} of {communities.length} communities
          </div>
        </div>
      )}

      {tab === "Posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((p) => (
            <div
              key={p.id}
              style={{
                ...card,
                padding: "16px 18px",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: B,
                  fontSize: 13,
                  color: "rgba(240,240,248,0.6)",
                  flexShrink: 0,
                }}
              >
                {p.author[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: "wrap" as const,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(240,240,248,0.7)",
                    }}
                  >
                    @{p.author}
                  </span>
                  <Pill label={p.community} color={A} />
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                    {p.time}
                  </span>
                  {p.status === "removed" && <Pill label="Removed" color={RED} />}
                </div>
                <p
                  style={{
                    fontFamily: F,
                    fontSize: 13,
                    color: "rgba(240,240,248,0.65)",
                    margin: "0 0 8px",
                    fontWeight: 300,
                    lineHeight: 1.5,
                  }}
                >
                  {p.preview}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Flag
                    size={12}
                    color={p.flags > 8 ? RED : p.flags > 3 ? GOLD : "rgba(240,240,248,0.3)"}
                  />
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      color: p.flags > 8 ? RED : p.flags > 3 ? GOLD : "rgba(240,240,248,0.4)",
                      fontWeight: 600,
                    }}
                  >
                    {p.flags} flags
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.status === "active" && (
                  <Btn
                    sm
                    label="Remove"
                    danger
                    icon={<X size={11} />}
                    onClick={() => removePost(p.id)}
                  />
                )}
                <Btn sm label="View" color={BLUE} icon={<Eye size={11} />} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Rooms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rooms.map((r) => (
            <div
              key={r.id}
              style={{
                ...card,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: roomColor(r.status),
                  boxShadow: `0 0 6px ${roomColor(r.status)}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f0f0f8",
                    marginBottom: 3,
                  }}
                >
                  {r.name}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                    Host: @{r.host}
                  </span>
                  {r.status === "live" && (
                    <span style={{ fontFamily: F, fontSize: 11, color: GREEN, fontWeight: 600 }}>
                      {r.participants} watching
                    </span>
                  )}
                  <Pill label={r.topic} color={A} />
                </div>
              </div>
              <Pill label={r.status.toUpperCase()} color={roomColor(r.status)} />
              <div style={{ display: "flex", gap: 6 }}>
                <Btn sm label="Close" danger icon={<X size={11} />} />
                <Btn sm label="Feature" color={GOLD} icon={<Star size={11} />} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SECTION: ENTERTAINMENT ───────────────────────────────────────────────────

function EntertainSection() {
  const [tab, setTab] = useState("Quizzes");
  const [quizzes, setQuizzes] = useState(ADMIN_QUIZZES);
  const [memes, setMemes] = useState(ADMIN_MEMES);

  function toggleQuizStatus(id: string) {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, status: q.status === "active" ? "inactive" : "active" } : q
      )
    );
  }
  function toggleQuizFeatured(id: string) {
    setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, featured: !q.featured } : q)));
  }
  function updateMeme(id: string, status: "approved" | "rejected" | "pending") {
    setMemes((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  const games = [
    {
      id: "g1",
      name: "Film Trivia Blitz",
      desc: "Fast-paced 60s quiz game",
      plays: 28400,
      enabled: true,
      color: A,
    },
    {
      id: "g2",
      name: "Movie Wordle",
      desc: "Guess the movie in 6 tries",
      plays: 19200,
      enabled: true,
      color: GOLD,
    },
    {
      id: "g3",
      name: "Scene It?",
      desc: "Identify movies from screenshots",
      plays: 12100,
      enabled: false,
      color: BLUE,
    },
    {
      id: "g4",
      name: "Rating Roulette",
      desc: "Guess IMDb ratings",
      plays: 8700,
      enabled: true,
      color: TEAL,
    },
    {
      id: "g5",
      name: "Director's Chair",
      desc: "Match scenes to directors",
      plays: 5400,
      enabled: false,
      color: RED,
    },
  ];

  return (
    <div>
      <SectionTitle
        icon={<Gamepad2 size={20} />}
        title="ENTERTAINMENT"
        sub="Manage quizzes, games and meme submissions"
      />
      <SubTabs tabs={["Quizzes", "Games", "Memes"]} active={tab} onTab={setTab} />

      {tab === "Quizzes" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <Btn label="New Quiz" icon={<Plus size={13} />} color={A} />
          </div>
          <div style={{ ...card, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 1fr 140px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Title", "Category", "Qs", "Plays", "Avg%", "Status", "Featured", "Actions"].map(
                (h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: F,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.35)",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                )
              )}
            </div>
            {quizzes.map((q, i, arr) => (
              <div
                key={q.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 1fr 140px",
                  gap: 10,
                  padding: "11px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}>
                  {q.title}
                </span>
                <Pill label={q.category} color={A} />
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                  {q.questions}
                </span>
                <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                  {q.plays.toLocaleString()}
                </span>
                <span
                  style={{
                    fontFamily: F,
                    fontSize: 12,
                    color: q.avgScore >= 75 ? GREEN : q.avgScore >= 55 ? GOLD : RED,
                    fontWeight: 700,
                  }}
                >
                  {q.avgScore}%
                </span>
                <Pill label={q.status} color={q.status === "active" ? GREEN : RED} />
                <button
                  onClick={() => toggleQuizFeatured(q.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: F,
                    fontSize: 12,
                    color: q.featured ? GOLD : "rgba(240,240,248,0.3)",
                    minHeight: "unset",
                  }}
                >
                  {q.featured ? (
                    <ToggleRight size={20} color={GOLD} />
                  ) : (
                    <ToggleLeft size={20} color="rgba(240,240,248,0.2)" />
                  )}
                  {q.featured ? "Featured" : "Off"}
                </button>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn sm icon={<Edit3 size={12} />} color={BLUE} />
                  <Btn
                    sm
                    label={q.status === "active" ? "Disable" : "Enable"}
                    color={q.status === "active" ? GOLD : GREEN}
                    onClick={() => toggleQuizStatus(q.id)}
                  />
                  <Btn sm icon={<Trash2 size={12} />} danger />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Games" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {games.map((g) => (
            <div
              key={g.id}
              style={{
                ...card,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${g.color}18`,
                  border: `1px solid ${g.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: g.color,
                  flexShrink: 0,
                }}
              >
                <Gamepad2 size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#f0f0f8",
                    marginBottom: 3,
                  }}
                >
                  {g.name}
                </div>
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 12,
                    color: "rgba(240,240,248,0.42)",
                    fontWeight: 300,
                  }}
                >
                  {g.desc}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontFamily: B, fontSize: 20, letterSpacing: 1, color: g.color }}>
                    {g.plays.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: F, fontSize: 10, color: "rgba(240,240,248,0.3)" }}>
                    PLAYS
                  </div>
                </div>
                <Pill label={g.enabled ? "Active" : "Disabled"} color={g.enabled ? GREEN : RED} />
                <Btn sm label={g.enabled ? "Disable" : "Enable"} color={g.enabled ? RED : GREEN} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Memes" && (
        <div>
          <div
            style={{
              fontFamily: F,
              fontSize: 13,
              color: "rgba(240,240,248,0.4)",
              marginBottom: 16,
            }}
          >
            {memes.filter((m) => m.status === "pending").length} memes pending review
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 14,
            }}
          >
            {memes.map((m) => (
              <div key={m.id} style={{ ...card, overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={m.image}
                    alt={m.title}
                    style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ position: "absolute", top: 8, right: 8 }}>
                    <Pill
                      label={m.status}
                      color={m.status === "approved" ? GREEN : m.status === "rejected" ? RED : GOLD}
                    />
                  </div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f0f8",
                      marginBottom: 4,
                    }}
                  >
                    {m.title}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                      by @{m.author}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                      {m.submitted}
                    </span>
                  </div>
                  {m.status === "pending" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn
                        label="Approve"
                        color={GREEN}
                        icon={<Check size={12} />}
                        onClick={() => updateMeme(m.id, "approved")}
                      />
                      <Btn
                        label="Reject"
                        danger
                        icon={<X size={12} />}
                        onClick={() => updateMeme(m.id, "rejected")}
                      />
                    </div>
                  )}
                  {m.status !== "pending" && (
                    <button
                      onClick={() => updateMeme(m.id, "pending")}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "5px 12px",
                        fontFamily: F,
                        fontSize: 11,
                        color: "rgba(240,240,248,0.4)",
                        cursor: "pointer",
                        minHeight: "unset",
                      }}
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: MODERATION ──────────────────────────────────────────────────────

function ModerationSection() {
  const [reports, setReports] = useState(ADMIN_REPORTS);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("pending");

  function resolve(id: string, action: "resolved" | "dismissed") {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
  }

  const typeIcon = (t: ReportType) => {
    if (t === "post") return <PenLine size={13} />;
    if (t === "review") return <Star size={13} />;
    if (t === "user") return <Users size={13} />;
    if (t === "community") return <MessageSquare size={13} />;
    if (t === "article") return <FilmIcon size={13} />;
    if (t === "message") return <Send size={13} />;
    return <Flag size={13} />;
  };

  const typeColor = (t: ReportType) => {
    if (t === "post") return BLUE;
    if (t === "review") return GOLD;
    if (t === "user") return RED;
    if (t === "community") return A;
    if (t === "article") return TEAL;
    if (t === "message") return GREEN;
    return BLUE;
  };

  const reasonColor = (r: ReportReason) => {
    if (r === "spam" || r === "scam") return GOLD;
    if (r === "harassment" || r === "hate_speech" || r === "violence") return RED;
    if (r === "misinformation" || r === "copyright") return A;
    if (r === "nudity" || r === "self_harm") return RED;
    if (r === "impersonation") return GOLD;
    return TEAL;
  };

  const severityColor = (s?: string) => (s === "high" ? RED : s === "medium" ? GOLD : BLUE);

  const visible = reports.filter((r) => filter === "all" || r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div>
      <SectionTitle
        icon={<Shield size={20} />}
        title="MODERATION QUEUE"
        sub={`${pendingCount} reports awaiting action`}
      />

      {/* Summary cards */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}
      >
        {[
          {
            label: "Pending",
            value: reports.filter((r) => r.status === "pending").length,
            color: RED,
          },
          {
            label: "Resolved",
            value: reports.filter((r) => r.status === "resolved").length,
            color: GREEN,
          },
          {
            label: "Dismissed",
            value: reports.filter((r) => r.status === "dismissed").length,
            color: GOLD,
          },
          { label: "Total", value: reports.length, color: A },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <div
              style={{
                fontFamily: B,
                fontSize: 30,
                letterSpacing: 1,
                color: s.color,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.38)" }}>
              {s.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {(["all", "pending", "resolved", "dismissed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 100,
              background: filter === f ? `${A}18` : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f ? `${A}40` : "rgba(255,255,255,0.08)"}`,
              fontFamily: F,
              fontSize: 12,
              fontWeight: filter === f ? 700 : 400,
              color: filter === f ? A : "rgba(240,240,248,0.45)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((r) => (
          <div
            key={r.id}
            style={{
              ...card,
              padding: "16px 18px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${typeColor(r.type)}15`,
                border: `1px solid ${typeColor(r.type)}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: typeColor(r.type),
                flexShrink: 0,
              }}
            >
              {typeIcon(r.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                  flexWrap: "wrap" as const,
                }}
              >
                <Pill label={r.type.toUpperCase()} color={typeColor(r.type)} />
                <Pill
                  label={r.reason.replace("_", " ").toUpperCase()}
                  color={reasonColor(r.reason)}
                />
                {r.severity && (
                  <Pill
                    label={`${r.severity.toUpperCase()} SEVERITY`}
                    color={severityColor(r.severity)}
                  />
                )}
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                  Reported by @{r.reporter}
                </span>
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.25)" }}>
                  {r.time}
                </span>
              </div>
              <p
                style={{
                  fontFamily: F,
                  fontSize: 13,
                  color: "rgba(240,240,248,0.6)",
                  margin: "0 0 4px",
                  fontWeight: 300,
                  lineHeight: 1.5,
                }}
              >
                "{r.contentPreview}"
              </p>
              {r.additionalInfo && (
                <p
                  style={{
                    fontFamily: F,
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                    margin: "4px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  Additional info: {r.additionalInfo}
                </p>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              {r.status === "pending" ? (
                <>
                  <Btn sm label="Warn User" color={GOLD} icon={<ShieldAlert size={11} />} />
                  <Btn sm label="Remove" danger icon={<Trash2 size={11} />} />
                  <Btn
                    sm
                    label="Dismiss"
                    color={TEAL}
                    icon={<Check size={11} />}
                    onClick={() => resolve(r.id, "dismissed")}
                  />
                  <Btn
                    sm
                    label="Ban User"
                    danger
                    icon={<Ban size={11} />}
                    onClick={() => resolve(r.id, "resolved")}
                  />
                </>
              ) : (
                <Pill label={r.status} color={r.status === "resolved" ? GREEN : GOLD} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION: CONTENT FEEDBACK ────────────────────────────────────────────────

function ContentFeedbackSection() {
  const [feedback, setFeedback] = useState(CONTENT_FEEDBACK);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentFeedbackType>("all");

  function approveFeedback(id: string) {
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: "approved" as FeedbackStatus,
              reviewedBy: "Admin",
              reviewedAt: "Just now",
            }
          : f
      )
    );
  }

  function rejectFeedback(id: string) {
    setFeedback((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: "rejected" as FeedbackStatus,
              reviewedBy: "Admin",
              reviewedAt: "Just now",
            }
          : f
      )
    );
  }

  const typeIcon = (t: ContentFeedbackType) => {
    if (t === "movie") return <FilmIcon size={14} />;
    if (t === "article") return <PenLine size={14} />;
    return <Users size={14} />;
  };

  const typeColor = (t: ContentFeedbackType) => (t === "movie" ? GOLD : t === "article" ? BLUE : A);

  const categoryColor = (c: FeedbackCategory) => {
    if (c === "incorrect_info") return RED;
    if (c === "missing_data") return GOLD;
    if (c === "image_quality") return A;
    if (c === "duplicate") return TEAL;
    return BLUE;
  };

  const priorityColor = (p: string) => (p === "high" ? RED : p === "medium" ? GOLD : BLUE);

  const visible = feedback.filter((f) => {
    const matchStatus = filter === "all" || f.status === filter;
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchStatus && matchType;
  });

  const pendingCount = feedback.filter((f) => f.status === "pending").length;

  return (
    <div>
      <SectionTitle
        icon={<Flag size={20} />}
        title="CONTENT FEEDBACK"
        sub={`${pendingCount} pending user suggestions for FilyDock content`}
      />

      {/* Stats */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}
      >
        {[
          {
            label: "Pending",
            value: feedback.filter((f) => f.status === "pending").length,
            color: GOLD,
          },
          {
            label: "Approved",
            value: feedback.filter((f) => f.status === "approved").length,
            color: GREEN,
          },
          {
            label: "Rejected",
            value: feedback.filter((f) => f.status === "rejected").length,
            color: RED,
          },
          { label: "Total", value: feedback.length, color: A },
        ].map((s) => (
          <div key={s.label} style={{ ...card, padding: "16px 18px" }}>
            <div
              style={{
                fontFamily: B,
                fontSize: 30,
                letterSpacing: 1,
                color: s.color,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.38)" }}>
              {s.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" as const }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px",
                borderRadius: 100,
                background: filter === f ? `${A}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f ? `${A}40` : "rgba(255,255,255,0.08)"}`,
                fontFamily: F,
                fontSize: 12,
                fontWeight: filter === f ? 700 : 400,
                color: filter === f ? A : "rgba(240,240,248,0.45)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "0 12px",
            height: 32,
            fontFamily: F,
            fontSize: 12,
            color: "rgba(240,240,248,0.7)",
            cursor: "pointer",
          }}
        >
          <option value="all">All Types</option>
          <option value="movie">Movies</option>
          <option value="article">Articles</option>
          <option value="cast">Cast & Crew</option>
        </select>
      </div>

      {/* Feedback list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visible.map((f) => (
          <div
            key={f.id}
            style={{
              ...card,
              padding: "18px 20px",
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${typeColor(f.type)}15`,
                border: `1px solid ${typeColor(f.type)}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: typeColor(f.type),
                flexShrink: 0,
              }}
            >
              {typeIcon(f.type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: "wrap" as const,
                }}
              >
                <Pill label={f.type.toUpperCase()} color={typeColor(f.type)} />
                <Pill
                  label={f.category.replace("_", " ").toUpperCase()}
                  color={categoryColor(f.category)}
                />
                <Pill
                  label={`${f.priority} priority`.toUpperCase()}
                  color={priorityColor(f.priority)}
                />
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                  By @{f.submittedBy}
                </span>
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.25)" }}>
                  {f.submittedAt}
                </span>
              </div>
              <div
                style={{
                  fontFamily: F,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#f0f0f8",
                  marginBottom: 4,
                }}
              >
                {f.contentTitle}
              </div>
              <p
                style={{
                  fontFamily: F,
                  fontSize: 13,
                  color: "rgba(240,240,248,0.6)",
                  margin: "0 0 8px",
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                {f.description}
              </p>
              {f.suggestedCorrection && (
                <div
                  style={{
                    background: "rgba(46,204,113,0.08)",
                    border: "1px solid rgba(46,204,113,0.2)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 10,
                      fontWeight: 700,
                      color: GREEN,
                      marginBottom: 3,
                      letterSpacing: 0.5,
                    }}
                  >
                    SUGGESTED CORRECTION
                  </div>
                  <div style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.65)" }}>
                    {f.suggestedCorrection}
                  </div>
                </div>
              )}
              {f.status !== "pending" && (
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                    marginTop: 8,
                  }}
                >
                  Reviewed by @{f.reviewedBy} · {f.reviewedAt}
                  {f.adminNotes && <span> · {f.adminNotes}</span>}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              {f.status === "pending" ? (
                <>
                  <Btn sm label="View in FilyDock" color={BLUE} icon={<Globe size={11} />} />
                  <Btn
                    sm
                    label="Approve"
                    color={GREEN}
                    icon={<Check size={11} />}
                    onClick={() => approveFeedback(f.id)}
                  />
                  <Btn
                    sm
                    label="Reject"
                    danger
                    icon={<X size={11} />}
                    onClick={() => rejectFeedback(f.id)}
                  />
                </>
              ) : (
                <Pill
                  label={f.status.toUpperCase()}
                  color={f.status === "approved" ? GREEN : RED}
                />
              )}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div style={{ ...card, padding: "40px", textAlign: "center" as const }}>
            <div style={{ fontFamily: F, fontSize: 14, color: "rgba(240,240,248,0.3)" }}>
              No feedback found matching your filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SECTION: NOTIFICATIONS ───────────────────────────────────────────────────

function NotificationsSection() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("All Users");
  const [type, setType] = useState<"info" | "warning" | "announcement">("announcement");
  const [sent, setSent] = useState(SENT_NOTIFICATIONS);
  const [justSent, setJustSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !message) return;
    const newNotif = {
      id: `n${Date.now()}`,
      title,
      message,
      target,
      type,
      sent: "Just now",
      reach: target === "All Users" ? 84200 : 14000,
    };
    setSent((prev) => [newNotif, ...prev]);
    setTitle("");
    setMessage("");
    setJustSent(true);
    setTimeout(() => setJustSent(false), 3000);
  }

  const typeColor = (t: string) => (t === "announcement" ? A : t === "warning" ? RED : BLUE);
  const typeEmoji = (t: string) => (t === "announcement" ? "📣" : t === "warning" ? "⚠️" : "ℹ️");

  return (
    <div>
      <SectionTitle
        icon={<Bell size={20} />}
        title="NOTIFICATIONS"
        sub="Compose and send platform-wide announcements"
      />

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}
      >
        {/* Compose form */}
        <div style={{ ...card, padding: "24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 18,
              letterSpacing: 2,
              color: "#f0f0f8",
              marginBottom: 20,
            }}
          >
            COMPOSE
          </div>

          {justSent && (
            <div
              style={{
                background: "rgba(46,204,113,0.1)",
                border: "1px solid rgba(46,204,113,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle size={14} color={GREEN} />
              <span style={{ fontFamily: F, fontSize: 13, color: GREEN }}>
                Notification sent successfully!
              </span>
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(240,240,248,0.4)",
                  letterSpacing: 0.5,
                }}
              >
                TITLE
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title…"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontFamily: F,
                  fontSize: 13,
                  color: "#f0f0f8",
                  outline: "none",
                }}
              />
            </div>
            {/* Message */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontFamily: F,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(240,240,248,0.4)",
                  letterSpacing: 0.5,
                }}
              >
                MESSAGE
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your notification message…"
                rows={4}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontFamily: F,
                  fontSize: 13,
                  color: "#f0f0f8",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
            {/* Target + Type row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.4)",
                    letterSpacing: 0.5,
                  }}
                >
                  TARGET AUDIENCE
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontFamily: F,
                    fontSize: 13,
                    color: "rgba(240,240,248,0.75)",
                    cursor: "pointer",
                  }}
                >
                  <option>All Users</option>
                  <option>Content Users</option>
                  <option>Social Users</option>
                  <option>Entertainment Users</option>
                  <option>New Users (last 7 days)</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontFamily: F,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.4)",
                    letterSpacing: 0.5,
                  }}
                >
                  TYPE
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontFamily: F,
                    fontSize: 13,
                    color: "rgba(240,240,248,0.75)",
                    cursor: "pointer",
                  }}
                >
                  <option value="announcement">📣 Announcement</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="info">ℹ️ Info</option>
                </select>
              </div>
            </div>
            {/* Preview */}
            {title && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px",
                }}
              >
                <div
                  style={{
                    fontFamily: F,
                    fontSize: 10,
                    color: "rgba(240,240,248,0.3)",
                    marginBottom: 8,
                    letterSpacing: 1,
                  }}
                >
                  PREVIEW
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{typeEmoji(type)}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#f0f0f8",
                        marginBottom: 3,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 12,
                        color: "rgba(240,240,248,0.5)",
                        fontWeight: 300,
                      }}
                    >
                      {message || "Your message preview…"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button
              type="submit"
              style={{
                height: 46,
                borderRadius: 12,
                background: `linear-gradient(135deg,${A},#5e3fd8)`,
                border: "none",
                cursor: "pointer",
                fontFamily: F,
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: `0 4px 16px ${A}30`,
                minHeight: "unset",
              }}
            >
              <Send size={15} /> Send Notification
            </button>
          </form>
        </div>

        {/* Sent history */}
        <div style={{ ...card, padding: "24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 18,
              letterSpacing: 2,
              color: "#f0f0f8",
              marginBottom: 20,
            }}
          >
            SENT HISTORY
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sent.map((n) => (
              <div
                key={n.id}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "13px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{typeEmoji(n.type)}</span>
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f0f0f8",
                      flex: 1,
                    }}
                  >
                    {n.title}
                  </span>
                  <Pill label={n.type} color={typeColor(n.type)} />
                </div>
                <p
                  style={{
                    fontFamily: F,
                    fontSize: 12,
                    color: "rgba(240,240,248,0.45)",
                    margin: "0 0 8px",
                    fontWeight: 300,
                    lineHeight: 1.5,
                  }}
                >
                  {n.message}
                </p>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                    {n.sent}
                  </span>
                  <span style={{ fontFamily: F, fontSize: 11, color: TEAL, fontWeight: 600 }}>
                    {n.reach.toLocaleString()} reached
                  </span>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                    {n.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: ANALYTICS ───────────────────────────────────────────────────────

function AnalyticsSection() {
  const topContent = [
    { title: "Realm of Ash", type: "Movie", views: 284000, rating: 9.1, color: GOLD },
    {
      title: "Nolan Confirms Musical Rumour",
      type: "Gossip",
      views: 34000,
      rating: null,
      color: RED,
    },
    { title: "Sci-Fi Supremacy Quiz", type: "Quiz", views: 18400, rating: null, color: A },
    {
      title: "Why 2025 is the Best Year for Sci-Fi",
      type: "Article",
      views: 12400,
      rating: null,
      color: BLUE,
    },
    { title: "The Obsidian Protocol", type: "Movie", views: 11800, rating: 8.7, color: GOLD },
  ];

  return (
    <div>
      <SectionTitle
        icon={<BarChart3 size={20} />}
        title="ANALYTICS"
        sub="Platform-wide traffic, engagement and content performance"
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Monthly Active"
          value="73K"
          sub="Up from 64K"
          icon={<Users size={16} />}
          color={A}
          trend={14}
        />
        <StatCard
          label="Page Views"
          value="2.4M"
          sub="This month"
          icon={<Eye size={16} />}
          color={BLUE}
          trend={9}
        />
        <StatCard
          label="Avg Session"
          value="14.2m"
          sub="Per user"
          icon={<Clock size={16} />}
          color={TEAL}
          trend={3}
        />
        <StatCard
          label="Content Views"
          value="636K"
          sub="All types"
          icon={<Film size={16} />}
          color={GOLD}
          trend={7}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* DAU Trend */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            DAILY ACTIVE USERS (THIS WEEK)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={DAU_TREND}>
              <CartesianGrid key="dau-grid" strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                key="dau-xaxis"
                dataKey="day"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="dau-yaxis"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
              />
              <Tooltip
                key="dau-tooltip"
                contentStyle={{
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 12,
                }}
              />
              <Line
                key="dau-line"
                type="monotone"
                dataKey="dau"
                stroke={A}
                strokeWidth={2.5}
                dot={{ fill: A, strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Module usage */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            MODULE SESSIONS
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MODULE_USAGE} barSize={28}>
              <CartesianGrid
                key="mod-grid"
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                key="mod-xaxis"
                dataKey="name"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="mod-yaxis"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                key="mod-tooltip"
                contentStyle={{
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 12,
                }}
              />
              <Bar key="mod-bar" dataKey="sessions" radius={[4, 4, 0, 0]}>
                {MODULE_USAGE.map((entry) => (
                  <Cell key={`mod-cell-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Content views breakdown */}
        <div style={{ ...card, padding: "22px 24px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            CONTENT VIEWS BY TYPE
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CONTENT_VIEWS} layout="vertical" barSize={18}>
              <CartesianGrid
                key="cv-grid"
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                horizontal={false}
              />
              <XAxis
                key="cv-xaxis"
                type="number"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.35)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <YAxis
                key="cv-yaxis"
                type="category"
                dataKey="type"
                tick={{ fontFamily: F, fontSize: 11, fill: "rgba(240,240,248,0.5)" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                key="cv-tooltip"
                contentStyle={{
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 12,
                }}
              />
              <Bar key="cv-bar" dataKey="views" radius={[0, 4, 4, 0]}>
                {CONTENT_VIEWS.map((entry) => (
                  <Cell key={`cv-cell-${entry.type}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top content table */}
        <div style={{ ...card, padding: "22px" }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 1.5,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            TOP CONTENT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topContent.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom:
                    i < topContent.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <span
                  style={{
                    fontFamily: B,
                    fontSize: 18,
                    letterSpacing: 1,
                    color: "rgba(240,240,248,0.2)",
                    width: 22,
                    textAlign: "center" as const,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(240,240,248,0.8)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {c.title}
                  </div>
                  <Pill label={c.type} color={c.color} />
                </div>
                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                  <div
                    style={{
                      fontFamily: F,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(240,240,248,0.6)",
                    }}
                  >
                    {c.views >= 1000 ? `${(c.views / 1000).toFixed(0)}K` : c.views}
                  </div>
                  <div style={{ fontFamily: F, fontSize: 10, color: "rgba(240,240,248,0.3)" }}>
                    views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROLE MANAGEMENT ──────────────────────────────────────────────────────────

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: {
    canCreateContent: boolean;
    canModerateContent: boolean;
    canManageUsers: boolean;
    canAccessAnalytics: boolean;
    canManageRoles: boolean;
  };
  memberCount: number;
}

function RoleManagementSection() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Admin",
      description: "Full access to all features and settings",
      color: RED,
      permissions: {
        canCreateContent: true,
        canModerateContent: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canManageRoles: true,
      },
      memberCount: 2,
    },
    {
      id: "2",
      name: "Moderator",
      description: "Can moderate content and manage community",
      color: GOLD,
      permissions: {
        canCreateContent: true,
        canModerateContent: true,
        canManageUsers: false,
        canAccessAnalytics: true,
        canManageRoles: false,
      },
      memberCount: 5,
    },
    {
      id: "3",
      name: "Member",
      description: "Standard user with basic permissions",
      color: TEAL,
      permissions: {
        canCreateContent: true,
        canModerateContent: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canManageRoles: false,
      },
      memberCount: 142,
    },
  ]);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const addNewRole = () => {
    const newRole: Role = {
      id: String(Date.now()),
      name: "New Role",
      description: "Describe this role",
      color: A,
      permissions: {
        canCreateContent: false,
        canModerateContent: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canManageRoles: false,
      },
      memberCount: 0,
    };
    setEditingRole(newRole);
    setShowRoleModal(true);
  };

  const editRole = (role: Role) => {
    setEditingRole(role);
    setShowRoleModal(true);
  };

  const saveRole = () => {
    if (editingRole) {
      const exists = roles.find((r) => r.id === editingRole.id);
      if (exists) {
        setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? editingRole : r)));
      } else {
        setRoles((prev) => [...prev, editingRole]);
      }
      setShowRoleModal(false);
      setEditingRole(null);
    }
  };

  const deleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
  };

  const togglePermission = (permission: keyof Role["permissions"]) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        permissions: {
          ...editingRole.permissions,
          [permission]: !editingRole.permissions[permission],
        },
      });
    }
  };

  const ROLE_COLORS = [RED, GOLD, TEAL, A, BLUE, GREEN, "#ff6b6b", "#9b59b6"];

  return (
    <>
      <div style={{ ...card, padding: "24px", marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: B,
                fontSize: 18,
                letterSpacing: 2,
                color: "#f0f0f8",
                marginBottom: 6,
              }}
            >
              ROLE-BASED ACCESS
            </div>
            <p
              style={{
                fontFamily: F,
                fontSize: 13,
                color: "rgba(240,240,248,0.4)",
                margin: 0,
                fontWeight: 300,
              }}
            >
              Create and manage roles with custom permissions
            </p>
          </div>
          <Btn label="Add Role" icon={<Plus size={14} />} onClick={addNewRole} color={A} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {roles.map((role) => (
            <div
              key={role.id}
              style={{
                background: `${role.color}05`,
                border: `1px solid ${role.color}20`,
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: role.color,
                      boxShadow: `0 0 8px ${role.color}50`,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f0f0f8",
                        marginBottom: 2,
                      }}
                    >
                      {role.name}
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 12,
                        color: "rgba(240,240,248,0.35)",
                        fontWeight: 300,
                      }}
                    >
                      {role.description}
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 11,
                        color: "rgba(240,240,248,0.25)",
                        marginTop: 4,
                      }}
                    >
                      {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    sm
                    icon={<Edit3 size={12} />}
                    color={role.color}
                    onClick={() => editRole(role)}
                  />
                  <Btn sm icon={<Trash2 size={12} />} danger onClick={() => deleteRole(role.id)} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {[
                  { key: "canCreateContent" as const, label: "Create" },
                  { key: "canModerateContent" as const, label: "Moderate" },
                  { key: "canManageUsers" as const, label: "Manage Users" },
                  { key: "canAccessAnalytics" as const, label: "Analytics" },
                  { key: "canManageRoles" as const, label: "Manage Roles" },
                ].map((perm) => (
                  <span
                    key={perm.key}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: role.permissions[perm.key]
                        ? `${role.color}18`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${role.permissions[perm.key] ? `${role.color}35` : "rgba(255,255,255,0.06)"}`,
                      fontFamily: F,
                      fontSize: 10,
                      fontWeight: role.permissions[perm.key] ? 600 : 400,
                      color: role.permissions[perm.key] ? role.color : "rgba(240,240,248,0.3)",
                    }}
                  >
                    {role.permissions[perm.key] && "✓ "}
                    {perm.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && editingRole && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => {
            setShowRoleModal(false);
            setEditingRole(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#12121e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              maxWidth: 540,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h2
                style={{
                  fontFamily: B,
                  fontSize: 22,
                  letterSpacing: 1.5,
                  color: "#f0f0f8",
                  margin: 0,
                }}
              >
                {roles.find((r) => r.id === editingRole.id) ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  minHeight: "unset",
                }}
              >
                <X size={16} color="rgba(240,240,248,0.6)" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              {/* Role Name */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.7)",
                    marginBottom: 8,
                  }}
                >
                  Role Name
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontFamily: F,
                    fontSize: 14,
                    color: "#f0f0f8",
                    outline: "none",
                  }}
                  placeholder="e.g., Content Creator"
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.7)",
                    marginBottom: 8,
                  }}
                >
                  Description
                </label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    fontFamily: F,
                    fontSize: 14,
                    color: "#f0f0f8",
                    outline: "none",
                    resize: "vertical" as const,
                    minHeight: 80,
                  }}
                  placeholder="Describe what this role can do"
                />
              </div>

              {/* Color Picker */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.7)",
                    marginBottom: 8,
                  }}
                >
                  Role Color
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingRole({ ...editingRole, color })}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: color,
                        border:
                          editingRole.color === color
                            ? `3px solid ${color}`
                            : "3px solid transparent",
                        cursor: "pointer",
                        position: "relative" as const,
                        outline: editingRole.color === color ? `2px solid ${color}50` : "none",
                        outlineOffset: 2,
                        minHeight: "unset",
                        transition: "all 0.2s",
                      }}
                    >
                      {editingRole.color === color && (
                        <Check
                          size={18}
                          color="#fff"
                          style={{
                            position: "absolute" as const,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.7)",
                    marginBottom: 12,
                  }}
                >
                  Permissions
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    {
                      key: "canCreateContent" as const,
                      label: "Create Content",
                      desc: "Can post reviews, articles, and discussions",
                    },
                    {
                      key: "canModerateContent" as const,
                      label: "Moderate Content",
                      desc: "Can edit or remove user-generated content",
                    },
                    {
                      key: "canManageUsers" as const,
                      label: "Manage Users",
                      desc: "Can ban, mute, or modify user accounts",
                    },
                    {
                      key: "canAccessAnalytics" as const,
                      label: "Access Analytics",
                      desc: "Can view app statistics and insights",
                    },
                    {
                      key: "canManageRoles" as const,
                      label: "Manage Roles",
                      desc: "Can create and modify role permissions",
                    },
                  ].map((perm) => (
                    <div
                      key={perm.key}
                      onClick={() => togglePermission(perm.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: editingRole.permissions[perm.key]
                          ? `${editingRole.color}10`
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${editingRole.permissions[perm.key] ? `${editingRole.color}30` : "rgba(255,255,255,0.06)"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: F,
                            fontSize: 13,
                            fontWeight: 600,
                            color: editingRole.permissions[perm.key]
                              ? editingRole.color
                              : "#f0f0f8",
                            marginBottom: 2,
                          }}
                        >
                          {perm.label}
                        </div>
                        <div
                          style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.35)" }}
                        >
                          {perm.desc}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePermission(perm.key);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: editingRole.permissions[perm.key]
                            ? editingRole.color
                            : "rgba(240,240,248,0.3)",
                          display: "flex",
                          padding: 0,
                          minHeight: "unset",
                        }}
                      >
                        {editingRole.permissions[perm.key] ? (
                          <ToggleRight size={32} />
                        ) : (
                          <ToggleLeft size={32} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "20px 24px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(240,240,248,0.6)",
                  cursor: "pointer",
                  minHeight: "unset",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: editingRole.color,
                  border: `1px solid ${editingRole.color}`,
                  borderRadius: 10,
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  minHeight: "unset",
                }}
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SECTION: SETTINGS ────────────────────────────────────────────────────────

function SettingsSection() {
  const [modules, setModules] = useState({
    CORE: true,
    SOCIAL: true,
    CONTENT: true,
    ENTERTAIN: true,
    USER: true,
  });
  const [flags, setFlags] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    spoilerProtection: true,
    adultContentFilter: true,
    dailyQuizEnabled: true,
    gossipEnabled: true,
    liveRoomsEnabled: true,
    memeSubmissions: true,
    adminAnnouncements: true,
    analyticsTracking: true,
  });

  const moduleColors: Record<string, string> = {
    CORE: BLUE,
    SOCIAL: A,
    CONTENT: GOLD,
    ENTERTAIN: RED,
    USER: TEAL,
  };

  function toggleModule(key: string) {
    setModules((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }
  function toggleFlag(key: string) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  }

  const flagGroups = [
    {
      title: "Access & Registration",
      flags: [
        {
          key: "maintenanceMode",
          label: "Maintenance Mode",
          desc: "Take site offline for all users",
          danger: true,
        },
        { key: "registrationOpen", label: "Registration Open", desc: "Allow new user sign-ups" },
        {
          key: "adminAnnouncements",
          label: "Admin Announcements",
          desc: "Show platform-wide banner messages",
        },
        {
          key: "analyticsTracking",
          label: "Analytics Tracking",
          desc: "Collect usage data and telemetry",
        },
      ],
    },
    {
      title: "Content Controls",
      flags: [
        {
          key: "spoilerProtection",
          label: "Spoiler Protection",
          desc: "Enforce spoiler tags on all posts",
        },
        {
          key: "adultContentFilter",
          label: "Adult Content Filter",
          desc: "Hide 18+ rated content by default",
        },
        {
          key: "gossipEnabled",
          label: "Gossip Section",
          desc: "Enable the gossip / rumour module",
        },
        { key: "memeSubmissions", label: "Meme Submissions", desc: "Allow users to submit memes" },
      ],
    },
    {
      title: "Entertainment",
      flags: [
        { key: "dailyQuizEnabled", label: "Daily Quiz", desc: "Auto-generate a new quiz each day" },
        { key: "liveRoomsEnabled", label: "Live Rooms", desc: "Enable live watch-along rooms" },
      ],
    },
  ];

  return (
    <div>
      <SectionTitle
        icon={<Settings size={20} />}
        title="PLATFORM SETTINGS"
        sub="Module toggles, feature flags and site configuration"
      />

      {/* Module toggles */}
      <div style={{ ...card, padding: "24px", marginBottom: 20 }}>
        <div
          style={{
            fontFamily: B,
            fontSize: 18,
            letterSpacing: 2,
            color: "#f0f0f8",
            marginBottom: 6,
          }}
        >
          MODULE CONTROL
        </div>
        <p
          style={{
            fontFamily: F,
            fontSize: 13,
            color: "rgba(240,240,248,0.4)",
            margin: "0 0 20px",
            fontWeight: 300,
          }}
        >
          Enable or disable entire app modules. Disabled modules become inaccessible to all users.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: 12,
          }}
        >
          {Object.entries(modules).map(([mod, on]) => {
            const c = moduleColors[mod] || A;
            return (
              <div
                key={mod}
                style={{
                  background: `${c}08`,
                  border: `1px solid ${on ? `${c}30` : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 12,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontFamily: B,
                      fontSize: 14,
                      letterSpacing: 1.5,
                      color: on ? c : "rgba(240,240,248,0.3)",
                    }}
                  >
                    {mod}
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: on ? c : "rgba(255,255,255,0.15)",
                      boxShadow: on ? `0 0 6px ${c}` : "none",
                    }}
                  />
                </div>
                <button
                  onClick={() => toggleModule(mod)}
                  style={{
                    height: 32,
                    borderRadius: 8,
                    background: on ? `${c}18` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${on ? `${c}35` : "rgba(255,255,255,0.1)"}`,
                    fontFamily: F,
                    fontSize: 12,
                    fontWeight: 700,
                    color: on ? c : "rgba(240,240,248,0.4)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minHeight: "unset",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {on ? (
                    <>
                      <ToggleRight size={16} /> Enabled
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={16} /> Disabled
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature flags */}
      {flagGroups.map((group) => (
        <div key={group.title} style={{ ...card, padding: "24px", marginBottom: 16 }}>
          <div
            style={{
              fontFamily: B,
              fontSize: 16,
              letterSpacing: 2,
              color: "#f0f0f8",
              marginBottom: 16,
            }}
          >
            {group.title.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {group.flags.map((flag, i) => {
              const on = flags[flag.key as keyof typeof flags];
              const danger = (flag as any).danger;
              const color = danger ? RED : on ? GREEN : "rgba(240,240,248,0.3)";
              return (
                <div
                  key={flag.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "13px 0",
                    borderBottom:
                      i < group.flags.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 13,
                        fontWeight: 600,
                        color: on ? "#f0f0f8" : "rgba(240,240,248,0.5)",
                        marginBottom: 2,
                      }}
                    >
                      {flag.label}
                    </div>
                    <div
                      style={{
                        fontFamily: F,
                        fontSize: 11,
                        color: "rgba(240,240,248,0.3)",
                        fontWeight: 300,
                      }}
                    >
                      {flag.desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color }}>
                      {on ? "ON" : "OFF"}
                    </span>
                    <button
                      onClick={() => toggleFlag(flag.key)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color,
                        display: "flex",
                        padding: 0,
                        minHeight: "unset",
                        transition: "color 0.15s",
                      }}
                    >
                      {on ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Role-Based Access */}
      <RoleManagementSection />

      {/* Danger zone */}
      <div
        style={{
          ...card,
          padding: "24px",
          border: "1px solid rgba(232,69,69,0.25)",
          background: "rgba(232,69,69,0.03)",
        }}
      >
        <div style={{ fontFamily: B, fontSize: 16, letterSpacing: 2, color: RED, marginBottom: 8 }}>
          DANGER ZONE
        </div>
        <p
          style={{
            fontFamily: F,
            fontSize: 13,
            color: "rgba(240,240,248,0.4)",
            margin: "0 0 16px",
            fontWeight: 300,
          }}
        >
          Irreversible actions. Proceed with extreme caution.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
          <Btn label="Clear Cache" icon={<RefreshCw size={13} />} color={GOLD} />
          <Btn label="Export All Data" icon={<Download size={13} />} color={BLUE} />
          <Btn label="Purge Inactive Users" danger icon={<Trash2 size={13} />} />
          <Btn label="Force Maintenance Mode" danger icon={<Zap size={13} />} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState<string[]>([]);

  useEffect(() => {
    // ── Supabase Realtime Moderation Signals & API Check ─────────────────
    adminApi.getOverview();
    const channel = supabase
      .channel("admin-moderation-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload: any) => {
          const msg = `🚨 Realtime Report: ${payload?.new?.reason || "New moderation item"} submitted!`;
          setRealtimeAlerts((prev) => [msg, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sectionLabel = NAV.find((n) => n.id === section)?.label || "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#080810", fontFamily: F }}>
      <AdminSidebar section={section} onSection={setSection} collapsed={!sidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <AdminTopBar
          sectionLabel={sectionLabel}
          onMenu={() => setSidebarOpen((v) => !v)}
          onNav={() => navigate("/")}
        />

        {realtimeAlerts.length > 0 && (
          <div
            style={{
              background: "rgba(232,69,69,0.15)",
              borderBottom: "1px solid rgba(232,69,69,0.3)",
              padding: "8px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: RED }}>{realtimeAlerts[0]}</span>
            <button
              onClick={() => setRealtimeAlerts([])}
              style={{
                background: "none",
                border: "none",
                color: "rgba(240,240,248,0.5)",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#080810" }}>
          {section === "overview" && <OverviewSection />}
          {section === "users" && <UsersSection />}
          {section === "content" && <ContentSection />}
          {section === "contentFeedback" && <ContentFeedbackSection />}
          {section === "social" && <SocialSection />}
          {section === "entertain" && <EntertainSection />}
          {section === "moderation" && <ModerationSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "analytics" && <AnalyticsSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <style>{`
        @media (max-width: 768px) {
          .ff-admin-main { padding: 16px 16px 80px !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;

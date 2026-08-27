import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  Film,
  AlertTriangle,
  MessageSquare,
  Award,
  UserCheck,
  Flag,
  Shield,
  Bell,
  BarChart2,
} from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { adminApi } from "../../services/adminApi";
import { StatCard } from "../../components/ui/StatCard";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { USER_GROWTH } from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";
const RED = "#e84545";
const GOLD = "#fdcb6e";
const BLUE = "#0984e3";
const GREEN = "#00b894";
const TEAL = "#00cec9";

const card = {
  background: "#12121e",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
};

export const OverviewPage: React.FC = () => {
  const [_loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [stats, logs] = await Promise.all([
          adminApi.getOverview(),
          adminApi.getAuditLogs(),
        ]);
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
    { icon: <UserCheck size={14} />, text: 'New user "chloem" registered', time: "2m ago", color: GREEN },
    { icon: <Flag size={14} />, text: "Post flagged for spam in Sci-Fi Fanatics", time: "5m ago", color: RED },
    { icon: <Film size={14} />, text: 'Movie "Realm of Ash" featured by moderator', time: "18m ago", color: GOLD },
    { icon: <Shield size={14} />, text: "User @yukit suspended for policy violation", time: "42m ago", color: A },
    { icon: <Bell size={14} />, text: "Platform broadcast sent to active users", time: "1h ago", color: BLUE },
    { icon: <BarChart2 size={14} />, text: "Daily games leaderboard updated", time: "2h ago", color: TEAL },
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

  const moduleHealth = [
    { name: "CORE", status: "Healthy", users: `${totalUsersVal} active`, color: BLUE },
    { name: "SOCIAL", status: "Healthy", users: `${communitiesVal} groups`, color: A },
    { name: "CONTENT", status: "Healthy", users: `${totalContentVal} items`, color: GOLD },
    { name: "ENTERTAIN", status: "Healthy", users: `${quizzesPlayedVal} played`, color: TEAL },
    { name: "USER", status: "Healthy", users: `${dailyActiveVal} daily`, color: GREEN },
  ];

  return (
    <div>
      <SectionTitle
        icon={<LayoutDashboard size={20} />}
        title="OVERVIEW"
        sub="Real-time platform health, active users, and key metrics"
      />

      {/* KPI Grid */}
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
        {/* User Growth Chart */}
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
};

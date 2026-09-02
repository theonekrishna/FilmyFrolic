import React from "react";
import { BarChart3, Users, Eye, Clock, Film } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { StatCard } from "../../components/ui/StatCard";
import { DAU_TREND, MODULE_USAGE, CONTENT_VIEWS } from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";
const GOLD = "#fdcb6e";
const RED = "#e84545";
const BLUE = "#0984e3";
const TEAL = "#00cec9";

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
        padding: "2px 8px",
        fontFamily: F,
        fontSize: 11,
        fontWeight: 600,
        color: color,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export const AnalyticsPage: React.FC = () => {
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
                    textAlign: "center",
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.title}
                  </div>
                  <Pill label={c.type} color={c.color} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
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
};

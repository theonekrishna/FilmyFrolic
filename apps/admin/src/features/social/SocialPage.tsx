import React, { useState } from "react";
import { MessageSquare, Download, Plus, CheckCircle, Flag, X, Eye, Star } from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ADMIN_COMMUNITIES, ADMIN_POSTS, ADMIN_ROOMS } from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";
const GOLD = "#fdcb6e";
const RED = "#e84545";
const GREEN = "#00b894";
const BLUE = "#0984e3";
const TEAL = "#00cec9";

const card = {
  background: "#12121e",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
};

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "8px 12px 8px 36px",
          fontFamily: F,
          fontSize: 13,
          color: "#f0f0f8",
          outline: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 11,
          top: "50%",
          transform: "translateY(-50%)",
          color: "rgba(240,240,248,0.3)",
          display: "flex",
        }}
      >
        🔍
      </span>
    </div>
  );
}

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

function Btn({
  label,
  onClick,
  color,
  danger,
  sm,
  icon,
}: {
  label?: string;
  onClick?: () => void;
  color?: string;
  danger?: boolean;
  sm?: boolean;
  icon?: React.ReactNode;
}) {
  const bg = danger ? "rgba(232,69,69,0.15)" : color ? `${color}15` : "rgba(255,255,255,0.06)";
  const border = danger ? "rgba(232,69,69,0.3)" : color ? `${color}30` : "rgba(255,255,255,0.12)";
  const text = danger ? RED : color || "rgba(240,240,248,0.85)";

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: sm ? 6 : 8,
        padding: sm ? "3px 8px" : "7px 14px",
        fontFamily: F,
        fontSize: sm ? 11 : 13,
        fontWeight: 600,
        color: text,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10,
        padding: 3,
        marginBottom: 20,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTab(t)}
          style={{
            background: active === t ? A : "transparent",
            border: "none",
            borderRadius: 7,
            padding: "6px 14px",
            fontFamily: F,
            fontSize: 12,
            fontWeight: 600,
            color: active === t ? "#fff" : "rgba(240,240,248,0.5)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export const SocialPage: React.FC = () => {
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
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
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
                          whiteSpace: "nowrap",
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
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
              textAlign: "center",
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
                    flexWrap: "wrap",
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
};

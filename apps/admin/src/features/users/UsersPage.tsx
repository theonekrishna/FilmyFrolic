import React, { useState } from "react";
import { Users, Download, Lock, Unlock, Ban } from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import {
  ADMIN_USERS,
  UserRole,
  UserStatus,
} from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const GOLD = "#fdcb6e";
const RED = "#e84545";
const GREEN = "#00b894";
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
  label: string;
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

export const UsersPage: React.FC = () => {
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
                    whiteSpace: "nowrap",
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
                whiteSpace: "nowrap",
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
                    textTransform: "capitalize",
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
                textAlign: "right",
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
                textAlign: "right",
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
          textAlign: "right",
        }}
      >
        Showing {visible.length} of {users.length} users
      </div>
    </div>
  );
};

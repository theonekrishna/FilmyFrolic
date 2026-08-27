import React, { useState } from "react";
import {
  Settings,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  ToggleRight,
  ToggleLeft,
  RefreshCw,
  Download,
  Zap,
} from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";

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

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
                    resize: "vertical",
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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                        position: "relative",
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
                            position: "absolute",
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

export const SettingsPage: React.FC = () => {
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
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn label="Clear Cache" icon={<RefreshCw size={13} />} color={GOLD} />
          <Btn label="Export All Data" icon={<Download size={13} />} color={BLUE} />
          <Btn label="Purge Inactive Users" danger icon={<Trash2 size={13} />} />
          <Btn label="Force Maintenance Mode" danger icon={<Zap size={13} />} />
        </div>
      </div>
    </div>
  );
};

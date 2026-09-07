import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Shield,
  Calendar,
  Hash,
  Tag,
  CheckCircle,
  ShieldAlert,
  Trash2,
  Check,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Rss,
  Users,
  Gamepad2,
  Home,
  Film,
  Flag,
  Info,
  Ban,
} from "lucide-react";
import { adminApi } from "../../services/adminApi";

const A = "#7c5cfc";
const GOLD = "#f5c518";
const RED = "#e84545";
const GREEN = "#2ecc71";
const TEAL = "#1fd1a8";
const BLUE = "#4d91ff";

export interface ReportUser {
  id?: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  avatar_color?: string;
  is_banned?: boolean;
  is_suspended?: boolean;
}

export interface ReportCategory {
  name?: string;
  description?: string;
}

export interface ModerationReport {
  id: string;
  module_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  custom_description?: string;
  custom_issue?: string;
  reports_count?: number;
  target_id?: string;
  target_user_id?: string;
  is_dismissed?: boolean;
  is_content_removed?: boolean;
  is_warning_sent?: boolean;
  reporter?: ReportUser;
  target_user?: ReportUser;
  category?: ReportCategory;
}

interface ReportDetailModalProps {
  report: ModerationReport;
  onClose: () => void;
  onActionDone?: () => void;
}

function getModuleColor(t = ""): string {
  if (t.includes("meme")) return GOLD;
  if (t.includes("gossip")) return A;
  if (t.includes("feed")) return BLUE;
  if (t.includes("community")) return TEAL;
  if (t === "room") return "#ff6b6b";
  if (t === "game") return GREEN;
  return "#aaa";
}

function getModuleIcon(t = "", size = 16) {
  if (t.includes("meme")) return <ImageIcon size={size} />;
  if (t.includes("gossip")) return <Film size={size} />;
  if (t.includes("feed")) return <Rss size={size} />;
  if (t.includes("community")) return <Home size={size} />;
  if (t === "room") return <Users size={size} />;
  if (t === "game") return <Gamepad2 size={size} />;
  return <MessageSquare size={size} />;
}

function fmt(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ user, size = 40 }: { user?: ReportUser; size?: number }) {
  if (!user) return null;
  const initial = (user.name ?? user.username ?? "?")[0].toUpperCase();
  let bgStyle: React.CSSProperties = { background: "#7c5cfc" };
  try {
    const raw = user.avatar_color;
    const parsed = typeof raw === "string" && raw.startsWith("[") ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      bgStyle = { background: `linear-gradient(135deg, ${parsed[0]}, ${parsed[1]})` };
    } else if (parsed) {
      bgStyle = { background: parsed };
    }
  } catch {
    bgStyle = { background: "#7c5cfc" };
  }

  return user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.username ?? "user"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.1)",
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 800,
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.1)",
        ...bgStyle,
      }}
    >
      {initial}
    </div>
  );
}

function UserCard({ user, role, color }: { user?: ReportUser; role: string; color: string }) {
  if (!user) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: `${color}08`,
        border: `1px solid ${color}20`,
      }}
    >
      <Avatar user={user} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#f0f0f8",
            }}
          >
            {user.name ?? user.username}
          </span>
          {user.name && user.username && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 11,
                color: "rgba(240,240,248,0.35)",
              }}
            >
              @{user.username}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 100,
              background: `${color}18`,
              color,
            }}
          >
            {role}
          </span>
          {user.is_banned && (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 100,
                background: `${RED}18`,
                color: RED,
              }}
            >
              BANNED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value?: string | null;
  color?: string;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color || "rgba(240,240,248,0.35)",
          background: color ? `${color}14` : "rgba(255,255,255,0.04)",
          border: `1px solid ${color ? `${color}25` : "rgba(255,255,255,0.07)"}`,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon size={12} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 10,
            color: "rgba(240,240,248,0.3)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            margin: 0,
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 12,
            color: "rgba(240,240,248,0.8)",
            margin: 0,
            wordBreak: "break-word",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function FlagChip({
  active,
  icon: Icon,
  label,
  color,
}: {
  active: boolean;
  icon: any;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 10,
        flex: 1,
        background: active ? `${color}18` : "rgba(255,255,255,0.03)",
        border: `1px solid ${active ? `${color}35` : "rgba(255,255,255,0.07)"}`,
        color: active ? color : "rgba(240,240,248,0.22)",
      }}
    >
      <Icon size={12} />
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {label}
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
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        color: color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function ReportDetailModal({ report, onClose, onActionDone }: ReportDetailModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleAction(action: "warn" | "remove" | "dismiss" | "ban") {
    if (loading) return;
    setLoading(action);
    try {
      if (action === "warn") await adminApi.warnUser(report.id);
      if (action === "remove") await adminApi.removeContent(report.id);
      if (action === "dismiss") await adminApi.dismissReport(report.id);
      if (action === "ban") {
        const uId = report.target_user_id ?? report.target_user?.id;
        if (uId) await adminApi.toggleBanUser(uId);
      }
      onActionDone?.();
      onClose();
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setLoading(null);
    }
  }

  const moduleType = report.module_type ?? "";
  const moduleColor = getModuleColor(moduleType);
  const isPending = report.status === "pending";
  const count = report.reports_count ?? 1;

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: moduleColor,
              background: `${moduleColor}18`,
              border: `1px solid ${moduleColor}30`,
              flexShrink: 0,
            }}
          >
            {getModuleIcon(moduleType)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                letterSpacing: 1.5,
                color: "#f0f0f8",
                margin: 0,
              }}
            >
              REPORT DETAILS
            </h3>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                color: "rgba(240,240,248,0.3)",
                margin: "2px 0 0 0",
              }}
            >
              {report.id}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {report.is_dismissed && <Pill label="DISMISSED" color={GOLD} />}
            {report.is_content_removed && <Pill label="REMOVED" color={RED} />}
            {isPending && !report.is_dismissed && !report.is_content_removed && (
              <Pill label="PENDING" color={RED} />
            )}
            {count > 1 && (
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 100,
                  background: `${RED}18`,
                  color: RED,
                  border: `1px solid ${RED}28`,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Flag size={9} />
                {count} reports
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(240,240,248,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: "auto", padding: "16px 20px", flex: 1 }}>
          {/* People Involved */}
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              People Involved
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <UserCard user={report.reporter} role="Reporter" color={BLUE} />
              <UserCard user={report.target_user} role="Reported User" color={RED} />
            </div>
          </div>

          {/* Classification */}
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Classification
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "0 14px",
              }}
            >
              <DetailRow
                icon={Shield}
                label="Module Type"
                color={moduleColor}
                value={moduleType ? moduleType.replace(/_/g, " ").toUpperCase() : undefined}
              />
              <DetailRow icon={Tag} label="Category Name" color={A} value={report.category?.name} />
              <DetailRow
                icon={Info}
                label="Category Description"
                value={report.category?.description}
              />
              <DetailRow
                icon={Hash}
                label="Reports Count"
                color={RED}
                value={count > 1 ? `${count} times reported` : undefined}
              />
            </div>
          </div>

          {/* Report Content */}
          {(report.custom_description || report.custom_issue) && (
            <div style={{ marginBottom: 16 }}>
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(240,240,248,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                Report Details
              </p>
              <div
                style={{
                  background: `${A}08`,
                  border: `1px solid ${A}20`,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                {report.custom_description && (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12,
                      color: "rgba(240,240,248,0.75)",
                      margin: 0,
                      fontStyle: "italic",
                    }}
                  >
                    "{report.custom_description}"
                  </p>
                )}
                {report.custom_issue && (
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12,
                      color: "rgba(240,240,248,0.6)",
                      marginTop: 6,
                      marginBottom: 0,
                    }}
                  >
                    Issue: {report.custom_issue}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Flags */}
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Action Status
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <FlagChip
                active={!!report.is_warning_sent}
                icon={ShieldAlert}
                label="Warned"
                color={GOLD}
              />
              <FlagChip
                active={!!report.is_content_removed}
                icon={Trash2}
                label="Removed"
                color={RED}
              />
              <FlagChip
                active={!!report.is_dismissed}
                icon={CheckCircle}
                label="Dismissed"
                color={TEAL}
              />
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(240,240,248,0.3)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              Timestamps
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "0 14px",
              }}
            >
              <DetailRow icon={Calendar} label="Reported At" value={fmt(report.created_at)} />
              <DetailRow icon={Calendar} label="Updated At" value={fmt(report.updated_at)} />
              <DetailRow icon={Calendar} label="Resolved At" value={fmt(report.resolved_at)} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isPending && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              padding: "14px 20px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <button
              onClick={() => handleAction("warn")}
              disabled={!!loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                background: `${GOLD}18`,
                border: `1px solid ${GOLD}35`,
                color: GOLD,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading === "warn" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ShieldAlert size={12} />
              )}
              Warn User
            </button>
            <button
              onClick={() => handleAction("remove")}
              disabled={!!loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                background: `${RED}18`,
                border: `1px solid ${RED}35`,
                color: RED,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading === "remove" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              Remove Content
            </button>
            <button
              onClick={() => handleAction("dismiss")}
              disabled={!!loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                background: `${TEAL}18`,
                border: `1px solid ${TEAL}35`,
                color: TEAL,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading === "dismiss" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Dismiss
            </button>
            <button
              onClick={() => handleAction("ban")}
              disabled={!!loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(232,69,69,0.25)",
                border: "1px solid rgba(232,69,69,0.4)",
                color: RED,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading === "ban" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Ban size={12} />
              )}
              {report.target_user?.is_banned ? "Unban User" : "Ban User"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

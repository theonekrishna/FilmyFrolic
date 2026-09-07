import React, { useState, useEffect } from "react";
import {
  Shield,
  PenLine,
  Star,
  Users,
  MessageSquare,
  Film as FilmIcon,
  Send,
  Flag,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ADMIN_REPORTS, ReportType, ReportReason } from "../../modules/admin/data/AdminData";
import { adminApi } from "../../services/adminApi";
import { ReportDetailModal, ModerationReport } from "./ReportDetailModal";

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

export const ModerationPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>(ADMIN_REPORTS);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("pending");
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  useEffect(() => {
    async function loadReports() {
      const data = await adminApi.getReports();
      if (Array.isArray(data) && data.length > 0) {
        setReports(data);
      }
    }
    loadReports();
  }, []);

  async function resolve(id: string, action: "resolved" | "dismissed") {
    try {
      if (action === "dismissed") {
        await adminApi.dismissReport(id);
      } else {
        await adminApi.resolveReport(id, action);
      }
    } catch (e) {
      console.error("Resolve report failed", e);
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
  }

  async function handleWarn(id: string) {
    try {
      await adminApi.warnUser(id);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, is_warning_sent: true } : r)));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemove(id: string) {
    try {
      await adminApi.removeContent(id);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_content_removed: true, status: "resolved" } : r))
      );
    } catch (e) {
      console.error(e);
    }
  }

  const typeIcon = (t: ReportType | string) => {
    if (t === "post" || t === "feed") return <PenLine size={13} />;
    if (t === "review") return <Star size={13} />;
    if (t === "user") return <Users size={13} />;
    if (t === "community") return <MessageSquare size={13} />;
    if (t === "article" || t === "gossip") return <FilmIcon size={13} />;
    if (t === "message") return <Send size={13} />;
    return <Flag size={13} />;
  };

  const typeColor = (t: ReportType | string) => {
    if (t === "post" || t === "feed") return BLUE;
    if (t === "review") return GOLD;
    if (t === "user") return RED;
    if (t === "community") return A;
    if (t === "article" || t === "gossip") return TEAL;
    if (t === "message") return GREEN;
    return BLUE;
  };

  const reasonColor = (r: ReportReason | string) => {
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

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onActionDone={() => {
            setSelectedReport(null);
            adminApi.getReports().then((data) => {
              if (Array.isArray(data)) setReports(data);
            });
          }}
        />
      )}

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
                background: `${typeColor(r.type || r.module_type || "post")}15`,
                border: `1px solid ${typeColor(r.type || r.module_type || "post")}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: typeColor(r.type || r.module_type || "post"),
                flexShrink: 0,
              }}
            >
              {typeIcon(r.type || r.module_type || "post")}
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
                <Pill
                  label={(r.type || r.module_type || "POST").toUpperCase()}
                  color={typeColor(r.type || r.module_type || "post")}
                />
                {r.reason && (
                  <Pill
                    label={r.reason.replace("_", " ").toUpperCase()}
                    color={reasonColor(r.reason)}
                  />
                )}
                {r.severity && (
                  <Pill
                    label={`${r.severity.toUpperCase()} SEVERITY`}
                    color={severityColor(r.severity)}
                  />
                )}
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.3)" }}>
                  Reported by @{r.reporter?.username || r.reporter || "user"}
                </span>
                <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.25)" }}>
                  {r.time || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "")}
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
                "
                {r.contentPreview ||
                  r.custom_description ||
                  r.custom_issue ||
                  "Reported content item"}
                "
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
              <Btn
                sm
                label="View Details"
                icon={<Eye size={11} />}
                color={A}
                onClick={() => setSelectedReport(r)}
              />
              {r.status === "pending" ? (
                <>
                  <Btn
                    sm
                    label="Warn User"
                    color={GOLD}
                    icon={<ShieldAlert size={11} />}
                    onClick={() => handleWarn(r.id)}
                  />
                  <Btn
                    sm
                    label="Remove"
                    danger
                    icon={<Trash2 size={11} />}
                    onClick={() => handleRemove(r.id)}
                  />
                  <Btn
                    sm
                    label="Resolve"
                    color={GREEN}
                    icon={<CheckCircle size={11} />}
                    onClick={() => resolve(r.id, "resolved")}
                  />
                  <Btn
                    sm
                    label="Dismiss"
                    color="rgba(240,240,248,0.4)"
                    icon={<XCircle size={11} />}
                    onClick={() => resolve(r.id, "dismissed")}
                  />
                </>
              ) : (
                <Pill
                  label={r.status}
                  color={r.status === "resolved" ? GREEN : "rgba(240,240,248,0.4)"}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

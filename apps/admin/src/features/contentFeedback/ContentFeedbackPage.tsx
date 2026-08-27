import React, { useState } from "react";
import { Flag, Film as FilmIcon, PenLine, Users, Globe, Check, X } from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import {
  CONTENT_FEEDBACK,
  ContentFeedbackType,
  FeedbackCategory,
  FeedbackStatus,
} from "../../modules/admin/data/AdminData";

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

export const ContentFeedbackPage: React.FC = () => {
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
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
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
                  flexWrap: "wrap",
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
          <div style={{ ...card, padding: "40px", textAlign: "center" }}>
            <div style={{ fontFamily: F, fontSize: 14, color: "rgba(240,240,248,0.3)" }}>
              No feedback found matching your filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

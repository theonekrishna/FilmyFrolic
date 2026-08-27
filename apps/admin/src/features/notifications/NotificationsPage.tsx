import React, { useState } from "react";
import { Bell, CheckCircle, Send } from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { SENT_NOTIFICATIONS } from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
const B = "'Bebas Neue', sans-serif";
const A = "#6c5ce7";
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

export const NotificationsPage: React.FC = () => {
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
};

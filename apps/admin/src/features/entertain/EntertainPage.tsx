import React, { useState } from "react";
import { Gamepad2, Plus, Edit3, Trash2, ToggleRight, ToggleLeft, Check, X } from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import { ADMIN_QUIZZES, ADMIN_MEMES } from "../../modules/admin/data/AdminData";

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

export const EntertainPage: React.FC = () => {
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
                <div style={{ textAlign: "center" }}>
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
};

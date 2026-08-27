import React, { useState } from "react";
import {
  Film,
  Plus,
  RefreshCw,
  Star,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
} from "lucide-react";
import { SectionTitle } from "../../components/ui/SectionTitle";
import {
  ADMIN_MOVIES,
  ADMIN_ARTICLES,
  ADMIN_GOSSIP,
  CAST_CREW,
  CONTENT_FEEDBACK,
  ContentStatus,
  ContentFeedbackType,
} from "../../modules/admin/data/AdminData";

const F = "'Plus Jakarta Sans', system-ui, sans-serif";
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

export const ContentPage: React.FC = () => {
  const [tab, setTab] = useState("Movies");
  const [movies, setMovies] = useState(ADMIN_MOVIES);
  const [articles, setArticles] = useState(ADMIN_ARTICLES);
  const [gossip, setGossip] = useState(ADMIN_GOSSIP);
  const [castCrew, setCastCrew] = useState(CAST_CREW);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);

  const getFeedbackCount = (contentId: string, type: ContentFeedbackType) => {
    return CONTENT_FEEDBACK.filter(
      (f) => f.contentId === contentId && f.type === type && f.status === "pending"
    ).length;
  };

  function toggleMovieFeatured(id: string) {
    setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, featured: !m.featured } : m)));
  }
  function toggleMovieStatus(id: string) {
    setMovies((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "published" ? "hidden" : "published" } : m
      )
    );
  }

  function toggleArticleStatus(id: string) {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "published" ? "hidden" : "published" } : a
      )
    );
  }

  function toggleGossipStatus(id: string) {
    setGossip((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: g.status === "published" ? "hidden" : "published" } : g
      )
    );
  }
  function deleteGossip(id: string) {
    setGossip((prev) => prev.filter((g) => g.id !== id));
  }

  function toggleCastFeatured(id: string) {
    setCastCrew((prev) => prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c)));
  }

  function syncFromFilyDock() {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  }

  const sColor = (s: ContentStatus) => (s === "published" ? GREEN : s === "hidden" ? RED : GOLD);
  const roleColor = (r: string) => {
    if (r === "actor") return GOLD;
    if (r === "director") return A;
    if (r === "producer") return BLUE;
    if (r === "writer") return TEAL;
    if (r === "cinematographer" || r === "composer" || r === "editor") return RED;
    return "rgba(240,240,248,0.5)";
  };

  return (
    <div>
      <SectionTitle
        icon={<Film size={20} />}
        title="CONTENT MANAGEMENT"
        sub="Movies, articles, cast & crew from FilyDock · Gossip is internal content"
      />
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 0,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SubTabs
          tabs={["Movies", "Articles", "Gossip", "Cast & Crew"]}
          active={tab}
          onTab={setTab}
        />
        <div style={{ flex: 1 }} />
        {tab === "Gossip" && (
          <div style={{ marginBottom: 20 }}>
            <Btn label="Add Gossip" icon={<Plus size={13} />} color={A} />
          </div>
        )}
        {(tab === "Movies" || tab === "Articles" || tab === "Cast & Crew") && (
          <div style={{ marginBottom: 20 }}>
            <Btn
              label={syncing ? "Syncing..." : "Sync from FilyDock"}
              icon={<RefreshCw size={13} />}
              color={BLUE}
              onClick={syncFromFilyDock}
            />
          </div>
        )}
      </div>

      {tab === "Movies" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search movies…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 2fr 80px 1fr 80px 80px 1fr 110px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["", "Title", "Year", "Genre", "Rating", "Status", "Featured", "Actions"].map(
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
            {movies
              .filter((m) => m.title.toLowerCase().includes(search.toLowerCase()))
              .map((m, i, arr) => {
                const feedbackCount = getFeedbackCount(m.id, "movie");
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 2fr 80px 1fr 80px 80px 1fr 110px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={m.image}
                        style={{ width: 34, height: 48, objectFit: "cover", borderRadius: 6 }}
                        alt={m.title}
                      />
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <span
                      style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}
                    >
                      {m.title}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.45)" }}>
                      {m.year}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.45)" }}>
                      {m.genre}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Star size={11} fill={GOLD} color={GOLD} />
                      <span style={{ fontFamily: F, fontSize: 12, color: GOLD, fontWeight: 700 }}>
                        {m.rating}
                      </span>
                    </div>
                    <Pill label={m.status} color={sColor(m.status)} />
                    <button
                      onClick={() => toggleMovieFeatured(m.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: F,
                        fontSize: 12,
                        color: m.featured ? GOLD : "rgba(240,240,248,0.3)",
                        minHeight: "unset",
                      }}
                    >
                      {m.featured ? (
                        <ToggleRight size={20} color={GOLD} />
                      ) : (
                        <ToggleLeft size={20} color="rgba(240,240,248,0.2)" />
                      )}
                      {m.featured ? "Featured" : "Off"}
                    </button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                      <Btn
                        sm
                        icon={m.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                        color={GOLD}
                        onClick={() => toggleMovieStatus(m.id)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === "Articles" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search articles…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 100px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Title", "Author", "Category", "Published", "Views", "Status", "Actions"].map(
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
            {articles
              .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
              .map((a, i, arr) => {
                const feedbackCount = getFeedbackCount(a.id, "article");
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 100px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontFamily: F,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#f0f0f8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.title}
                      </span>
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            minWidth: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                            padding: "0 4px",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {a.author}
                    </span>
                    <Pill label={a.category} color={BLUE} />
                    <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                      {a.published}
                    </span>
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {a.views.toLocaleString()}
                    </span>
                    <Pill label={a.status} color={sColor(a.status)} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                      <Btn
                        sm
                        icon={a.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                        color={GOLD}
                        onClick={() => toggleArticleStatus(a.id)}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === "Gossip" && (
        <div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search gossip…" />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 120px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["Headline", "Source", "Tags", "Published", "Views", "Status", "Actions"].map(
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
            {gossip
              .filter((g) => g.headline.toLowerCase().includes(search.toLowerCase()))
              .map((g, i, arr) => (
                <div
                  key={g.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 80px 120px",
                    gap: 10,
                    padding: "11px 16px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f0f8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.headline}
                  </span>
                  <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                    {g.source}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {g.tags.slice(0, 2).map((t) => (
                      <Pill key={t} label={t} color={A} />
                    ))}
                  </div>
                  <span style={{ fontFamily: F, fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
                    {g.published}
                  </span>
                  <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                    {g.views.toLocaleString()}
                  </span>
                  <Pill label={g.status} color={sColor(g.status)} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn sm icon={<Edit3 size={12} />} color={BLUE} />
                    <Btn
                      sm
                      icon={g.status === "published" ? <EyeOff size={12} /> : <Eye size={12} />}
                      color={GOLD}
                      onClick={() => toggleGossipStatus(g.id)}
                    />
                    <Btn sm icon={<Trash2 size={12} />} danger onClick={() => deleteGossip(g.id)} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {tab === "Cast & Crew" && (
        <div>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search cast & crew by name or role…"
          />
          <div style={{ ...card, marginTop: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 1fr 100px 1fr 90px 100px",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {["", "Name", "Role", "Credits", "Popular Movies", "Featured", "Actions"].map((h) => (
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
            {castCrew
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.role.toLowerCase().includes(search.toLowerCase())
              )
              .map((c, i, arr) => {
                const feedbackCount = getFeedbackCount(c.id, "cast");
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 2fr 1fr 100px 1fr 90px 100px",
                      gap: 10,
                      padding: "11px 16px",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={c.image}
                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "50%" }}
                        alt={c.name}
                      />
                      {feedbackCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: RED,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: F,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {feedbackCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}
                      >
                        {c.name}
                      </div>
                      {c.birthYear && (
                        <div
                          style={{ fontFamily: F, fontSize: 10, color: "rgba(240,240,248,0.3)" }}
                        >
                          Born {c.birthYear}
                        </div>
                      )}
                    </div>
                    <Pill
                      label={c.role.replace("_", " ").toUpperCase()}
                      color={roleColor(c.role)}
                    />
                    <span style={{ fontFamily: F, fontSize: 12, color: "rgba(240,240,248,0.55)" }}>
                      {c.credits} {c.credits === 1 ? "film" : "films"}
                    </span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {c.popularMovies.slice(0, 2).map((movie) => (
                        <span
                          key={movie}
                          style={{
                            fontFamily: F,
                            fontSize: 10,
                            color: "rgba(240,240,248,0.4)",
                            background: "rgba(255,255,255,0.04)",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {movie}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleCastFeatured(c.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontFamily: F,
                        fontSize: 11,
                        color: c.featured ? GOLD : "rgba(240,240,248,0.3)",
                        minHeight: "unset",
                      }}
                    >
                      {c.featured ? (
                        <ToggleRight size={18} color={GOLD} />
                      ) : (
                        <ToggleLeft size={18} color="rgba(240,240,248,0.2)" />
                      )}
                      {c.featured ? "Yes" : "No"}
                    </button>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm icon={<Eye size={12} />} color={BLUE} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

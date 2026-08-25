import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import { Clock, Film, Star, Trash2, RotateCcw, Play } from "lucide-react";
import { MOVIES } from "../../Home/data/movies";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
const RED = "#e84545";

// Layout constants (same as Archive)
const MAX_WIDTH = "max-w-[1440px]";
const CONTAINER_PADDING = "px-3 md:px-6 lg:px-8";

const HISTORY_ITEMS = [
  { movie: MOVIES[0], watchedAt: "Today, 11:43 PM", progress: 100, duration: "2h 18m" },
  { movie: MOVIES[4], watchedAt: "Today, 8:12 PM", progress: 100, duration: "2h 47m" },
  { movie: MOVIES[1], watchedAt: "Yesterday, 5:30 PM", progress: 72, duration: "2h 32m" },
  { movie: MOVIES[8], watchedAt: "Yesterday, 9:00 PM", progress: 100, duration: "2h 12m" },
  { movie: MOVIES[2], watchedAt: "Mar 14, 7:45 PM", progress: 100, duration: "1h 58m" },
  { movie: MOVIES[3], watchedAt: "Mar 13, 10:20 PM", progress: 45, duration: "2h 5m" },
  { movie: MOVIES[7], watchedAt: "Mar 12, 3:15 PM", progress: 100, duration: "1h 34m" },
  { movie: MOVIES[6], watchedAt: "Mar 10, 11:50 PM", progress: 100, duration: "1h 45m" },
  { movie: MOVIES[5], watchedAt: "Mar 9, 6:00 PM", progress: 30, duration: "2h 10m" },
  { movie: MOVIES[9], watchedAt: "Mar 8, 8:30 PM", progress: 100, duration: "2h 22m" },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, accent }) {
  return (
    <div
      style={{
        height: 3,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          background: accent,
          borderRadius: 2,
          transition: "width 0.4s",
        }}
      />
    </div>
  );
}

// ─── Mobile history row ───────────────────────────────────────────────────────

function MobileHistoryRow({ item, onRemove, onRewatch, onPress }) {
  const progressColor = item.progress === 100 ? ACCENT : item.progress > 50 ? GOLD : RED;
  return (
    <div
      onClick={onPress}
      style={{
        display: "flex",
        gap: 12,
        padding: "11px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Poster with progress bar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <img
          src={item.movie.image}
          alt={item.movie.title}
          style={{ width: 52, height: 72, objectFit: "cover", borderRadius: 9, display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: "0 0 9px 9px",
            overflow: "hidden",
          }}
        >
          <ProgressBar value={item.progress} accent={progressColor} />
        </div>
        {item.progress === 100 && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: `${ACCENT}dd`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 8 }}>✓</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#f0f0f8",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {item.movie.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={9} color="rgba(240,240,248,0.3)" />
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 9,
              color: "rgba(240,240,248,0.35)",
            }}
          >
            {item.watchedAt}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              color: progressColor,
              background: `${progressColor}14`,
              border: `1px solid ${progressColor}30`,
              borderRadius: 100,
              padding: "1px 7px",
            }}
          >
            {item.progress === 100 ? "Completed" : `${item.progress}%`}
          </span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 9,
              color: "rgba(240,240,248,0.25)",
            }}
          >
            · {item.duration}
          </span>
        </div>
      </div>
      {/* Actions */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRewatch();
          }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            minHeight: "unset",
          }}
        >
          <Play size={11} color={ACCENT} fill={ACCENT} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(232,69,69,0.08)",
            border: "1px solid rgba(232,69,69,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            minHeight: "unset",
          }}
        >
          <Trash2 size={10} color="#e84545" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [removed, setRemoved] = useState(new Set());

  const activeItems = HISTORY_ITEMS.filter((_, i) => !removed.has(i));

  const filtered = activeItems.filter((item) => {
    if (filter === "completed") return item.progress === 100;
    if (filter === "incomplete") return item.progress < 100;
    return true;
  });

  const totalHours = Math.round(
    activeItems.reduce(
      (acc, item) =>
        acc + (item.progress / 100) * parseFloat(item.duration.replace("h", ".").replace("m", "")),
      0
    )
  );
  const completedCount = activeItems.filter((item) => item.progress === 100).length;
  const avgRating = activeItems.length
    ? (activeItems.reduce((acc, item) => acc + item.movie.rating, 0) / activeItems.length).toFixed(
        1
      )
    : "0";

  const statsData = [
    { label: "Total Watched", value: String(activeItems.length), icon: Film, color: ACCENT },
    { label: "Hours Spent", value: `${totalHours}h`, icon: Clock, color: GOLD },
    { label: "Avg. Rating", value: avgRating, icon: Star, color: GOLD },
    { label: "Completed", value: String(completedCount), icon: Film, color: "#7c5cfc" },
  ];

  function goToMovie(id) {
    navigate(`/content/movie/${id}`);
  }
  function removeItem(i) {
    setRemoved((p) => new Set([...p, i]));
  }

  // Group by date label
  const dateGroups = [];
  filtered.forEach((item) => {
    const globalIdx = HISTORY_ITEMS.indexOf(item);
    const dateLabel = item.watchedAt.split(",")[0];
    const group = dateGroups.find((g) => g.label === dateLabel);
    if (group) group.items.push({ item, idx: globalIdx });
    else dateGroups.push({ label: dateLabel, items: [{ item, idx: globalIdx }] });
  });

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit'] overflow-x-hidden selection:bg-yellow-400/30">
      {/* Global Scrollbar Styles */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 3px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #1a1a26; border-radius: 10px; border: 2px solid #080810; }
        ::-webkit-scrollbar-thumb:hover { background: #f5c518; }
        .ff-no-scrollbar::-webkit-scrollbar { display: none; }
        .ff-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TopBar */}
      <TopBar title="History" subtitle="Your watch journey" />

      {/* ── MOBILE LAYOUT ── */}
      <main className={`md:hidden ${CONTAINER_PADDING} pb-24 mx-auto w-full ${MAX_WIDTH}`}>
        {/* Filter pills */}
        <div className="flex gap-2 py-4">
          {["all", "completed", "incomplete"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="h-7 px-3 rounded-full text-[10px] font-medium capitalize transition-all active:scale-95"
              style={{
                border: `1.5px solid ${filter === f ? ACCENT + "60" : "rgba(255,255,255,0.09)"}`,
                background: filter === f ? `${ACCENT}14` : "rgba(255,255,255,0.03)",
                fontWeight: filter === f ? 700 : 400,
                color: filter === f ? ACCENT : "rgba(240,240,248,0.45)",
              }}
            >
              {f === "all" ? "All" : f === "completed" ? "✅ Completed" : "⏸ In Progress"}
            </button>
          ))}
        </div>

        {/* Mobile mini stats */}
        <div className="flex mb-4 rounded-xl overflow-hidden bg-[#0d0d14]">
          {[
            { label: "Watched", value: String(activeItems.length), color: ACCENT },
            { label: "Hours", value: `${totalHours}h`, color: GOLD },
            { label: "Avg ★", value: avgRating, color: GOLD },
            { label: "Done", value: String(completedCount), color: "#7c5cfc" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-3">
              <div
                className="font-['Bebas_Neue'] text-xl tracking-wide leading-none"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="font-['Outfit'] text-[9px] text-white/30 mt-0.5 uppercase tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Grouped list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📽️</div>
              <div className="font-['Outfit'] text-sm text-white/30">
                No history for this filter.
              </div>
            </div>
          ) : (
            dateGroups.map((group) => (
              <div key={group.label}>
                <div className="py-2.5 px-1 font-['Outfit'] text-[10px] font-bold text-white/30 uppercase tracking-wide">
                  {group.label}
                  <span className="font-normal text-white/20">
                    · {group.items.length} film{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden bg-[#0d0d14]">
                  {group.items.map(({ item, idx }) => (
                    <MobileHistoryRow
                      key={`${item.movie.id}-${idx}`}
                      item={item}
                      onRemove={() => removeItem(idx)}
                      onRewatch={() => goToMovie(item.movie.id)}
                      onPress={() => goToMovie(item.movie.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── DESKTOP LAYOUT ── */}
      <main
        className={`hidden md:block ${CONTAINER_PADDING} py-8 pb-20 mx-auto w-full ${MAX_WIDTH}`}
      >
        {/* Stats row */}
        <div className="flex gap-4 mb-7 flex-wrap">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[140px] bg-[#0d0d14] rounded-xl p-3.5 flex items-center gap-3 transition-transform hover:scale-[1.02]"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}14`, border: `1px solid ${stat.color}28` }}
              >
                <stat.icon size={18} color={stat.color} />
              </div>
              <div>
                <div className="font-['Bebas_Neue'] text-2xl tracking-wide text-[#f0f0f8] leading-none">
                  {stat.value}
                </div>
                <div className="font-['Outfit'] text-xs text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter + Clear All */}
        <div className="flex items-center gap-2.5 mb-6">
          {["all", "completed", "incomplete"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs capitalize transition-all hover:scale-105 active:scale-95"
              style={{
                background: filter === f ? `${ACCENT}12` : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f ? `${ACCENT}35` : "rgba(255,255,255,0.08)"}`,
                fontWeight: filter === f ? 700 : 500,
                color: filter === f ? ACCENT : "rgba(240,240,248,0.5)",
              }}
            >
              {f === "all" ? "All" : f === "completed" ? "✅ Completed" : "⏸ In Progress"}
            </button>
          ))}
          <button className="ml-auto flex items-center gap-1.5 bg-red-500/7 border border-red-500/15 rounded-full px-3.5 py-1.5 font-['Outfit'] text-xs font-semibold text-[#e84545] cursor-pointer transition-all hover:bg-red-500/15 hover:scale-105 active:scale-95">
            <RotateCcw size={11} /> Clear History
          </button>
        </div>

        {/* Grouped desktop list */}
        <div className="w-full">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30 font-['Outfit'] text-sm">
              <div className="text-5xl mb-3">📽️</div>
              No history for this filter.
            </div>
          ) : (
            dateGroups.map((group) => (
              <div key={group.label} className="mb-7">
                {/* Date group header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-['Bebas_Neue'] text-base tracking-wider text-white/45">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-white/7" />
                  <span className="font-['Outfit'] text-xs text-white/25">
                    {group.items.length} film{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {group.items.map(({ item, idx }) => {
                    const progressColor =
                      item.progress === 100 ? ACCENT : item.progress > 50 ? GOLD : RED;
                    return (
                      <div
                        key={`${item.movie.id}-${idx}`}
                        onClick={() => goToMovie(item.movie.id)}
                        className="flex gap-3 bg-[#0d0d14] rounded-xl overflow-hidden cursor-pointer transition-all hover:bg-[#12121e]"
                      >
                        {/* Poster + progress */}
                        <div className="relative shrink-0">
                          <img
                            src={item.movie.image}
                            alt={item.movie.title}
                            className="w-20 h-[108px] object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
                            <div
                              className="h-full transition-all duration-500"
                              style={{ width: `${item.progress}%`, background: progressColor }}
                            />
                          </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 py-3.5 pr-4 flex flex-col justify-center gap-1.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-['Outfit'] text-sm font-semibold text-[#f0f0f8] mb-1">
                                {item.movie.title}
                              </div>
                              <div className="flex items-center gap-2 font-['Outfit'] text-xs text-white/40">
                                <Star size={10} color={GOLD} fill={GOLD} />
                                <span style={{ color: GOLD }} className="font-bold">
                                  {item.movie.rating.toFixed(1)}
                                </span>
                                <span>·</span>
                                <span>{item.movie.year}</span>
                                <span>·</span>
                                <span>{item.duration}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(idx);
                              }}
                              className="w-8 h-8 rounded-lg bg-red-500/7 border border-red-500/15 flex items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-red-500/15"
                            >
                              <Trash2 size={13} color="#e84545" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Clock size={11} className="text-white/30" />
                            <span className="font-['Outfit'] text-xs text-white/35">
                              {item.watchedAt}
                            </span>
                            <span
                              className="font-['Outfit'] text-[10px] font-bold rounded-full px-2 py-0.5"
                              style={{
                                color: progressColor,
                                background: `${progressColor}10`,
                                border: `1px solid ${progressColor}25`,
                              }}
                            >
                              {item.progress === 100 ? "✓ Completed" : `${item.progress}% watched`}
                            </span>
                            {item.progress < 100 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToMovie(item.movie.id);
                                }}
                                className="flex items-center gap-1 px-3 py-1 rounded-full font-['Outfit'] text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                                style={{
                                  background: `${ACCENT}15`,
                                  border: `1px solid ${ACCENT}35`,
                                  color: ACCENT,
                                }}
                              >
                                <Play size={10} fill={ACCENT} color={ACCENT} /> Resume
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

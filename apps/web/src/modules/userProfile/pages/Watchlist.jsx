import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import MobileWatchlistCard from "../components/MobileWatchlistCard";
import { MOVIES } from "../../Home/data/movies";
import { Bookmark, Trash2, Play, Star, Clock, CheckCircle, Film, Search, X } from "lucide-react";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";

const WatchlistTab = "all" | "movies" | "series" | "watched" | "unwatched";
const SortMode = "added" | "rating" | "title";

const WATCHLIST_MOVIES = MOVIES.slice(0, 7).map((m) => ({ ...m, watched: false, type: "movie" }));
const WATCHED_MOVIES = MOVIES.slice(7, 10).map((m) => ({ ...m, watched: true, type: "movie" }));
const SERIES_ITEMS = MOVIES.slice(3, 5).map((m) => ({ ...m, watched: false, type: "series" }));
const ALL_ITEMS = [...WATCHLIST_MOVIES, ...WATCHED_MOVIES, ...SERIES_ITEMS];

export default function Watchlist() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("all");
  const [removed, setRemoved] = useState(new Set());
  const [markedWatched, setMarkedWatched] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortMode, setSortMode] = useState("added");
  // Handlers for remove and mark watched
  const handleRemove = (id) => setRemoved((prev) => new Set([...prev, id]));

  const handleMarkWatched = (id) => {
    setMarkedWatched((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // Filtered list excluding removed items
  const baseList = ALL_ITEMS.filter((item) => !removed.has(item.id));

  // Display list filtering and sorting
  const displayList = baseList
    .filter((item) => {
      const isWatched = item.watched || markedWatched.has(item.id);
      if (tab === "movies") return item.type === "movie";
      if (tab === "series") return item.type === "series";
      if (tab === "watched") return isWatched;
      if (tab === "unwatched") return !isWatched;
      return true;
    })
    .filter((item) => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortMode === "rating") return b.rating - a.rating;
      if (sortMode === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  // Tabs configuration
  const TABS = [
    { value: "all", label: "All", emoji: "🎬", count: baseList.length },
    {
      value: "movies",
      label: "Movies",
      emoji: "🎥",
      count: baseList.filter((m) => m.type === "movie").length,
    },
    {
      value: "series",
      label: "Series",
      emoji: "📺",
      count: baseList.filter((m) => m.type === "series").length,
    },
    {
      value: "watched",
      label: "Watched",
      emoji: "✅",
      count: baseList.filter((m) => m.watched || markedWatched.has(m.id)).length,
    },
    {
      value: "unwatched",
      label: "Unwatched",
      emoji: "⏳",
      count: baseList.filter((m) => !m.watched && !markedWatched.has(m.id)).length,
    },
  ];

  // Stats data
  const statsData = [
    { label: "Saved", value: String(baseList.length), icon: Bookmark, color: ACCENT },
    {
      label: "Watched",
      value: String(baseList.filter((m) => m.watched || markedWatched.has(m.id)).length),
      icon: CheckCircle,
      color: GOLD,
    },
    {
      label: "Movies",
      value: String(baseList.filter((m) => m.type === "movie").length),
      icon: Film,
      color: "#7c5cfc",
    },
  ];

  // Navigation function
  function goToMovie(id) {
    navigate(`/content/movie/${id}`);
  }

  // Empty state component
  const emptyState = () => (
    <div className="flex flex-col items-center justify-center p-[60px_24px] gap-4 text-center">
      <div
        className="flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: `${ACCENT}10`,
          border: `1px solid ${ACCENT}25`,
        }}
      >
        <Bookmark size={30} color={ACCENT} />
      </div>

      <h4 className="text-[24px] font-[Bebas Neue] tracking-wider text-[#f0f0f8] m-0">
        Nothing here yet
      </h4>

      <p className="text-[13px] font-[Outfit] font-light text-[rgba(240,240,248,0.4)] m-0 mb-1">
        {searchQuery
          ? `No results for "${searchQuery}"`
          : "Start exploring to add films and series."}
      </p>

      {!searchQuery && (
        <button
          onClick={() => navigate("/content/archive")}
          className="inline-flex items-center gap-2 rounded-[10px] px-6 py-[11px] text-[13px] font-[Outfit] font-bold text-[#080810] shadow-[0_4px_20px_rgba(232,69,69,0.25)]"
          style={{ background: ACCENT }}
        >
          <Film size={14} /> Browse Archive
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (≤768px)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="ff-wl-mobile min-h-screen bg-[#080810]">
        {/* Sticky top */}
        <div className="sticky top-0 z-30 bg-[rgba(8,8,16,0.97)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)]">
          <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
            <h1 className="text-[28px] font-[Bebas Neue] tracking-wider text-[#f0f0f8] m-0 leading-none">
              Watchlist
            </h1>
            <span className="text-[11px] font-[Outfit] text-[rgba(240,240,248,0.4)]">
              {baseList.length} saved
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex overflow-x-auto gap-1.5 px-4 pb-2.5">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className="flex items-center gap-1 h-7 px-[11px] rounded-full flex-shrink-0 text-[10px] font-[Outfit] cursor-pointer"
                style={{
                  border: `1.5px solid ${tab === t.value ? ACCENT + "60" : "rgba(255,255,255,0.09)"}`,
                  background: tab === t.value ? `${ACCENT}14` : "rgba(255,255,255,0.03)",
                  fontWeight: tab === t.value ? 700 : 400,
                  color: tab === t.value ? ACCENT : "rgba(240,240,248,0.45)",
                  minHeight: "unset",
                }}
              >
                {t.emoji} {t.label}
                <span
                  className="rounded-full px-1 text-[9px]"
                  style={{
                    background: tab === t.value ? `${ACCENT}25` : "rgba(255,255,255,0.08)",
                    color: tab === t.value ? ACCENT : "rgba(240,240,248,0.3)",
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 pb-2.5">
            <div
              className="flex items-center gap-2 h-9 px-[11px] rounded-lg transition-colors"
              style={{
                background: searchFocused ? "rgba(31,209,168,0.05)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${searchFocused ? ACCENT + "50" : "rgba(255,255,255,0.09)"}`,
              }}
            >
              <Search size={13} color={searchFocused ? ACCENT : "rgba(240,240,248,0.3)"} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search watchlist…"
                className="flex-1 bg-transparent border-none outline-none text-[12px] font-[Outfit] text-[#f0f0f8] caret-[#E84545]"
              />
              {searchQuery && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery("");
                  }}
                  className="bg-transparent border-none flex p-0 cursor-pointer"
                >
                  <X size={12} color="rgba(240,240,248,0.4)" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile stats mini row */}
        <div className="flex px-4 pt-2.5 gap-0">
          {statsData.map((s, i) => (
            <div
              key={s.label}
              className="flex-1 text-center py-1.5"
              style={{
                borderRight: i < statsData.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <div
                className="text-[20px] font-[Bebas Neue] tracking-[1px]"
                style={{ color: s.color, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div className="text-[9px] font-[Outfit] text-[rgba(240,240,248,0.35)] mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="pb-22 mt-2">
          {displayList.length === 0
            ? emptyState
            : displayList.map((movie) => {
                const isWatched = movie.watched || markedWatched.has(movie.id);
                return (
                  <MobileWatchlistCard
                    key={movie.id}
                    movie={movie}
                    isWatched={isWatched}
                    onMarkWatched={() => handleMarkWatched(movie.id)}
                    onRemove={() => handleRemove(movie.id)}
                    onPress={() => goToMovie(movie.id)}
                  />
                );
              })}
        </div>
      </div>
      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥769px)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="ff-wl-desktop min-h-screen bg-[#080810]">
        <TopBar title="My Watchlist" subtitle={`${displayList.length} titles saved`} />

        <div className="px-8 pt-7 pb-16">
          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {statsData.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="flex flex-1 min-w-[140px] items-center gap-3 p-4 rounded-lg border"
                style={{
                  background: "#12121e",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}28`,
                  }}
                >
                  <Icon size={17} color={color} />
                </div>
                <div>
                  <div className="text-[#f0f0f8] font-bebas text-2xl leading-none tracking-wide">
                    {value}
                  </div>
                  <div className="text-[10px] text-[rgba(240,240,248,0.38)] mt-0.5 font-outfit">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs + Search + Sort */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            <div className="flex flex-1 flex-wrap gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-outfit text-xs transition-all ${
                    tab === t.value
                      ? "font-bold text-[#e84545] bg-[#e8454512] border-[#e8454535]"
                      : "font-medium text-[rgba(240,240,248,0.55)] bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]"
                  } border`}
                >
                  {t.label}
                  <span
                    className={`text-[10px] px-2 py-[1px] rounded-full ${
                      tab === t.value
                        ? "bg-[#e8454518] text-[#e84545]"
                        : "bg-[rgba(255,255,255,0.07)] text-[rgba(240,240,248,0.4)]"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-2 min-w-[200px]">
              <Search size={13} color="rgba(240,240,248,0.3)" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent outline-none border-none text-[#f0f0f8] text-xs font-outfit caret-[#e84545]"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-1.5">
              {["added", "rating", "title"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSortMode(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-outfit font-${sortMode === s ? "bold" : "normal"} cursor-pointer border transition-all ${
                    sortMode === s
                      ? "bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.08)] text-[#f0f0f8]"
                      : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[rgba(240,240,248,0.4)]"
                  }`}
                >
                  {s === "added" ? "⏰ Recent" : s === "rating" ? "⭐ Rating" : "🔤 A–Z"}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop List */}
          {displayList.length === 0 ? (
            emptyState
          ) : (
            <div className="flex flex-col gap-2.5">
              {displayList.map((movie, i) => {
                const isWatched = movie.watched || markedWatched.has(movie.id);

                return (
                  <div
                    key={movie.id}
                    onClick={() => goToMovie(movie.id)}
                    className={`flex gap-0 overflow-hidden rounded-[14px] border transition-all cursor-pointer ${
                      isWatched ? "border-[#e8454518]" : "border-[rgba(255,255,255,0.07)]"
                    }`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = isWatched
                        ? "#e8454535"
                        : "rgba(255,255,255,0.15)";
                      e.currentTarget.style.transform = "translateX(2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isWatched
                        ? "#e8454518"
                        : "rgba(255,255,255,0.07)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className={`w-[110px] h-[150px] object-cover transition-filter ${
                          isWatched ? "brightness-[65%]" : ""
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12121e]/70" />
                      {isWatched && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-[#e84545cc] flex items-center justify-center">
                            <CheckCircle size={20} color="#080810" />
                          </div>
                        </div>
                      )}
                      {isWatched && (
                        <div className="absolute top-2 left-2 bg-[#e84545e0] rounded-full px-2 py-[2px] text-[9px] font-bold text-[#080810] font-outfit">
                          ✓ Watched
                        </div>
                      )}
                      {movie.type === "series" && !isWatched && (
                        <div className="absolute top-2 left-2 bg-[#7c5cfcE6] rounded-full px-2 py-[2px] text-[9px] font-bold text-white font-outfit">
                          Series
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 text-[26px] text-[rgba(240,240,248,0.12)] font-bebas tracking-wide leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between p-5 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-[#f0f0f8] font-outfit font-bold text-sm truncate mb-1.5">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Star size={11} color={GOLD} fill={GOLD} />
                              <span className="text-[11px] font-outfit font-bold text-gold">
                                {movie.rating.toFixed(1)}
                              </span>
                              <span className="text-[rgba(240,240,248,0.2)]">·</span>
                              <span className="text-[11px] font-outfit text-[rgba(240,240,248,0.4)]">
                                {movie.year}
                              </span>
                              <span className="text-[rgba(240,240,248,0.2)]">·</span>
                              <Clock size={10} color="rgba(240,240,248,0.35)" />
                              <span className="text-[11px] font-outfit text-[rgba(240,240,248,0.4)]">
                                {movie.duration}
                              </span>
                            </div>
                          </div>
                          {movie.badge && (
                            <span className="text-[9px] font-bold text-gold bg-yellow-100/10 border border-yellow-200/22 rounded-full px-2 py-[3px] flex-shrink-0 font-outfit">
                              {movie.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] font-outfit text-[rgba(240,240,248,0.42)] font-light leading-[1.55] line-clamp-2 m-0">
                          {movie.description}
                        </p>
                      </div>

                      {/* Genre + Actions */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {movie.genre.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="font-outfit text-[9px] font-medium text-[rgba(240,240,248,0.4)] bg-[rgba(255,255,255,0.05)] rounded-full px-[9px] py-[3px] border border-[rgba(255,255,255,0.07)]"
                          >
                            {g}
                          </span>
                        ))}

                        <div className="flex gap-1.5 ml-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkWatched(movie.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-outfit font-semibold transition-all ${
                              isWatched
                                ? "bg-[#e8454515] border-[#e8454535] text-[#e84545]"
                                : "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(240,240,248,0.5)]"
                            } border`}
                          >
                            <CheckCircle size={11} />
                            {isWatched ? "Watched" : "Mark Watched"}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(movie.id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-outfit font-semibold text-[#e84545] bg-[#e84545]/10 border border-[#e84545]/18"
                          >
                            <Trash2 size={11} /> Remove
                          </button>

                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-outfit font-bold text-[#080810]"
                            style={{ backgroundColor: GOLD }}
                          >
                            <Play size={11} fill="#080810" color="#080810" />
                            {isWatched ? "Rewatch" : "Watch Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .ff-wl-mobile  { display: block !important; }
          .ff-wl-desktop { display: none  !important; }
        }
        @media (min-width: 769px) {
          .ff-wl-mobile  { display: none  !important; }
          .ff-wl-desktop { display: block !important; }
        }
      `}</style>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomSheet from "../../../shared/BottomSheet";
import OverviewTab from "../components/OverviewTab";
import CastTab from "../components/CastTab";
import TrailersTab from "../components/TrailersTab";
import ReviewsTab from "../components/ReviewsTab";
import AwardsTab from "../components/AwardsTab";
import StoryTab from "../components/StoryTab";
import CollectionTab from "../components/CollectionTab";
import OttTab from "../components/OttTab";
import { publicAxios, privateAxios } from "../../../utils/AxiosInstance";
import { PLATFORMS, COMMUNITY_POSTS, TABS } from "../data/archive";

import { Plus, Star, ChevronLeft, Gamepad2, Users, Check } from "lucide-react";

const ACCENT = "#f5c518";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function normalizeMovieDetail(m) {
  if (!m) return null;
  const rawRating = m.rating ?? m.vote_average ?? 0;
  const rating = typeof rawRating === "number" ? rawRating : parseFloat(rawRating) || 0;
  const image = m.backdrop_url || m.poster_url || m.poster || m.image || "";
  const year = m.year ?? (m.release_date ? m.release_date.split("-")[0] : "");
  const duration = m.runtime ? `${m.runtime} min` : m.movieDuration ? `${m.movieDuration} min` : "";
  const description = m.overview ?? m.synopsis ?? m.description ?? "";

  const directorName =
    typeof m.director === "string"
      ? m.director
      : (m.director?.name ??
        m.director?.fullName ??
        (Array.isArray(m.crew)
          ? m.crew.find((c) => c.job === "Director" || c.role === "Director")?.name
          : null));

  const writersStr =
    typeof m.writers === "string"
      ? m.writers
      : Array.isArray(m.crew)
        ? m.crew
            .filter(
              (c) => c.department === "Writing" || c.job === "Writer" || c.role?.includes("Writ")
            )
            .map((c) => c.name || c.fullName)
            .filter(Boolean)
            .join(", ")
        : null;

  return {
    id: m.id ?? m._id,
    title: m.title ?? m.name ?? "Untitled",
    year,
    rating: Number(rating.toFixed(1)),
    image,
    backdrop: m.backdrop_url || image,
    poster: m.poster_url || m.poster || image,
    genre: Array.isArray(m.genres) ? m.genres : Array.isArray(m.genre) ? m.genre : [],
    duration,
    description,
    review: m.review ?? "",
    badge: m.badge ?? null,
    type: m.type ?? "Movie",
    languages: m.languages ?? (m.original_language ? [m.original_language.toUpperCase()] : []),
    country: m.country ?? "",
    director: directorName,
    writers: writersStr,
    studio: m.studio ?? null,
    budget: m.budget ?? null,
    boxOffice: m.boxOffice ?? m.grossCollection ?? null,
    cast: (m.cast ?? []).map((c) => ({
      name: c.name ?? c.castMember?.fullName ?? "Unknown",
      role: c.character ?? c.role ?? c.characterName ?? "",
      photo: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : (c.photo ?? c.castMember?.castPhoto ?? null),
      initials: getInitials(c.name ?? c.castMember?.fullName),
    })),
    crew: (m.crew ?? []).map((c) => ({
      name: c.name ?? c.fullName ?? "Unknown",
      role: c.job ?? c.role ?? c.crewType ?? "",
      photo: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : (c.photo ?? c.crewPhoto ?? null),
      initials: getInitials(c.name ?? c.fullName),
    })),
    awards: m.awards ?? [],
    ottAvailability: m.ottAvailability ?? [],
    trailerLink:
      Array.isArray(m.trailerLink) && m.trailerLink.length > 0
        ? m.trailerLink
        : m.trailer_url
          ? [m.trailer_url]
          : m.trailer
            ? [m.trailer]
            : [],
    songsLink: m.songsLink ?? [],
    eventsLink: m.eventsLink ?? [],
    story: m.story ?? description,
    grossCollection: m.grossCollection ?? null,
    netCollection: m.netCollection ?? null,
  };
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#080810] animate-pulse">
      <div className="h-[360px] bg-[rgba(255,255,255,0.05)]" />
      <div className="px-4 mt-[-80px] relative z-10 flex items-end gap-4 pb-4">
        <div className="w-[120px] h-[180px] rounded-[12px] bg-[rgba(255,255,255,0.08)] flex-shrink-0" />
        <div className="flex-1 pb-1 flex flex-col gap-2">
          <div className="h-3 w-24 bg-[rgba(255,255,255,0.07)] rounded-full" />
          <div className="h-8 w-3/4 bg-[rgba(255,255,255,0.08)] rounded" />
          <div className="h-3 w-1/2 bg-[rgba(255,255,255,0.05)] rounded-full" />
        </div>
      </div>
      <div className="px-4 flex flex-col gap-2">
        <div className="h-[48px] bg-[rgba(255,255,255,0.07)] rounded-[12px]" />
        <div className="h-[44px] bg-[rgba(255,255,255,0.05)] rounded-[12px]" />
      </div>
    </div>
  );
}

export default function ArchiveItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const [quizSheetOpen, setQuizSheetOpen] = useState(false);
  const [socialSheetOpen, setSocialSheetOpen] = useState(false);

  const tabBarRef = useRef(null);
  const contentRef = useRef(null);

  // Fetch movie detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    publicAxios
      .get(`/api/home/movies/${id}`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setMovie(normalizeMovieDetail(data));
      })
      .catch((err) => {
        console.error("Failed to fetch movie detail:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── Watchlist status: GET /api/watchlist/is-watchlist/:movieId ─────────────
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await privateAxios.get(`/api/watchlist/is-watchlist/${id}`);
        if (!cancelled && res.data?.success) {
          setInWatchlist(!!res.data.is_watchlist);
        }
      } catch (err) {
        // Not logged in, or request failed — leave default (false) silently.
        console.error("Failed to check watchlist status:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ── Watchlist toggle: POST /api/watchlist/toggle ────────────────────────────
  async function handleToggleWatchlist() {
    if (!id || watchlistBusy) return;
    setWatchlistBusy(true);
    try {
      const res = await privateAxios.post("/api/watchlist/toggle", {
        movie_id: id,
      });
      if (res.data?.success) {
        setInWatchlist(!!res.data.is_watchlist);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
    } finally {
      setWatchlistBusy(false);
    }
  }

  // Scroll active tab into view
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const btn = bar.querySelector(`[data-tab="${activeTab}"]`);
    if (btn)
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
  }, [activeTab]);

  if (loading) return <DetailSkeleton />;
  if (!movie)
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center text-white/40 font-['Outfit']">
        Movie not found.
      </div>
    );

  const cast = movie.cast;
  const crew = movie.crew;
  const directorName =
    typeof movie.director === "object" ? movie.director?.fullName : movie.director;

  const writers = (movie.crew ?? [])
    .filter((c) => (c.role ?? "").toLowerCase().includes("writ"))
    .map((c) => c.name)
    .join(", ");

  // Build OTT platforms from API data, fallback to static PLATFORMS
  const platforms =
    movie.ottAvailability && movie.ottAvailability.length > 0
      ? movie.ottAvailability.map((p) => ({
          name: p.platformName,
          color: "#f5c518",
          bg: "rgba(245,197,24,0.1)",
          link: p.link,
        }))
      : PLATFORMS;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
                MOBILE LAYOUT (≤768px) — full screen, no sidebar
            ══════════════════════════════════════════════════════════════════════ */}
      <div className="min-h-screen bg-[#080810] ff-md-mobile">
        {/* ── HERO: 360px full-bleed backdrop ── */}
        <div className="relative overflow-hidden h-[360px]">
          <img
            src={movie.backdrop || movie.image}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center 20%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,8,16,0.15) 0%, rgba(8,8,16,0.3) 40%, rgba(8,8,16,0.85) 72%, #080810 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(8,8,16,0.4) 0%, transparent 30%, transparent 70%, rgba(8,8,16,0.4) 100%)",
            }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer z-20 p-0 transition-colors"
            style={{
              background: "rgba(8,8,16,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              minHeight: "unset",
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = "rgba(8,8,16,0.75)";
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = "rgba(8,8,16,0.5)";
            }}
          >
            <ChevronLeft size={20} color="#f0f0f8" />
          </button>
        </div>

        {/* ── POSTER + INFO ROW ── */}
        <div className="relative z-10 px-4 pb-4" style={{ marginTop: -80 }}>
          <div className="flex items-end gap-[14px]">
            <div
              className="w-[120px] h-[180px] rounded-[12px] overflow-hidden flex-shrink-0"
              style={{
                boxShadow: "0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={movie.poster || movie.image}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 pb-[4px]">
              <div className="flex items-center flex-wrap gap-[6px] mb-[7px]">
                {(movie.genre ?? []).slice(0, 2).map((g, i) => (
                  <span
                    key={g}
                    className="rounded-full px-[9px] py-[3px] text-[10px] font-bold tracking-[0.4px]"
                    style={
                      i === 0
                        ? {
                            background: `${ACCENT}18`,
                            border: `1px solid ${ACCENT}50`,
                            color: ACCENT,
                            fontFamily: "'Outfit', sans-serif",
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(240,240,248,0.55)",
                            fontFamily: "'Outfit', sans-serif",
                          }
                    }
                  >
                    {g}
                  </span>
                ))}
                <span
                  className="rounded-full px-[9px] py-[3px] text-[10px]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(240,240,248,0.45)",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {movie.type ?? "Movie"}
                </span>
              </div>

              <h1
                className="text-[36px] tracking-[1.5px] leading-[0.95] mb-[8px] overflow-hidden"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  color: "#f0f0f8",
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {movie.title}
              </h1>

              <div className="flex items-center gap-[8px] mb-[7px]">
                <div
                  className="flex items-center gap-[4px] rounded-[6px] px-[8px] py-[3px]"
                  style={{
                    background: `${ACCENT}12`,
                    border: `1px solid ${ACCENT}30`,
                  }}
                >
                  <Star size={10} color={ACCENT} fill={ACCENT} />
                  <span
                    className="text-[15px] tracking-[0.5px] leading-[1]"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      color: ACCENT,
                    }}
                  >
                    {movie.rating}
                  </span>
                  <span
                    className="text-[9px] leading-[1]"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: "rgba(240,240,248,0.35)",
                    }}
                  >
                    /10
                  </span>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-[5px]">
                {[movie.duration, String(movie.year), movie.languages?.[0] ?? "EN"]
                  .filter(Boolean)
                  .map((item, i, arr) => (
                    <span key={item} className="flex items-center gap-[5px]">
                      <span
                        className="text-[11px]"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          color: "rgba(240,240,248,0.45)",
                        }}
                      >
                        {item}
                      </span>
                      {i < arr.length - 1 && (
                        <span className="text-[10px] text-[rgba(240,240,248,0.2)]">·</span>
                      )}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION (watchlist only) ── */}
        <div className="px-[16px] pb-[14px] flex flex-col gap-[8px]">
          <button
            onClick={handleToggleWatchlist}
            disabled={watchlistBusy}
            className="flex items-center justify-center gap-[8px] w-full h-[48px] rounded-[12px]"
            style={{
              background: inWatchlist ? `${ACCENT}15` : "transparent",
              border: `1.5px solid ${inWatchlist ? ACCENT : `${ACCENT}70`}`,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: ACCENT,
              cursor: watchlistBusy ? "default" : "pointer",
              opacity: watchlistBusy ? 0.6 : 1,
              transition: "all 0.18s",
            }}
          >
            {inWatchlist ? (
              <Check size={16} color={ACCENT} strokeWidth={2.5} />
            ) : (
              <Plus size={16} color={ACCENT} />
            )}
            {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
          </button>
        </div>

        {/* ── STREAMING BADGES ── */}
        <div className="px-[16px] pb-[18px]">
          <div className="flex items-center gap-[8px]">
            <span
              className="text-[11px] flex-shrink-0"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "rgba(240,240,248,0.3)",
              }}
            >
              Available on
            </span>
            <div className="ff-hscroll flex gap-[7px] overflow-auto">
              {platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.link ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[7px] px-[12px] py-[4px] text-[11px] font-[700] whitespace-nowrap flex-shrink-0"
                  style={{
                    background: p.bg,
                    border: `1px solid ${p.color}40`,
                    fontFamily: "'Outfit', sans-serif",
                    color: p.color,
                    textDecoration: "none",
                  }}
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── CROSS-MODULE WIDGETS ── */}
        <div className="flex flex-col gap-[10px] px-[16px] pb-[18px]">
          <div
            onClick={() => setQuizSheetOpen(true)}
            className="w-full flex items-center gap-[12px] rounded-[14px] px-[16px] py-[14px] cursor-pointer box-border"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,252,0.14), rgba(155,89,182,0.09))",
              border: "1px solid rgba(124,92,252,0.3)",
            }}
          >
            <div
              className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(124,92,252,0.2)",
                border: "1px solid rgba(124,92,252,0.3)",
              }}
            >
              <Gamepad2 size={18} color="#7c5cfc" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[13px] font-[700] mb-[2px]"
                style={{ fontFamily: "'Outfit', sans-serif", color: "#f0f0f8" }}
              >
                🎮 Quiz: How well do you know this film?
              </div>
              <div
                className="text-[11px] font-[300]"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "rgba(240,240,248,0.4)",
                }}
              >
                Test your knowledge · Earn 50 pts
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuizSheetOpen(true);
              }}
              className="rounded-[8px] px-[13px] py-[7px] text-[11px] font-[700] text-white flex-shrink-0 whitespace-nowrap"
              style={{
                background: "#7c5cfc",
                fontFamily: "'Outfit', sans-serif",
                border: "none",
                minHeight: "unset",
              }}
            >
              Start Quiz
            </button>
          </div>

          <div
            onClick={() => setSocialSheetOpen(true)}
            className="w-full rounded-[14px] px-[16px] py-[14px] cursor-pointer box-border"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <div className="flex items-center gap-[10px] mb-[10px]">
              <div
                className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(59,130,246,0.18)",
                  border: "1px solid rgba(59,130,246,0.28)",
                }}
              >
                <Users size={16} color="#3b82f6" />
              </div>
              <div>
                <div
                  className="text-[13px] font-[700]"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "#f0f0f8",
                  }}
                >
                  👥 1.2k fans discussing this
                </div>
                <div
                  className="text-[11px] font-[300]"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "rgba(240,240,248,0.4)",
                  }}
                >
                  3 active threads right now
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-[6px] mb-[12px]">
              {COMMUNITY_POSTS.slice(0, 3).map((post, i) => (
                <div key={i} className="flex gap-[7px] items-start">
                  <div
                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-[1px] text-[7px] font-[800]"
                    style={{
                      background: post.gradient,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#080810",
                    }}
                  >
                    {post.initials}
                  </div>
                  <p
                    className="text-[11px] leading-[1.4] overflow-hidden"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: "rgba(240,240,248,0.55)",
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        color: "rgba(240,240,248,0.7)",
                      }}
                    >
                      {post.user}:{" "}
                    </span>
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSocialSheetOpen(true);
              }}
              className="flex items-center justify-center w-full h-[36px] rounded-[9px] text-[12px] font-[700] text-white"
              style={{
                background: "#3b82f6",
                border: "none",
                fontFamily: "'Outfit', sans-serif",
                minHeight: "unset",
              }}
            >
              Join Discussion →
            </button>
          </div>
        </div>

        {/* ── STICKY TABS BAR ── */}
        <div
          ref={tabBarRef}
          className="sticky top-0 z-[30] bg-[#080810] border-b border-[rgba(255,255,255,0.07)]"
        >
          <div className="ff-hscroll flex gap-0 overflow-x-auto pl-1">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                data-tab={value}
                onClick={() => setActiveTab(value)}
                className={`bg-transparent border-none border-b-2 px-[16px] py-[13px] cursor-pointer font-['Outfit',sans-serif] text-[13px] whitespace-nowrap flex-shrink-0 min-h-[44px] mb-[-1px] transition-colors duration-[180ms]
                                    ${activeTab === value ? "font-[700] text-[var(--accent)] border-[var(--accent)]" : "font-[400] text-[rgba(240,240,248,0.45)] border-transparent"}`}
                style={{ "--accent": ACCENT }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div ref={contentRef} className="pt-[18px] pb-[100px]">
          {activeTab === "overview" && <OverviewTab movie={movie} />}
          {activeTab === "cast" && <CastTab cast={cast} crew={crew} />}
          {activeTab === "trailers" && <TrailersTab movie={movie} />}
          {activeTab === "reviews" && <ReviewsTab movie={movie} />}
          {activeTab === "awards" && <AwardsTab awards={movie.awards} />}
          {activeTab === "story" && <StoryTab story={movie.story} />}
          {activeTab === "collection" && (
            <CollectionTab
              grossCollection={movie.grossCollection}
              netCollection={movie.netCollection}
            />
          )}
          {activeTab === "ott" && <OttTab ottAvailability={movie.ottAvailability} />}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
                DESKTOP LAYOUT (≥769px)
            ══════════════════════════════════════════════════════════════════════ */}
      <div className="ff-md-desktop min-h-screen bg-[#080810]">
        <div className="pt-[16px] px-[32px]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-[7px] bg-transparent border-none cursor-pointer font-['Outfit',sans-serif] text-[13px] text-[rgba(240,240,248,0.45)] py-[6px] transition-colors duration-[180ms] hover:text-[#f0f0f8]"
          >
            <ChevronLeft size={16} />
            Back to Archive
          </button>
        </div>

        <div className="relative h-[500px] overflow-hidden">
          <img
            src={movie.backdrop || movie.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-[0.6]"
            style={{ filter: "blur(28px) scale(1.15)" }}
          />
          <div className="absolute inset-0 bg-[rgba(8,8,16,0.70)]" />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-[linear-gradient(to_bottom,transparent,#080810)]" />

          <div className="relative h-full flex items-center px-[32px] gap-[32px] z-[1]">
            <div
              className="w-[180px] h-[270px] rounded-[14px] overflow-hidden flex-shrink-0"
              style={{
                boxShadow: "0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)",
                transform: "translateY(-10px)",
              }}
            >
              <img
                src={movie.poster || movie.image}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[8px] mb-[12px]">
                {(movie.genre ?? []).slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="rounded-[100px] px-[12px] py-[4px] font-['Outfit',sans-serif] text-[11px] font-[700] tracking-[0.5px]"
                    style={{
                      background: `${ACCENT}15`,
                      border: `1px solid ${ACCENT}40`,
                      color: ACCENT,
                    }}
                  >
                    {g}
                  </span>
                ))}
                <span className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[100px] px-[12px] py-[4px] font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.6)]">
                  {movie.type ?? "Movie"}
                </span>
              </div>

              <h1 className="font-['Bebas_Neue',cursive] text-[52px] tracking-[3px] text-[#f0f0f8] mb-[8px] leading-[1]">
                {movie.title}
              </h1>

              <div className="flex items-center gap-[20px] mb-[16px] flex-wrap">
                {[
                  { label: `${movie.rating}/5`, color: ACCENT },
                  { label: movie.duration, color: "rgba(240,240,248,0.55)" },
                  {
                    label: String(movie.year),
                    color: "rgba(240,240,248,0.55)",
                  },
                  {
                    label: movie.languages?.[0] ?? "English",
                    color: "rgba(240,240,248,0.55)",
                  },
                ]
                  .filter(({ label }) => label && label !== "undefined")
                  .map(({ label, color }) => (
                    <span
                      key={label}
                      className="font-['Outfit',sans-serif] text-[13px]"
                      style={{
                        color,
                        fontWeight: color === ACCENT ? 700 : 400,
                      }}
                    >
                      {label}
                    </span>
                  ))}
              </div>

              <p
                className="font-['Outfit',sans-serif] text-[15px] text-[rgba(240,240,248,0.65)] mb-[18px] leading-[1.7] font-[300] overflow-hidden max-w-[580px]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {movie.description}
              </p>

              <div className="flex items-center gap-[8px] mb-[20px]">
                <span className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.35)]">
                  Available on:
                </span>
                {platforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.link ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[7px] px-[12px] py-[4px] font-['Outfit',sans-serif] text-[11px] font-[700]"
                    style={{
                      background: p.bg,
                      border: `1px solid ${p.color}40`,
                      color: p.color,
                      textDecoration: "none",
                    }}
                  >
                    {p.name}
                  </a>
                ))}
              </div>

              {/* watchlist only */}
              <div className="flex items-center gap-[10px]">
                <button
                  onClick={handleToggleWatchlist}
                  disabled={watchlistBusy}
                  className="flex items-center gap-[8px] rounded-[10px] px-[22px] py-[11px] font-['Outfit',sans-serif] text-[14px] font-[600] cursor-pointer"
                  style={{
                    background: inWatchlist ? `${ACCENT}12` : "transparent",
                    border: `1px solid ${inWatchlist ? ACCENT : `${ACCENT}60`}`,
                    color: ACCENT,
                    cursor: watchlistBusy ? "default" : "pointer",
                    opacity: watchlistBusy ? 0.6 : 1,
                  }}
                >
                  {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
                  {inWatchlist ? "In Watchlist" : "Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop cross-module */}
        <div className="pt-[24px] px-[32px] flex gap-[14px] flex-wrap">
          <div
            onClick={() => navigate("/entertain/games")}
            className="flex items-center gap-[14px] flex-1 min-w-[240px] rounded-[14px] px-[20px] py-[16px] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,252,0.12), rgba(155,89,182,0.08))",
              border: "1px solid rgba(124,92,252,0.25)",
            }}
          >
            <div
              className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(124,92,252,0.2)",
                border: "1px solid rgba(124,92,252,0.3)",
              }}
            >
              <Gamepad2 size={20} color="#7c5cfc" />
            </div>
            <div className="flex-1">
              <div className="font-['Outfit',sans-serif] text-[14px] font-[700] text-[#f0f0f8] mb-[2px]">
                🎮 Think you know this film?
              </div>
              <div className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.4)] font-[300]">
                Test your knowledge with a trivia quiz
              </div>
            </div>
            <button className="bg-[#7c5cfc] border-none rounded-[8px] px-[16px] py-[8px] font-['Outfit',sans-serif] text-[12px] font-[700] text-white cursor-pointer flex-shrink-0">
              Start Quiz
            </button>
          </div>

          <div
            onClick={() => navigate("/social/communities")}
            className="flex items-center gap-[14px] flex-1 min-w-[240px] rounded-[14px] px-[20px] py-[16px] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))",
              border: "1px solid rgba(59,130,246,0.22)",
            }}
          >
            <div
              className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
            >
              <Users size={20} color="#3b82f6" />
            </div>
            <div className="flex-1">
              <div className="font-['Outfit',sans-serif] text-[14px] font-[700] text-[#f0f0f8] mb-[2px]">
                👥 Fans are talking
              </div>
              <div className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.4)] font-[300]">
                Join 3 active community discussions
              </div>
            </div>
            <button className="bg-[#3b82f6] border-none rounded-[8px] px-[16px] py-[8px] font-['Outfit',sans-serif] text-[12px] font-[700] text-white cursor-pointer flex-shrink-0">
              Join Discussion
            </button>
          </div>
        </div>

        {/* Desktop tabs */}
        <div className="pt-[24px] border-b border-[rgba(255,255,255,0.07)] sticky top-0 bg-[#080810] z-[30]">
          <div className="flex gap-0 pl-[32px] overflow-x-auto [scrollbar-width:none]">
            {TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className="bg-transparent border-none px-[20px] py-[12px] cursor-pointer font-['Outfit',sans-serif] text-[13px] transition-colors duration-[180ms] whitespace-nowrap mb-[-1px]"
                style={{
                  borderBottom: `2px solid ${activeTab === value ? ACCENT : "transparent"}`,
                  color: activeTab === value ? ACCENT : "rgba(240,240,248,0.45)",
                  fontWeight: activeTab === value ? 600 : 400,
                  transition: "color 0.18s, border-color 0.18s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop tab content */}
        <div className="pt-[28px] px-[32px] pb-[64px]">
          {activeTab === "overview" && (
            <div className="flex gap-[28px] items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-['Bebas_Neue',cursive] text-[22px] tracking-[1.5px] text-[#f0f0f8] mb-[14px]">
                  Synopsis
                </h3>
                <p className="font-['Outfit',sans-serif] text-[15px] text-[rgba(240,240,248,0.65)] mb-[28px] leading-[1.8] font-[300] max-w-[580px]">
                  {movie.description}
                </p>

                <h3 className="font-['Bebas_Neue',cursive] text-[22px] tracking-[1.5px] text-[#f0f0f8] mb-[14px]">
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-y-[10px] gap-x-[24px]">
                  {[
                    ["Director", directorName || "—"],
                    ["Writers", writers || "—"],
                    ["Studio", movie.studio || "—"],
                    ["Language", movie.languages?.join(", ") || "—"],
                    ["Release", String(movie.year ?? "—")],
                    ["Budget", "—"],
                    [
                      "Box Office",
                      movie.grossCollection ? `$${(movie.grossCollection / 1e6).toFixed(1)}M` : "—",
                    ],
                  ].map(([l, v]) => (
                    <div key={l} className="py-[10px] border-b border-[rgba(255,255,255,0.05)]">
                      <div className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.35)] mb-[3px]">
                        {l}
                      </div>
                      <div className="font-['Outfit',sans-serif] text-[13px] font-[500] text-[#f0f0f8]">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-[240px] shrink-0">
                <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[20px] text-center">
                  <div
                    className="font-['Bebas_Neue',cursive] text-[56px] tracking-[3px] leading-[1]"
                    style={{ color: ACCENT }}
                  >
                    {movie.rating}
                  </div>
                  <div className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.35)]">
                    ⭐ IMDb Rating
                  </div>
                </div>

                {movie.badge && (
                  <div
                    className="rounded-[10px] py-[12px] px-[16px] text-center mt-[14px]"
                    style={{
                      background: `${ACCENT}12`,
                      border: `1px solid ${ACCENT}30`,
                    }}
                  >
                    <div className="text-[24px] mb-[4px]">🏆</div>
                    <div
                      className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1.5px]"
                      style={{ color: ACCENT }}
                    >
                      {movie.badge}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "cast" && <CastTab cast={cast} crew={crew} />}
          {activeTab === "trailers" && <TrailersTab movie={movie} />}
          {activeTab === "reviews" && <ReviewsTab movie={movie} />}
          {activeTab === "awards" && <AwardsTab awards={movie.awards} />}
          {activeTab === "story" && <StoryTab story={movie.story} />}
          {activeTab === "collection" && (
            <CollectionTab
              grossCollection={movie.grossCollection}
              netCollection={movie.netCollection}
            />
          )}
          {activeTab === "ott" && <OttTab ottAvailability={movie.ottAvailability} />}
        </div>
      </div>

      {/* ── Bottom Sheets ── */}
      <BottomSheet
        open={quizSheetOpen}
        onClose={() => setQuizSheetOpen(false)}
        title="Film Trivia Quiz"
        subtitle={`Test your knowledge of ${movie.title}`}
        accentColor="#7c5cfc"
        maxHeight="90vh"
      >
        <div className="pt-2 pb-6">
          <div className="bg-[rgba(124,92,252,0.08)] border border-[rgba(124,92,252,0.2)] rounded-[14px] px-[22px] py-[20px] mb-5">
            <div className="font-['Bebas_Neue'] text-[20px] tracking-[1.5px] text-[#f0f0f8] mb-2">
              10 Questions · 5 min
            </div>
            <p className="font-['Outfit'] text-[13px] text-[rgba(240,240,248,0.5)] mb-4 font-light">
              From plot details to behind-the-scenes facts — how well do you really know this film?
            </p>
            <button className="bg-[#7c5cfc] rounded-[10px] px-7 py-3 font-['Outfit'] text-[14px] font-bold text-white cursor-pointer">
              🎮 Start Quiz
            </button>
          </div>
          <p className="font-['Outfit'] text-[12px] text-[rgba(240,240,248,0.3)] text-center">
            Earn 50 Frolic Points for completing this quiz
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        open={socialSheetOpen}
        onClose={() => setSocialSheetOpen(false)}
        title="Community Discussion"
        subtitle={`What fans are saying about ${movie.title}`}
        accentColor="#3b82f6"
        maxHeight="85vh"
      >
        <div className="pt-2 pb-6 flex flex-col gap-3">
          {COMMUNITY_POSTS.map((post, i) => (
            <div
              key={i}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3.5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-['Outfit'] font-extrabold text-[10px] text-[#080810]"
                  style={{ background: post.gradient }}
                >
                  {post.initials}
                </div>
                <div>
                  <div className="font-['Outfit'] text-[13px] font-semibold text-[#f0f0f8]">
                    {post.user}
                  </div>
                  <div className="font-['Outfit'] text-[11px] text-[rgba(240,240,248,0.3)]">
                    {post.time}
                  </div>
                </div>
              </div>
              <p className="font-['Outfit'] text-[13px] text-[rgba(240,240,248,0.6)] leading-[1.6] mb-2 font-light">
                {post.content}
              </p>
              <div className="font-['Outfit'] text-[11px] text-[rgba(240,240,248,0.35)]">
                ❤️ {post.reactions.toLocaleString()} reactions
              </div>
            </div>
          ))}
          <button className="bg-[#3b82f6] rounded-[10px] py-3 text-[13px] font-bold text-white mt-2 font-['Outfit']">
            Join the Full Discussion →
          </button>
        </div>
      </BottomSheet>

      <style>{`
                @media (max-width: 768px) {
                    .ff-md-mobile  { display: block !important; }
                    .ff-md-desktop { display: none  !important; }
                }
                @media (min-width: 769px) {
                    .ff-md-mobile  { display: none  !important; }
                    .ff-md-desktop { display: block !important; }
                }
            `}</style>
    </>
  );
}

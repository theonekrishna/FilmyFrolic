import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import { Search } from "lucide-react";

import { publicAxios } from "../../../utils/AxiosInstance";
import { RECENT_SEARCHES } from "../data/archive";

import ArchiveSearchBar from "../components/ArchiveSearchBar";
import FilterRow from "../components/FilterRow";
import FeaturedCard from "../components/FeaturedCard";
import GenreSectionRow from "../components/GenreSectionRow";
import DesktopDiscoverView from "../components/DesktopDiscoverView";
import SearchSuggestions from "../components/SearchSuggestions";
import SearchResultsList from "../components/SearchResultsList";
import DiscoverSkeleton from "../components/DiscoverSkeleton";

const ACCENT = "#f5c518";
const MAX_WIDTH = "max-w-[1440px]";
const CONTAINER_PADDING = "px-4 md:px-10";

export default function Archive() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") || searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState("all");
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  function formatDuration(rawMinutes) {
    const total = parseInt(rawMinutes, 10);
    if (!total || Number.isNaN(total)) return "";
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function mapListMovie(raw) {
    const rawRating = raw?.rating ?? raw?.vote_average;
    const rating = typeof rawRating === "number" ? rawRating : parseFloat(rawRating) || 0;
    const poster = raw?.poster_url || raw?.poster || raw?.image || "";

    return {
      id: raw?.id ?? raw?._id ?? raw?.tmdb_id ?? null,
      title: raw?.title ?? raw?.name ?? "Untitled",
      year: raw?.year ?? (raw?.release_date ? raw.release_date.split("-")[0] : ""),
      rating: Number(rating.toFixed(1)),
      image: poster,
      genre: Array.isArray(raw?.genres) ? raw.genres : [],
      duration: raw?.runtime ? formatDuration(raw.runtime) : "",
      description: raw?.overview ?? raw?.synopsis ?? "",
      badge: null,
      type: raw?.type ?? "Movies",
    };
  }

  // ─── Fetch movie list from the API (TMDB prioritized first) ──────────────────
  useEffect(() => {
    setMoviesLoading(true);
    setLoadError(null);

    const params = {};
    if (filter && filter !== "all") params.type = filter;
    if (query) params.query = query;

    publicAxios
      .get("/api/archive", { params })
      .then((res) => {
        const raw = res.data?.data ?? res.data?.movies ?? res.data;
        const list = Array.isArray(raw) ? raw : [];
        setMovies(list.map(mapListMovie).filter((m) => m.id));
      })
      .catch((err) => {
        console.error("Failed to fetch movies:", err);
        setLoadError(err.message || "Failed to load movies");
      })
      .finally(() => setMoviesLoading(false));
  }, [filter, query]);

  // ─── Search results (mobile) — title search ────────────────────────────
  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return movies.filter((m) => m.title.toLowerCase().includes(q));
  }, [query, movies]);

  // ─── Desktop full list ──────────────────────────────────────────────────
  const desktopMovies = useMemo(() => {
    if (!query) return movies;
    return movies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, movies]);

  const featuredMovie = useMemo(
    () => [...movies].sort((a, b) => b.rating - a.rating)[0] ?? null,
    [movies]
  );

  const handlePickRecent = (term) => {
    setQuery(term);
    inputRef.current?.blur();
  };

  const handleClearRecent = (term) => {
    setRecents((r) => r.filter((x) => x !== term));
  };

  const isSearchMode = Boolean(query) || (focused && !query);

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit'] overflow-x-hidden selection:bg-yellow-400/30">
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 3px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #1a1a26; border-radius: 10px; border: 2px solid #080810; }
        ::-webkit-scrollbar-thumb:hover { background: #f5c518; }
        .ff-no-scrollbar::-webkit-scrollbar { display: none; }
        .ff-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <TopBar title="Discover" />

      <header
        className={`hidden md:block pt-8 ${CONTAINER_PADDING} pb-2 mx-auto w-full ${MAX_WIDTH}`}
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 border border-yellow-400/20 shadow-xl shadow-yellow-400/5">
            <Search size={22} color={ACCENT} />
          </div>
          <div>
            <h1 className="text-4xl tracking-widest leading-none mb-2 font-['Bebas_Neue'] uppercase">
              Discover
            </h1>
            <p className="text-sm text-white/40 font-medium tracking-wide">
              Browse 500,000+ movies & series
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-[56px] z-40 bg-[#080810]/90 backdrop-blur-xl py-4">
        <div className={`mx-auto ${CONTAINER_PADDING} ${MAX_WIDTH}`}>
          <ArchiveSearchBar
            query={query}
            onChange={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            focused={focused}
            inputRef={inputRef}
          />
        </div>
      </div>

      {loadError && (
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-10 pt-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>Couldn't load movies: {loadError}</span>
          </div>
        </div>
      )}

      {/* ── MOBILE CONTENT ── */}
      <main
        className={`md:hidden ${CONTAINER_PADDING} space-y-8 pb-24 mx-auto w-full ${MAX_WIDTH}`}
      >
        <FilterRow active={filter} onSelect={setFilter} />

        {moviesLoading ? (
          <DiscoverSkeleton />
        ) : isSearchMode && !query ? (
          <SearchSuggestions
            recents={recents}
            onPickRecent={handlePickRecent}
            onClearRecent={handleClearRecent}
          />
        ) : query ? (
          <SearchResultsList results={results} query={query} navigate={navigate} />
        ) : (
          <div className="space-y-12">
            {featuredMovie && (
              <FeaturedCard
                movie={featuredMovie}
                onClick={() => navigate(`/content/movie/${featuredMovie.id}`)}
              />
            )}

            {!featuredMovie && movies.length === 0 && (
              <div className="text-center text-white/30 text-sm py-12">
                No movies available right now.
              </div>
            )}

            {movies.length > 0 && (
              <GenreSectionRow genre="All Movies" movies={movies} navigate={navigate} />
            )}
          </div>
        )}
      </main>

      {/* ── DESKTOP CONTENT ── */}
      <main className={`hidden md:block ${CONTAINER_PADDING} pb-20 mx-auto w-full ${MAX_WIDTH}`}>
        {moviesLoading ? (
          <DiscoverSkeleton />
        ) : (
          <DesktopDiscoverView
            movies={desktopMovies}
            navigate={navigate}
            filter={filter}
            setFilter={setFilter}
            query={query}
          />
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .md\\:block { display: none !important; }
        }
        @media (min-width: 769px) {
          .md\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

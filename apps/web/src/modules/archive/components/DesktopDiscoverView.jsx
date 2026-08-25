import { useState, useMemo } from "react";
import { Star, SlidersHorizontal, Search, X } from "lucide-react";
import { FILTERS } from "../data/archive";

const ACCENT = "#f5c518";

const GENRES = [
  "All",
  "Action",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Thriller",
  "Horror",
  "Romance",
  "Animation",
  "Adventure",
];

const SORTS = [
  { label: "Trending", value: "trending" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

export default function DesktopDiscoverView({
  movies = [],
  navigate,
  filter,
  setFilter,
  query,
  setQuery,
}) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("trending");

  // Apply genre and sort filtering on client
  const processedMovies = useMemo(() => {
    let result = [...movies];

    if (selectedGenre !== "All") {
      result = result.filter((m) =>
        Array.isArray(m.genre)
          ? m.genre.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
          : true
      );
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    return result;
  }, [movies, selectedGenre, sortBy]);

  return (
    <div>
      {/* ── Control Bar: Filters, Genre, Sort & Local Search ── */}
      <div className="pt-4 pb-2 flex flex-wrap items-center gap-4 bg-[rgba(18,18,30,0.6)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.07)]">
        {/* Type pills: All / Movies / Series */}
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="h-[36px] px-5 rounded-full text-[13px] cursor-pointer font-['Outfit'] transition-all duration-200"
                style={{
                  border: isActive ? `1.5px solid ${ACCENT}80` : "1px solid rgba(255,255,255,0.12)",
                  background: isActive ? `${ACCENT}20` : "rgba(255,255,255,0.04)",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? ACCENT : "rgba(240,240,248,0.6)",
                  boxShadow: isActive ? `0 0 16px ${ACCENT}30` : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden lg:block" />

        {/* Genre Selector */}
        <div className="flex items-center gap-2 overflow-x-auto ff-no-scrollbar max-w-[450px]">
          {GENRES.map((g) => {
            const isSel = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className="h-[32px] px-3.5 rounded-lg text-[12px] cursor-pointer font-['Outfit'] transition-all duration-150 whitespace-nowrap"
                style={{
                  background: isSel ? "rgba(255,255,255,0.12)" : "transparent",
                  color: isSel ? "#f0f0f8" : "rgba(240,240,248,0.45)",
                  border: isSel ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  fontWeight: isSel ? 600 : 400,
                }}
              >
                {g}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-1.5 text-[12px]">
            <SlidersHorizontal size={13} color={ACCENT} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#f0f0f8] font-['Outfit'] text-[12px] outline-none cursor-pointer border-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#12121e] text-[#f0f0f8]">
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title count */}
          <span className="font-['Outfit'] text-[13px] text-[rgba(240,240,248,0.4)]">
            <span style={{ color: ACCENT, fontWeight: 700 }}>{processedMovies.length}</span> titles
          </span>
        </div>
      </div>

      {/* ── Movie Cards Grid ── */}
      <div className="grid gap-[24px] pt-[24px] pb-[80px] [grid-template-columns:repeat(auto-fill,minmax(165px,1fr))]">
        {processedMovies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/content/movie/${movie.id}`)}
            className="cursor-pointer group transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-full pb-[150%] rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.08)] mb-[12px] shadow-lg transition-all duration-300 group-hover:border-yellow-400/30 group-hover:shadow-[0_12px_40px_rgba(245,197,24,0.25)]">
              <img
                src={movie.image}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.7) 40%, transparent 70%)",
                }}
              />
              <div
                className="absolute bottom-[8px] left-[8px] flex items-center gap-[4px] backdrop-blur-sm rounded-full px-[8px] py-[2px] transition-all duration-300 group-hover:scale-105"
                style={{ background: "rgba(8,8,16,0.8)" }}
              >
                <Star size={10} color={ACCENT} fill={ACCENT} />
                <span className="font-['Outfit'] text-[11px] font-bold" style={{ color: ACCENT }}>
                  {movie.rating ? movie.rating.toFixed(1) : "8.0"}
                </span>
              </div>

              <div
                className="absolute top-[8px] right-[8px] rounded-[6px] px-[8px] py-[2px] text-[9px] font-bold text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-105"
                style={{
                  background: movie.type === "Series" ? "rgba(124,92,252,0.85)" : `${ACCENT}dd`,
                }}
              >
                {movie.type || "Movie"}
              </div>
            </div>

            <div className="font-['Outfit'] text-[14px] font-semibold text-[#f0f0f8] overflow-hidden whitespace-nowrap text-ellipsis transition-colors duration-300 group-hover:text-yellow-400">
              {movie.title}
            </div>

            <div className="font-['Outfit'] text-[11px] text-[rgba(240,240,248,0.4)] mt-[3px]">
              {movie.genre?.[0] ? `${movie.year} · ${movie.genre[0]}` : movie.year}
            </div>
          </div>
        ))}

        {processedMovies.length === 0 && (
          <div className="col-span-full text-center py-[64px] px-[24px] text-[rgba(240,240,248,0.3)] font-['Outfit'] text-[14px]">
            No titles match your selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

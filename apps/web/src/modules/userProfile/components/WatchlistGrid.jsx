import { useState, useEffect } from "react";
import { Bookmark, Star, X } from "lucide-react";
import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div
            className="w-full rounded-[12px] mb-2"
            style={{
              aspectRatio: "2/3",
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            className="h-3 rounded-full w-3/4"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-[60px]">
      <div
        className="w-[56px] h-[56px] rounded-full flex items-center justify-center mb-4"
        style={{
          background: `${ACCENT}12`,
          border: `1px solid ${ACCENT}30`,
        }}
      >
        <Bookmark size={22} color={ACCENT} />
      </div>
      <p
        className="text-[14px] font-semibold text-[#f0f0f8] mb-1"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Your watchlist is empty
      </p>
      <p
        className="text-[12px] text-[rgba(240,240,248,0.4)] font-light"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Movies you add to your watchlist will show up here
      </p>
    </div>
  );
}

export default function WatchlistGrid({ navigate }) {
  const [items, setItems] = useState([]); // [{ movie_id, movie: {...} | null }]
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await privateAxios.get("/api/watchlist");
        const rows = res.data?.success ? (res.data.data ?? []) : [];

        // Enrich each watchlist row with movie details for the poster/title.
        const enriched = await Promise.all(
          rows.map(async (row) => {
            try {
              const movieRes = await publicAxios.get(`/api/home/movies/${row.movie_id}`);
              const m = movieRes.data?.data ?? movieRes.data;
              return {
                movie_id: row.movie_id,
                movie: {
                  title: m?.title ?? "Untitled",
                  poster: m?.poster ?? null,
                  year: m?.year ?? null,
                  rating: m?.rating ?? null,
                },
              };
            } catch {
              // Movie lookup failed (e.g. deleted) — keep the row, no poster.
              return { movie_id: row.movie_id, movie: null };
            }
          })
        );

        if (!cancelled) setItems(enriched);
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemove(e, movieId) {
    e.stopPropagation();
    if (removingId) return;
    setRemovingId(movieId);
    try {
      const res = await privateAxios.post("/api/watchlist/toggle", {
        movie_id: movieId,
      });
      if (res.data?.success && res.data.is_watchlist === false) {
        setItems((prev) => prev.filter((it) => it.movie_id !== movieId));
      }
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return <GridSkeleton />;
  if (items.length === 0) return <EmptyState />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map(({ movie_id, movie }) => (
        <div
          key={movie_id}
          onClick={() => navigate?.(`/content/archive/${movie_id}`)}
          className="cursor-pointer group relative"
        >
          <div
            className="w-full rounded-[12px] overflow-hidden mb-2 relative"
            style={{
              aspectRatio: "2/3",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {movie?.poster ? (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Bookmark size={20} color="rgba(240,240,248,0.2)" />
              </div>
            )}

            {/* Rating badge */}
            {movie?.rating != null && (
              <div
                className="absolute top-2 left-2 flex items-center gap-[3px] rounded-[6px] px-[6px] py-[2px]"
                style={{
                  background: "rgba(8,8,16,0.7)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Star size={9} fill={GOLD} color={GOLD} />
                <span
                  className="text-[10px] font-bold"
                  style={{ color: GOLD, fontFamily: "'Outfit', sans-serif" }}
                >
                  {movie.rating}
                </span>
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(e, movie_id)}
              disabled={removingId === movie_id}
              title="Remove from watchlist"
              className="absolute top-2 right-2 w-[24px] h-[24px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "rgba(8,8,16,0.75)",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: removingId === movie_id ? "default" : "pointer",
              }}
            >
              <X size={12} color="#f0f0f8" />
            </button>
          </div>

          <div
            className="text-[12px] font-semibold text-[#f0f0f8] truncate"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {movie?.title ?? "Unavailable"}
          </div>
          {movie?.year && (
            <div
              className="text-[10px] text-[rgba(240,240,248,0.35)]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {movie.year}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

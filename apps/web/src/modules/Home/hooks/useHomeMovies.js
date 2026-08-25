import { useState, useEffect, useCallback } from "react";
import { publicAxios } from "../../../utils/AxiosInstance";

const COMBINED_COUNT = 16;

export function useHomeMovies() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [allTitles, setAllTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function formatDuration(minutes) {
    const total = parseInt(minutes, 10);
    if (!total || Number.isNaN(total)) return "";
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function inferBadge(rating, year) {
    const currentYear = new Date().getFullYear();
    if (rating >= 8) return "Top Rated";
    if (year >= currentYear - 1) return "New";
    return undefined;
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
      backdrop: raw?.backdrop_url || poster,
      genre: Array.isArray(raw?.genres) ? raw.genres : [],
      duration: raw?.runtime ? formatDuration(raw.runtime) : "",
      description: raw?.overview ?? raw?.synopsis ?? "",
      badge: inferBadge(rating, raw?.year),
      trending: false,
      type: raw?.type ?? "Movies",
    };
  }

  function mapFeaturedMovie(raw) {
    const rawRating = raw?.rating ?? raw?.vote_average;
    const rating = typeof rawRating === "number" ? rawRating : parseFloat(rawRating) || 0;
    const backdrop = raw?.backdrop_url || raw?.poster_url || raw?.poster || raw?.image || "";

    return {
      id: raw?.id ?? raw?._id ?? raw?.tmdb_id ?? null,
      title: raw?.title ?? raw?.name ?? "Untitled",
      year: raw?.year ?? (raw?.release_date ? raw.release_date.split("-")[0] : ""),
      rating: Number(rating.toFixed(1)),
      image: backdrop,
      backdrop,
      poster: raw?.poster_url || raw?.poster || backdrop,
      genre: Array.isArray(raw?.genres) ? raw.genres : [],
      duration: formatDuration(raw?.runtime || raw?.movieDuration),
      description: raw?.overview ?? raw?.synopsis ?? "",
      badge: inferBadge(rating, raw?.year),
      trending: false,
      type: raw?.type ?? "Movies",
    };
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const homeRes = await publicAxios.get("/api/home/movies");
      const rawData = homeRes.data?.data || homeRes.data?.movies || homeRes.data || [];
      const homeList = Array.isArray(rawData) ? rawData : [];
      const mappedMovies = homeList.map(mapListMovie).filter((m) => m.id);

      // Top featured items for the Hero carousel
      const heroList = homeList
        .slice(0, 6)
        .map(mapFeaturedMovie)
        .filter((m) => m.id);
      setFeaturedMovies(heroList);
      setFeaturedMovie(heroList[0] || null);

      // Series
      let mappedSeries = [];
      try {
        const seriesRes = await publicAxios.get("/api/archive", {
          params: { type: "series" },
        });
        const seriesRaw = seriesRes.data?.data || seriesRes.data?.movies || seriesRes.data || [];
        const seriesList = Array.isArray(seriesRaw) ? seriesRaw : [];
        mappedSeries = seriesList.map(mapListMovie).filter((m) => m.id);
      } catch (seriesErr) {
        console.warn("Series load fallback:", seriesErr);
      }

      // Deduplicate items by ID and Title to prevent duplicates in Top Movies & Series
      const uniqueMap = new Map();
      [...mappedMovies, ...mappedSeries].forEach((item) => {
        const key = `${item.id}-${item.title}`;
        if (item.id && !uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      const combined = Array.from(uniqueMap.values()).sort((a, b) => b.rating - a.rating);

      setAllTitles(combined.slice(0, COMBINED_COUNT));
    } catch (err) {
      setError(err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    featuredMovie,
    featuredMovies,
    allTitles,
    loading,
    error,
    refetch: load,
  };
}

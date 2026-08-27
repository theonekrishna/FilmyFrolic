const axios = require("axios");
const tmdbService = require("../tmdb/tmdb.service");

const BASE_URL = process.env.FILMYDOCK_BACKEND_URL || "https://filmydock-backend-qav3.onrender.com";

// Home list API: TMDB FIRST, Filmydock SECOND fallback
const getMovies = async (params = {}) => {
  const page = params.Page || params.page || 1;
  try {
    console.log("[HOME] Invoking TMDB getTrendingMovies");
    const tmdbData = await tmdbService.getTrendingMovies(page);
    if (tmdbData && tmdbData.results && tmdbData.results.length > 0) {
      console.log(`[HOME] TMDB returned ${tmdbData.results.length} movies cleanly`);
      return {
        success: true,
        data: tmdbData.results,
        page: tmdbData.page,
        total: tmdbData.total_results,
      };
    }
    throw new Error("No TMDB trending results returned");
  } catch (error) {
    console.warn(
      "[HOME WARNING] TMDB request failed/empty. Attempting Filmydock fallback:",
      error.message
    );
    try {
      const res = await axios.get(`${BASE_URL}/api/filmyfrolic/movies`, {
        params,
        timeout: 4000,
      });
      console.log("[HOME] Filmydock fallback succeeded");
      return res.data;
    } catch (fallbackErr) {
      console.error("[HOME ERROR] Both TMDB and Filmydock failed:", fallbackErr.message);
      return {
        success: true,
        data: [],
        page: 1,
        total: 0,
      };
    }
  }
};

// Single movie API: TMDB FIRST, Filmydock SECOND fallback
const getMovieById = async (id) => {
  try {
    const tmdbMovie = await tmdbService.getMovieDetails(id);
    if (tmdbMovie && tmdbMovie.id) {
      return tmdbMovie;
    }
    throw new Error("TMDB movie details not found");
  } catch (error) {
    console.warn(
      `TMDB getMovieById failed for ${id}. Falling back to Filmydock API:`,
      error.message
    );
    try {
      const res = await axios.get(`${BASE_URL}/api/filmyfrolic/movies/${id}`, { timeout: 4000 });
      return res.data;
    } catch (fallbackErr) {
      console.error(`Both TMDB and Filmydock failed for ID ${id}:`, fallbackErr.message);
      return null;
    }
  }
};

module.exports = {
  getMovies,
  getMovieById,
};

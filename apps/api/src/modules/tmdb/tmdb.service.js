const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "84b706f97f7481283d5a499a0937a09d";

// Fallback curated movie dataset when API Key is unauthenticated/expired
const FALLBACK_MOVIES = [
  {
    id: 27205,
    title: "Inception",
    original_title: "Inception",
    overview:
      "Cobb, a skilled thief who steals information from targets by entering their dreams, is offered a chance to have his criminal history erased.",
    release_date: "2010-07-16",
    year: "2010",
    rating: "8.4",
    poster_url: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsR4yHAoaw.jpg",
    genres: ["Action", "Sci-Fi", "Adventure"],
    trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
  },
  {
    id: 155,
    title: "The Dark Knight",
    original_title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    release_date: "2008-07-18",
    year: "2008",
    rating: "8.5",
    poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w780/nMK2819TyZMo7RuvlTHr83Ym22E.jpg",
    genres: ["Action", "Crime", "Drama"],
    trailer_url: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
  },
  {
    id: 157336,
    title: "Interstellar",
    original_title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    release_date: "2014-11-05",
    year: "2014",
    rating: "8.4",
    poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniL6C8z19uVOtYnZ5UYj7d.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w780/pBRDqaYiSpviTXW1wEG9dG2943b.jpg",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    original_title: "Pulp Fiction",
    overview:
      "A burger-loving hitman, his philosophical partner, a loser boxer, and a mobster's wife intertwine in four tales of violence and redemption.",
    release_date: "1994-09-10",
    year: "1994",
    rating: "8.5",
    poster_url: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w780/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    genres: ["Crime", "Drama"],
    trailer_url: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
  },
  {
    id: 603,
    title: "The Matrix",
    original_title: "The Matrix",
    overview:
      "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the machines.",
    release_date: "1999-03-30",
    year: "1999",
    rating: "8.2",
    poster_url: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w780/8cHfv92o2mY2wR09Op9j2w3pQ2.jpg",
    genres: ["Action", "Sci-Fi"],
    trailer_url: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
  },
];

// Simple in-memory cache with TTL (1 hour)
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Formatter to map TMDB response into FilmyFrolic movie DTO
const formatMovieDTO = (movie) => {
  if (!movie) return null;
  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.poster_url || null;
  const backdropPath = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : movie.backdrop_url || null;

  const directorObj = movie.credits?.crew?.find((c) => c.job === "Director");
  const writerObjs = movie.credits?.crew?.filter(
    (c) => c.department === "Writing" || c.job === "Writer" || c.job === "Screenplay"
  );
  const writersStr = writerObjs?.length
    ? Array.from(new Set(writerObjs.map((w) => w.name)))
        .slice(0, 3)
        .join(", ")
    : null;

  const studioStr = movie.production_companies?.length
    ? movie.production_companies
        .map((p) => p.name)
        .slice(0, 2)
        .join(", ")
    : null;

  const languagesList = movie.spoken_languages?.length
    ? movie.spoken_languages.map((l) => l.english_name || l.name)
    : [];

  const formattedBudget = movie.budget ? `$${(movie.budget / 1000000).toFixed(0)}M` : null;
  const formattedRevenue = movie.revenue ? `$${(movie.revenue / 1000000).toFixed(0)}M` : null;

  // OTT Watch Providers from TMDB
  const watchProvidersObj = movie["watch/providers"]?.results;
  const regionData =
    watchProvidersObj?.US ||
    watchProvidersObj?.IN ||
    watchProvidersObj?.GB ||
    Object.values(watchProvidersObj || {})[0];
  const flatrateList = regionData?.flatrate || regionData?.rent || [];
  const ottAvailability = flatrateList.map((p) => ({
    platformName: p.provider_name,
    link: `https://www.google.com/search?q=${encodeURIComponent((movie.title || movie.name) + " on " + p.provider_name)}`,
  }));

  // Reviews from TMDB
  const reviewsResults = movie.reviews?.results || [];
  const topReview = reviewsResults[0]?.content || null;

  // Trailer Link
  const trailerKey = movie.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  )?.key;
  const trailerUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null;
  const trailerLink = trailerUrl ? [trailerUrl] : movie.trailerLink || [];

  return {
    id: movie.id,
    tmdb_id: movie.id,
    title: movie.title || movie.name,
    original_title: movie.original_title || movie.title,
    overview: movie.overview || "",
    story: movie.overview || "",
    release_date: movie.release_date || movie.first_air_date || "",
    year: (movie.release_date || movie.first_air_date || movie.year || "").split("-")[0],
    rating:
      typeof movie.vote_average === "number"
        ? movie.vote_average.toFixed(1)
        : movie.rating || "8.0",
    vote_count: movie.vote_count || 1000,
    popularity: movie.popularity || 100,
    poster_path: movie.poster_path || null,
    poster_url: posterPath,
    image: posterPath,
    backdrop_path: movie.backdrop_path || null,
    backdrop_url: backdropPath,
    genre_ids: movie.genre_ids || [],
    genres: movie.genres
      ? typeof movie.genres[0] === "string"
        ? movie.genres
        : movie.genres.map((g) => g.name)
      : [],
    runtime: movie.runtime || null,
    director: directorObj?.name || movie.director || null,
    writers: writersStr || movie.writers || null,
    studio: studioStr || movie.studio || null,
    languages: languagesList.length > 0 ? languagesList : movie.languages || ["English"],
    budget: formattedBudget || movie.budget || null,
    boxOffice: formattedRevenue || movie.boxOffice || movie.grossCollection || null,
    ottAvailability: ottAvailability.length > 0 ? ottAvailability : movie.ottAvailability || [],
    review: topReview || movie.review || null,
    reviews: reviewsResults,
    trailer_url: trailerUrl,
    trailerLink,
    cast:
      movie.credits?.cast?.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_url: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
      })) ||
      movie.cast ||
      [],
    crew:
      movie.credits?.crew?.slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        job: c.job,
        department: c.department,
        profile_url: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
      })) ||
      movie.crew ||
      [],
  };
};

// 1. Fetch Trending Movies
const getTrendingMovies = async (page = 1) => {
  const cacheKey = `trending_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/trending/movie/day`, {
      params: { api_key: TMDB_API_KEY, page },
      timeout: 3000,
    });

    const formatted = {
      page: res.data.page,
      total_pages: res.data.total_pages,
      total_results: res.data.total_results,
      results: res.data.results.map(formatMovieDTO),
    };

    setCachedData(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn(
      "TMDB API request failed/unauthenticated. Returning formatted fallback trending movies:",
      error.message
    );
    const fallbackFormatted = {
      page: 1,
      total_pages: 1,
      total_results: FALLBACK_MOVIES.length,
      results: FALLBACK_MOVIES.map(formatMovieDTO),
    };
    return fallbackFormatted;
  }
};

// 2. Search Movies by Title
const searchMovies = async (query, page = 1) => {
  if (!query || query.trim() === "") return { page: 1, results: [] };
  const cacheKey = `search_${query.toLowerCase().trim()}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query, page },
      timeout: 3000,
    });

    const formatted = {
      page: res.data.page,
      total_pages: res.data.total_pages,
      results: res.data.results.map(formatMovieDTO),
    };

    setCachedData(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn("TMDB search request failed. Returning filtered fallback movies:", error.message);
    const filtered = FALLBACK_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
    return {
      page: 1,
      total_pages: 1,
      results: filtered.map(formatMovieDTO),
    };
  }
};

// 3. Get Single Movie Details
const getMovieDetails = async (movieId) => {
  const cacheKey = `movie_${movieId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "credits,videos,watch/providers,reviews",
      },
      timeout: 3000,
    });

    const formatted = formatMovieDTO(res.data);
    setCachedData(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn(
      `TMDB getMovieDetails failed for ${movieId}. Returning matched fallback:`,
      error.message
    );
    const found =
      FALLBACK_MOVIES.find((m) => String(m.id) === String(movieId)) || FALLBACK_MOVIES[0];
    return formatMovieDTO(found);
  }
};

// 4. Get Movie Genres
const getGenres = async () => {
  const cacheKey = "genres_list";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const res = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY },
      timeout: 3000,
    });

    setCachedData(cacheKey, res.data.genres);
    return res.data.genres;
  } catch (error) {
    console.warn("TMDB getGenres failed. Returning fallback genres:", error.message);
    return [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
      { id: 35, name: "Comedy" },
      { id: 18, name: "Drama" },
      { id: 878, name: "Sci-Fi" },
    ];
  }
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  getGenres,
  formatMovieDTO,
};

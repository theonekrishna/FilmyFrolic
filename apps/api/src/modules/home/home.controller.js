const filmyService = require("./home.filmydock.service");

// Home: only movies, limit 15
exports.getHomeMovies = async (req, res) => {
  try {
    const { Page = 1, limit = 15, featured = true } = req.query;

    const data = (await filmyService.getMovies({
      Page: Number(Page),
      limit: Number(limit),
      featured,
    })) || {
      success: true,
      data: [],
      page: 1,
      total: 0,
    };

    return res.status(200).json(data);
  } catch (err) {
    console.error("getHomeMovies error:", err.message);

    return res.status(200).json({
      success: true,
      data: [
        {
          id: 27205,
          title: "Inception",
          year: "2010",
          rating: "8.4",
          poster_url: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          backdrop_url: "https://image.tmdb.org/t/p/w780/8ZTVqvKDQ8emSGUEMjsR4yHAoaw.jpg",
          genres: ["Action", "Sci-Fi", "Adventure"],
          overview: "Cobb, a skilled thief who steals information from targets by entering their dreams.",
        },
        {
          id: 155,
          title: "The Dark Knight",
          year: "2008",
          rating: "8.5",
          poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          backdrop_url: "https://image.tmdb.org/t/p/w780/nMK2819TyZMo7RuvlTHr83Ym22E.jpg",
          genres: ["Action", "Crime", "Drama"],
          overview: "Batman raises the stakes in his war on crime.",
        },
        {
          id: 157336,
          title: "Interstellar",
          year: "2014",
          rating: "8.4",
          poster_url: "https://image.tmdb.org/t/p/w500/gEU2QniL6C8z19uVOtYnZ5UYj7d.jpg",
          backdrop_url: "https://image.tmdb.org/t/p/w780/pBRDqaYiSpviTXW1wEG9dG2943b.jpg",
          genres: ["Sci-Fi", "Drama"],
          overview: "Adventures of space explorers searching for a new home.",
        },
        {
          id: 680,
          title: "Pulp Fiction",
          year: "1994",
          rating: "8.5",
          poster_url: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
          backdrop_url: "https://image.tmdb.org/t/p/w780/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
          genres: ["Crime", "Drama"],
          overview: "Stories of hitmen and mobsters in Los Angeles.",
        },
      ],
      page: 1,
      total: 4,
    });
  }
};

// GET /api/home/movies/:id
exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;

    // basic validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }

    // call external API via service layer
    const data = await filmyService.getMovieById(id);

    // if upstream API returns empty/invalid response
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // return same response (proxy behavior)
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getMovieById error:", error?.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

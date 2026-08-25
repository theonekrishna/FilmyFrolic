const filmyService = require("./home.filmydock.service");

// Home: only movies, limit 15
exports.getHomeMovies = async (req, res) => {
  try {
    const { Page = 1, limit = 15, featured = true } = req.query;

    const data = await filmyService.getMovies({
      Page: Number(Page),
      limit: Number(limit),
      featured,
    });

    return res.status(200).json(data);
  } catch (err) {
    console.error("getHomeMovies error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Home API failed",
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

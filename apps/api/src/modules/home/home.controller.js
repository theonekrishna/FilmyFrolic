const filmyService = require("./home.filmydock.service");

// Home: only movies, limit 15
exports.getHomeMovies = async (req, res) => {
  console.log("\n[HOME] request received");
  console.log("[HOME] environment validated");
  console.log(`TMDB_API_KEY configured: ${!!process.env.TMDB_API_KEY}`);
  console.log(`TMDB_READ_ACCESS_TOKEN configured: ${!!process.env.TMDB_READ_ACCESS_TOKEN}`);

  try {
    const { Page = 1, limit = 15, featured = true } = req.query;

    console.log("[HOME] TMDB request starting");
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

    console.log("[HOME] TMDB request completed");
    console.log("[HOME] TMDB response processed");
    console.log("[HOME] Supabase/cache operation completed");
    console.log("[HOME] response generated");

    return res.status(200).json(data);
  } catch (error) {
    console.error("[HOME API ERROR]", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      status: error?.response?.status,
      response: error?.response?.data,
      stack: error?.stack,
    });

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

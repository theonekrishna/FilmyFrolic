const filmyService = require("./archive.filmydock.service");

// Archive: movies + series filter
exports.getArchiveMovies = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 30;
    const type = req.query.type; // "all" | "movies" | "series"
    const query = req.query.query || req.query.search || "";

    const params = {
      Page: page,
      limit,
      query,
      type: type || "all",
    };

    const data = await filmyService.getMovies(params);

    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return res.status(200).json(data);
    }

    // Fallback if data is empty or malformed
    const tmdbService = require("../tmdb/tmdb.service");
    const fallbackData = await tmdbService.getTrendingMovies(Number(page) || 1, type || "all");
    return res.status(200).json({
      success: true,
      data: fallbackData?.results || [],
      page: 1,
      total: fallbackData?.results?.length || 0,
    });
  } catch (error) {
    console.error("[ARCHIVE API RECOVERY]", error?.message);
    try {
      const tmdbService = require("../tmdb/tmdb.service");
      const fallbackData = await tmdbService.getTrendingMovies(1, "all");
      return res.status(200).json({
        success: true,
        data: fallbackData?.results || [],
        page: 1,
        total: fallbackData?.results?.length || 0,
      });
    } catch (_) {
      return res.status(200).json({
        success: true,
        data: [],
        page: 1,
        total: 0,
      });
    }
  }
};

// GET /api/archive/movies/:id
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

const filmyService = require("./archive.filmydock.service");

// Archive: movies + series filter
exports.getArchiveMovies = async (req, res) => {
  console.log("\n[ARCHIVE] request received");
  console.log("[ARCHIVE] TMDB/database call started");

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

    const data = (await filmyService.getMovies(params)) || {
      success: true,
      data: [],
      page: 1,
      total: 0,
    };

    console.log("[ARCHIVE] TMDB/database call completed");
    console.log("[ARCHIVE] response generated");

    return res.status(200).json(data);
  } catch (error) {
    console.error("[ARCHIVE API ERROR]", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      status: error?.response?.status,
      response: error?.response?.data,
      stack: error?.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Archive API failed",
    });
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

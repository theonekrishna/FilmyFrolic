const tmdbService = require("./tmdb.service");

// GET /api/tmdb/trending
exports.getTrending = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const data = await tmdbService.getTrendingMovies(page);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tmdb/search?query=Inception
exports.search = async (req, res, next) => {
  try {
    const { query, page } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter is required",
      });
    }
    const data = await tmdbService.searchMovies(query, Number(page) || 1);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tmdb/movie/:id
exports.getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie ID is required",
      });
    }
    const data = await tmdbService.getMovieDetails(id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tmdb/genres
exports.getGenres = async (req, res, next) => {
  try {
    const genres = await tmdbService.getGenres();
    return res.status(200).json({
      success: true,
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

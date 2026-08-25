const watchlistModel = require("./watchlist.model");

exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const data = await watchlistModel.getWatchlist(userId, page, limit);

    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movie_id } = req.body;

    const result = await watchlistModel.toggleWatchlist(userId, movie_id);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.isWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const isWatchlist = await watchlistModel.isWatchlist(userId, movieId);

    return res.json({
      success: true,
      is_watchlist: isWatchlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

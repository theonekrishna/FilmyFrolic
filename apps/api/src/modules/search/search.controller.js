const searchService = require("./search.service");

exports.search = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || req.query.search || "";
    if (!query || !query.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const results = await searchService.globalSearch(query);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("[globalSearch error]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Search operation failed",
    });
  }
};

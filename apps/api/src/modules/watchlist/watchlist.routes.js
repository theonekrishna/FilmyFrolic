const router = require("express").Router();
const controller = require("./watchlist.controller");
const { protect } = require("../../middlewares/auth.js");

router.use(protect);

router.get("/", controller.getWatchlist);
router.get("/is-watchlist/:movieId", controller.isWatchlist);
router.post("/toggle", controller.toggleWatchlist);
module.exports = router;

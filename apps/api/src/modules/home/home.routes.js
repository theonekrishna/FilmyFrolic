const router = require("express").Router();
const controller = require("./home.controller");

router.get("/movies", controller.getHomeMovies);
router.get("/movies/:id", controller.getMovieById);

module.exports = router;

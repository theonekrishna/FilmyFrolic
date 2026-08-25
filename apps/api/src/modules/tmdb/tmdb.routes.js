const express = require("express");
const router = express.Router();
const tmdbController = require("./tmdb.controller");

router.get("/trending", tmdbController.getTrending);
router.get("/search", tmdbController.search);
router.get("/movie/:id", tmdbController.getMovieDetails);
router.get("/genres", tmdbController.getGenres);

module.exports = router;

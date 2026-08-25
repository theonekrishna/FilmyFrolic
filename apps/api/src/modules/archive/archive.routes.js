const router = require("express").Router();
const controller = require("./archive.controller");

router.get("/", controller.getArchiveMovies);

module.exports = router;

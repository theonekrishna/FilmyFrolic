// ═══════════════════════════════════════════════════════════════════════════
// admin.entertainment.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const controller = require("./admin.entertainment.controllers");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");
const { upload } = require("./admin.entertainment.controllers");
// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

router.use(protect);
router.use(staffOnly);
router.use(loadUserRoleAndPermissions);

// ══════════════════════
// GAME ADMIN APIs
// ══════════════════════

router.get("/games", controller.getAllGames);

router.post("/games", controller.createGame);

router.put("/games/:id", controller.updateGame);

router.delete("/games/:id", controller.softDeleteGame);

// ══════════════════════
// QUESTION ADMIN APIs
// ══════════════════════

router.post(
  "/games/:game_id/questions",
  controller.handleUpload("media_url"),
  controller.addQuestion
);

router.put("/questions/:id", controller.handleUpload("media_url"), controller.updateQuestion);

router.delete("/questions/:id", controller.deleteQuestion);

// ══════════════════════
// GET SINGLE GAME WITH QUESTIONS
// ══════════════════════

router.get("/games/:id", controller.getSingleGame);

// ══════════════════════
// TOGGLE FEATURED
// ══════════════════════

router.patch("/games/:id/featured", controller.toggleFeatured);
// ══════════════════════
// TOGGLE STATUS
// ══════════════════════

router.patch("/games/:id/status", controller.toggleGameStatus);

router.get("/memes", controller.getAllMemes);

// ══════════════════════
// MEME STATUS UPDATE
// ══════════════════════

router.patch("/memes/:id/status", controller.updateMemeStatus);

module.exports = router;

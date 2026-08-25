const express = require("express");
const router = express.Router();

const {
  getAllGames,
  getSingleGame,

  getQuestionsByGame,

  submitGame,
  getGameResults,
  getGameStatus,

  getGameLeaderboard,
  getGlobalLeaderboard,
} = require("./game.controller");

const { protect } = require("../../middlewares/auth");

// ================= GAME =================

// 🌍 PUBLIC
router.get("/", getAllGames);
router.get("/:id", getSingleGame);

// ================= QUESTIONS =================

// 🌍 PUBLIC
router.get("/:game_id/questions", getQuestionsByGame);

// ================= RESULT (USER ONLY) =================

// 👤 AUTH USERS
router.post("/:game_id/submit", protect, submitGame);
router.get("/:game_id/results", protect, getGameResults);
router.get("/:game_id/status", protect, getGameStatus);

// ================= LEADERBOARD =================

// ⚠️ order matters (no conflict)
router.get("/leaderboard/global", getGlobalLeaderboard);
router.get("/:game_id/leaderboard", getGameLeaderboard);

module.exports = router;

const GameService = require("./game.service");
const multer = require("multer");
const NotificationService = require("../../services/notification.service");

// ================= MULTER =================
const storage = multer.memoryStorage();

const allowedExts = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "aac",
  "mpeg",
  "mp4",
  "mkv",
  "avi",
  "webm",
  "mov",
];

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("video/") ||
    allowedExts.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ================= GAME =================

const getAllGames = async (req, res) => {
  try {
    const data = await GameService.getAllGames();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSingleGame = async (req, res) => {
  try {
    const data = await GameService.getGameById(req.params.id);
    res.json({ success: true, data });
  } catch {
    res.status(404).json({ error: "Game not found" });
  }
};

const deleteGame = async (req, res) => {
  try {
    await GameService.deleteGame(req.params.id);
    res.json({ success: true, message: "Game deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= QUESTIONS =================

const addQuestion = async (req, res) => {
  try {
    let { question_text, options, correct_answer } = req.body;

    if (typeof options === "string") {
      options = JSON.parse(options);
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ error: "Exactly 4 options required" });
    }

    const answerIndex = parseInt(correct_answer);
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      return res.status(400).json({ error: "Correct answer must be 0-3" });
    }

    const limitReached = await GameService.checkQuestionLimit(req.params.game_id);
    if (limitReached) {
      return res.status(400).json({ error: "Max 10 questions allowed" });
    }

    // ================= MEDIA HANDLING =================
    let media_url = null;
    let question_type = "multiple_choice";

    if (req.file) {
      const uploadRes = await GameService.uploadMedia(req.file);
      media_url = uploadRes.publicUrl;
      const ext = uploadRes.extension;

      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
        question_type = "image";
      } else if (["mp3", "wav", "ogg", "m4a", "aac", "mpeg"].includes(ext)) {
        question_type = "audio";
      } else if (["mp4", "mkv", "avi", "webm", "mov"].includes(ext)) {
        question_type = "video";
      }
    }

    const data = await GameService.addQuestion({
      game_id: req.params.game_id,
      question_text,
      options,
      correct_answer: answerIndex,
      question_type,
      media_url,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getQuestionsByGame = async (req, res) => {
  try {
    const data = await GameService.getQuestionsByGame(req.params.game_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= RESULT =================

const submitGame = async (req, res) => {
  try {
    const result = await GameService.processSubmission(
      req.params.game_id,
      req.body.answers,
      req.user.id
    );

    // ── Notification: game achievement (>= 80%) ─────────────────
    try {
      if (result.percentage >= 80) {
        await NotificationService.createNotification({
          userId: req.user.id,
          title: "🌟 Quiz Champion!",
          message: `You scored ${result.score}/${result.total} (${result.percentage}%)! Amazing performance!`,
          type: "game_achievement",
          entityType: "game",
          entityId: req.params.game_id,
          actionUrl: `/games/${req.params.game_id}`,
          groupKey: `achievement:game:${req.params.game_id}:${req.user.id}`,
          icon: "Trophy",
          accent: "#f59e0b",
          priority: "low",
          metadata: { score: result.score, total: result.total, percentage: result.percentage },
        });
      }
    } catch (notifErr) {
      console.error("[game.submitGame] notification error:", notifErr.message);
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGameResults = async (req, res) => {
  try {
    const data = await GameService.getGameResults(req.params.game_id, req.user.id);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGameStatus = async (req, res) => {
  try {
    const data = await GameService.getGameStatus(req.params.game_id, req.user.id);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LEADERBOARD =================

const getGameLeaderboard = async (req, res) => {
  try {
    const data = await GameService.getGameLeaderboard(req.params.game_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGlobalLeaderboard = async (req, res) => {
  try {
    const data = await GameService.getGlobalLeaderboard();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE =================

const updateQuestion = async (req, res) => {
  try {
    const data = await GameService.updateQuestion(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await GameService.deleteQuestion(req.params.id);
    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= EXPORT =================

module.exports = {
  getAllGames,
  getSingleGame,
  deleteGame,

  addQuestion,
  getQuestionsByGame,

  submitGame,
  getGameResults,
  getGameStatus,

  getGameLeaderboard,
  getGlobalLeaderboard,

  updateQuestion,
  deleteQuestion,
};

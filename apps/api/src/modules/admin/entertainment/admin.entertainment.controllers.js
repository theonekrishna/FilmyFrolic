// ═══════════════════════════════════════════════════════════════════════════
// admin.entertainment.controllers.js
// ═══════════════════════════════════════════════════════════════════════════

const multer = require("multer");

const model = require("./admin.entertainment.models");

const { logAdminActivity } = require("../activeLog/adminActivityLogger");

// ══════════════════════
// MULTER
// ══════════════════════

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  // IMAGES
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",

  // AUDIO
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/aac",

  // VIDEO
  "video/mp4",
  "video/x-matroska",
  "video/x-msvideo",
  "video/webm",
  "video/quicktime",
];

const allowedExts = [
  // IMAGES
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",

  // AUDIO
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "aac",
  "mpeg",

  // VIDEO
  "mp4",
  "mkv",
  "avi",
  "webm",
  "mov",
];

const fileFilter = (req, file, cb) => {
  try {
    const ext = file.originalname.split(".").pop().toLowerCase();

    const mimeAllowed = allowedMimeTypes.includes(file.mimetype);

    const extAllowed = allowedExts.includes(ext);

    if (mimeAllowed && extAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  } catch (err) {
    cb(new Error("File validation failed"), false);
  }
};

exports.upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ══════════════════════
// HANDLE MULTER ERRORS
// ══════════════════════

exports.handleUpload = (fieldName) => {
  return (req, res, next) => {
    const uploader = exports.upload.single(fieldName);

    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      next();
    });
  };
};

// ══════════════════════
// GET ALL GAMES
// ══════════════════════

exports.getAllGames = async (req, res) => {
  try {
    const search = req.query.search || "";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const games = await model.getAllGames({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...games,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// CREATE GAME
// ══════════════════════

exports.createGame = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_create) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create content",
      });
    }
    const { title, description, difficulty, featured, category } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!difficulty?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Difficulty is required",
      });
    }

    const game = await model.createGame({
      title: title.trim(),
      description: description?.trim() || null,
      difficulty,
      featured,
      category,
      user_id: req.user.id,
    });
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "CREATE",

      entityType: "game",
      entityId: game.id,
      entityName: game.title,

      icon: "Gamepad2",
      iconColor: "green",

      description: `Created game "${game.title}"`,
    });
    return res.status(201).json({
      success: true,
      data: game,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// UPDATE GAME
// ══════════════════════

exports.updateGame = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const updates = {
      ...req.body,
    };

    if (updates.title) {
      updates.title = updates.title.trim();
    }

    if (updates.description) {
      updates.description = updates.description.trim();
    }

    const game = await model.updateGame(req.params.id, updates);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "UPDATE",

      entityType: "game",
      entityId: game.id,
      entityName: game.title,

      icon: "Pencil",
      iconColor: "orange",

      description: `Updated game "${game.title}"`,
    });
    return res.status(200).json({
      success: true,
      data: game,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// DELETE GAME
// ══════════════════════

exports.deleteGame = async (req, res) => {
  try {
    await model.deleteGame(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// ADD QUESTION
// ══════════════════════

exports.addQuestion = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_create) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create content",
      });
    }
    let { question_text, options, correct_answer } = req.body;

    // QUESTION TEXT VALIDATION
    if (!question_text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required",
      });
    }

    // OPTIONS PARSE
    if (typeof options === "string") {
      try {
        options = JSON.parse(options);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid options format",
        });
      }
    }

    // OPTIONS VALIDATION
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Exactly 4 options required",
      });
    }

    // EMPTY OPTION CHECK
    const hasEmptyOption = options.some((option) => !String(option).trim());

    if (hasEmptyOption) {
      return res.status(400).json({
        success: false,
        message: "Options cannot be empty",
      });
    }

    // CORRECT ANSWER VALIDATION
    const answerIndex = parseInt(correct_answer);

    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      return res.status(400).json({
        success: false,
        message: "Correct answer must be between 0-3",
      });
    }

    // QUESTION LIMIT
    const limitReached = await model.checkQuestionLimit(req.params.game_id);

    if (limitReached) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 questions allowed",
      });
    }

    let media_url = null;

    let question_type = "multiple_choice";

    // MEDIA UPLOAD
    if (req.file) {
      const uploadRes = await model.uploadMedia(req.file);

      media_url = uploadRes.publicUrl;

      const ext = uploadRes.extension;

      // IMAGE
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        question_type = "image";
      }

      // AUDIO
      else if (["mp3", "wav", "ogg", "m4a", "aac", "mpeg"].includes(ext)) {
        question_type = "audio";
      }

      // VIDEO
      else if (["mp4", "mkv", "avi", "webm", "mov"].includes(ext)) {
        question_type = "video";
      }
    }

    const question = await model.addQuestion({
      game_id: req.params.game_id,

      question_text: question_text.trim(),

      options: options.map((item) => String(item).trim()),

      correct_answer: answerIndex,

      question_type,

      media_url,
    });
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "CREATE",

      entityType: "question",
      entityId: question.id,

      icon: "CirclePlus",
      iconColor: "green",

      description: `Added question to game`,
    });
    return res.status(201).json({
      success: true,
      data: question,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// UPDATE QUESTION
// ══════════════════════

exports.updateQuestion = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    let { question_text, options, correct_answer } = req.body;

    const updates = {};

    // QUESTION TEXT
    if (question_text !== undefined) {
      if (!question_text.trim()) {
        return res.status(400).json({
          success: false,
          message: "Question text cannot be empty",
        });
      }

      updates.question_text = question_text.trim();
    }

    // OPTIONS
    if (options !== undefined) {
      if (typeof options === "string") {
        try {
          options = JSON.parse(options);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid options format",
          });
        }
      }

      if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Exactly 4 options required",
        });
      }

      const hasEmptyOption = options.some((option) => !String(option).trim());

      if (hasEmptyOption) {
        return res.status(400).json({
          success: false,
          message: "Options cannot be empty",
        });
      }

      updates.options = options.map((item) => String(item).trim());
    }

    // CORRECT ANSWER
    if (correct_answer !== undefined) {
      const answerIndex = parseInt(correct_answer);

      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must be between 0-3",
        });
      }

      updates.correct_answer = answerIndex;
    }

    // MEDIA UPDATE
    if (req.file) {
      const uploadRes = await model.uploadMedia(req.file);

      updates.media_url = uploadRes.publicUrl;

      const ext = uploadRes.extension;

      // IMAGE
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        updates.question_type = "image";
      }

      // AUDIO
      else if (["mp3", "wav", "ogg", "m4a", "aac", "mpeg"].includes(ext)) {
        updates.question_type = "audio";
      }

      // VIDEO
      else if (["mp4", "mkv", "avi", "webm", "mov"].includes(ext)) {
        updates.question_type = "video";
      }
    }

    const question = await model.updateQuestion(req.params.id, updates);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "UPDATE",

      entityType: "question",
      entityId: question.id,

      icon: "Pencil",
      iconColor: "orange",

      description: `Updated game question`,
    });
    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// DELETE QUESTION
// ══════════════════════

exports.deleteQuestion = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const question = await model.deleteQuestion(req.params.id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "DELETE",

      entityType: "question",
      entityId: question.id,

      icon: "Trash2",
      iconColor: "red",

      description: `Deleted game question`,
    });
    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// GET SINGLE GAME
// ══════════════════════

exports.getSingleGame = async (req, res) => {
  try {
    const game = await model.getSingleGame(req.params.id);

    return res.status(200).json({
      success: true,
      data: game,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// TOGGLE FEATURED
// ══════════════════════

exports.toggleFeatured = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const game = await model.toggleFeatured(req.params.id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "UPDATE",

      entityType: "game",
      entityId: game.id,
      entityName: game.title,

      icon: "Star",
      iconColor: "yellow",

      description: game.featured
        ? `Featured game "${game.title}"`
        : `Removed featured status from "${game.title}"`,
    });
    return res.status(200).json({
      success: true,

      message: game.featured ? "Game featured successfully" : "Game unfeatured successfully",

      data: game,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// TOGGLE GAME STATUS
// ══════════════════════

exports.toggleGameStatus = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const game = await model.toggleGameStatus(req.params.id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "UPDATE",

      entityType: "game",
      entityId: game.id,
      entityName: game.title,

      icon: "Power",
      iconColor: "blue",

      description: game.status ? `Enabled game "${game.title}"` : `Disabled game "${game.title}"`,
    });
    return res.status(200).json({
      success: true,

      message: game.status ? "Game enabled successfully" : "Game disabled successfully",

      data: game,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// SOFT DELETE GAME
// ══════════════════════

exports.softDeleteGame = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const game = await model.softDeleteGame(req.params.id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "DELETE",

      entityType: "game",
      entityId: game.id,
      entityName: game.title,

      icon: "Trash2",
      iconColor: "red",

      description: `Deleted game "${game.title}"`,
    });
    return res.status(200).json({
      success: true,
      message: "Game deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// GET ALL MEMES
// ══════════════════════

exports.getAllMemes = async (req, res) => {
  try {
    const search = req.query.search || "";

    const status = req.query.status || "";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const memes = await model.getAllMemes({
      search,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...memes,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// UPDATE MEME STATUS
// ══════════════════════

exports.updateMemeStatus = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    const { status } = req.body || {};

    const allowedStatus = ["pending", "approved", "rejected"];

    // STATUS REQUIRED
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // STATUS VALIDATION
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, approved or rejected",
      });
    }

    const meme = await model.updateMemeStatus({
      meme_id: req.params.id,

      status,

      admin_id: req.user.id,
    });
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "entertainment",
      action: "UPDATE",

      entityType: "meme",
      entityId: meme.id,
      entityName: meme.title,

      icon: status === "approved" ? "BadgeCheck" : "XCircle",

      iconColor: status === "approved" ? "green" : "red",

      description: `Meme "${meme.title}" ${status}`,
    });
    return res.status(200).json({
      success: true,
      message: `Meme ${status} successfully`,
      data: meme,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

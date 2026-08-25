const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../../middlewares/auth");
const { upload } = require("./editProfile.upload");

const {
  getMyProfile,
  getProfile,
  updateInfo,
  updateAvatarColor,
  uploadAvatar,
  getAllGenres,
  getMyGenres,
  updateMyGenres,
} = require("./editProfile.controller");
const { blockCheckMiddleware } = require("../../middlewares/blockCheck");

router.get("/test", (req, res) => {
  res.json({ success: true, message: "profile router working" });
});

// ─── GENRES (public) ─────────────────────────── most specific first
router.get("/genres", getAllGenres);

// ─── MY PROFILE & SETTINGS ───────────────────── /me/* before /me
router.get("/me/genres", protect, getMyGenres);
router.put("/me/genres", protect, updateMyGenres);
router.patch("/me/info", protect, updateInfo);
router.patch("/me/avatar/color", protect, updateAvatarColor);
router.patch("/me/avatar/upload", protect, upload.single("avatar"), uploadAvatar);

// ─── MY PROFILE BASE ─────────────────────────── /me after /me/*
router.get("/me", protect, getMyProfile);

// ─── PUBLIC PROFILE ──────────────────────────── /:username always last
router.get("/:username", optionalAuth, getProfile);
// ─── MULTER ERROR HANDLER ────────────────────────────────────
// FIX: must be registered AFTER routes, and needs 4 params to be
// recognised by Express as an error-handling middleware.
router.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 2MB",
    });
  }
  // ── ADD THIS ──
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: 'Unexpected field. Use "avatar" as the form-data key',
    });
  }
  if (err.message === "Only JPEG, PNG and WebP images are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
});

module.exports = router;

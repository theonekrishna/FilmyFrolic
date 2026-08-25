const express = require("express");
const multer = require("multer"); // 1. Import multer
const {
  validateCreateGossip,
  validateReaction,
  validateUUID,
  validateGossipId,
  validateCommentId,
} = require("./gossip.validation.js");
const {
  getGossips,
  getBreakingNow,
  getTrendingTags,
  getBookmarked,
  createGossip,
  reactToGossip,
  bookmarkGossip,
  addComment,
  getComments,
  deleteComment,
  getGossipById,
  editComment,
  deleteGossip,
  getMyGossips,
  editGossip,
} = require("./gossip.controller.js");
const { protect } = require("../../middlewares/auth");

const router = express.Router();

function normalizeGossipPayload(req, res, next) {
  req.body = req.body || {};

  const { tags } = req.body;

  if (tags !== undefined) {
    if (typeof tags === "string") {
      try {
        req.body.tags = JSON.parse(tags);
      } catch {
        return res.status(400).json({ message: "Invalid tags format" });
      }
    }
  }
  next();
}

// 2. Configure multer to use memory storage (essential for Supabase SDK)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit 5MB
});

// ── GET routes ────────────────────────────────────────────────
router.get("/", getGossips);
router.get("/breaking", getBreakingNow);
router.get("/trending-tags", getTrendingTags);
router.get("/bookmarked", protect, getBookmarked);
router.get("/my", protect, getMyGossips);
router.get("/:id", validateUUID, getGossipById);

// ── POST routes ───────────────────────────────────────────────

/**
 * Update: Added upload.single("image")
 * This looks for a field named 'image' in the form-data.
 * Note: If you use multer, validation should come AFTER upload
 * because req.body is only populated once the file is parsed.
 */
router.post(
  "/",
  protect,
  upload.single("image"),
  normalizeGossipPayload,
  validateCreateGossip,
  createGossip
);

router.post("/:id/react", protect, validateUUID, validateReaction, reactToGossip);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  normalizeGossipPayload,
  validateGossipId,
  editGossip
);
router.post("/:id/bookmark", protect, validateUUID, bookmarkGossip);
router.delete("/:id", protect, validateUUID, deleteGossip);
// ── COMMENT routes ───────────────────────────────────────────

// Delete comment
router.get("/:id/comments", validateGossipId, getComments);
router.post("/:id/comment", protect, validateGossipId, addComment);
router.put("/comment/:commentId", protect, validateCommentId, editComment);
router.delete("/comment/:commentId", protect, validateCommentId, deleteComment);

module.exports = router;

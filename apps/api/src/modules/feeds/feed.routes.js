const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../../middlewares/auth.js");

const {
  getFeedPosts,
  createPost,
  updatePost,
  deletePost,
  commentOnPost,
  updateComment,
  deleteComment,
  handleReaction,
  savePost,
  getSavedPosts,
  getOneFeedPosts,
  getPostComments,
  getHotFeeds,
  getPopularFeeds,
  getMostCommentedFeeds,
} = require("./feed.controller");

/**
 * FEED LISTS
 */
router.get("/", optionalAuth, getFeedPosts);
router.get("/hot", getHotFeeds);
router.get("/popular", getPopularFeeds);
router.get("/most-commented", getMostCommentedFeeds);
/**
 * POST CRUD
 */
router.post("/", protect, createPost);

/**
 * SAVED POSTS
 */
router.get("/saved", protect, getSavedPosts);

/**
 * COMMENTS
 */
router.get("/:id/comments", getPostComments);
router.post("/:id/comment", protect, commentOnPost);

/**
 * COMMENT ACTIONS
 */
router.put("/comments/:commentId", protect, updateComment);
router.delete("/comments/:commentId", protect, deleteComment);

/**
 * REACTIONS
 */
router.post("/:id/react", protect, handleReaction);

/**
 * SAVE / UNSAVE
 */
router.post("/:id/save", protect, savePost);

/**
 * SINGLE POST
 */
router.get("/:id", getOneFeedPosts);

router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

module.exports = router;

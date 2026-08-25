const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
  deleteMessage,
  markConversationRead,
  searchUsers,
  getSuggested,
} = require("./messages.controller");

const { protect } = require("../../middlewares/auth");
const uploadMessageMedia = require("../../middlewares/uploadMessageMedia");

router.get("/test", protect, (req, res) => {
  res.json({ user: req.user });
});

router.post("/", protect, uploadMessageMedia, sendMessage);
router.get("/search", protect, searchUsers);
router.get("/suggested", protect, getSuggested);
router.get("/inbox", protect, getInbox);
router.get("/:userId", protect, getConversation);
router.patch("/:userId/read-all", protect, markConversationRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteMessage);

module.exports = router;

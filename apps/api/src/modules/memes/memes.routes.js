const express = require("express");
const router = express.Router();
const controller = require("./memes.controller");

// remove TEST_USER_ID middleware ❌

const { protect } = require("../../middlewares/auth");

const dummyRes = {
  status: () => ({
    json: () => {},
  }),
};

const optionalProtect = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  return protect(req, dummyRes, next);
};

// Sidebar (can stay public)
router.get("/trending-tags", controller.getTrendingTags);
router.get("/meme-of-the-week", controller.getMemeOfTheWeek);
router.get("/top-memers", controller.getTopMemers);

// Feed
router.get("/", optionalProtect, controller.getAllMemes);
router.get("/:id", optionalProtect, controller.getMemeById);
router.post("/", protect, controller.createMeme);
router.put("/:id", protect, controller.updateMeme);
router.delete("/:id", protect, controller.deleteMeme);

// Upload
router.post("/upload-image", protect, controller.uploadImage);

// Interactions (must be auth)
router.post("/:id/upvote", protect, controller.toggleUpvote);
router.post("/:id/save", protect, controller.toggleSave);
router.post("/:id/react", protect, controller.setReaction);
router.post("/:id/share", protect, controller.incrementShare);

// Comments
router.get("/:id/comments", optionalProtect, controller.getComments);
router.post("/:id/comments", protect, controller.addComment);
router.delete("/:id/comments/:commentId", protect, controller.deleteComment);

module.exports = router;

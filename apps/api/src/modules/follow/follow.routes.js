const express = require("express");
const router = express.Router();
const FollowController = require("./follow.controller");
const { protect } = require("../../middlewares/auth");

// REMOVED: Follow Permission section has been removed from the application.
// Follow permission settings (must be before /:userId routes to avoid conflicts)
// router.get('/permission',              protect, FollowController.getFollowPermission);
// router.patch('/permission',            protect, FollowController.updateFollowPermission);

// Follow actions
router.post("/:userId", protect, FollowController.follow);
router.delete("/:userId", protect, FollowController.unfollow);
router.get("/:userId/followers", protect, FollowController.getFollowers);
router.get("/:userId/following", protect, FollowController.getFollowing);
router.get("/:userId/counts", FollowController.getCounts);
router.get("/:userId/is-following", protect, FollowController.checkIsFollowing);

module.exports = router;

const FollowModel = require("./follow.model");
const { isBlocked } = require("../../middlewares/blockCheck");

const follow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(422).json({ success: false, message: "You cannot follow yourself" });
    }
    const blocked = await isBlocked(followerId, followingId);
    if (blocked) {
      return res.status(403).json({ success: false, message: "Cannot follow this user" });
    }

    const data = await FollowModel.followUser(followerId, followingId);

    return res.status(201).json({ success: true, data });
  } catch (err) {
    if (err.code === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.code === "FOLLOW_NOT_ALLOWED") {
      return res.status(403).json({ success: false, message: err.message });
    }
    if (err.code === "ALREADY_FOLLOWING") {
      return res.status(409).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

const unfollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    await FollowModel.unfollowUser(followerId, followingId);
    return res.status(200).json({ success: true, message: "Unfollowed successfully" });
  } catch (err) {
    if (err.code === "NOT_FOLLOWING") {
      return res.status(404).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await FollowModel.getFollowers(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await FollowModel.getFollowing(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCounts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = await FollowModel.getCounts(userId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const checkIsFollowing = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await FollowModel.isFollowing(followerId, followingId);
    return res.status(200).json({ success: true, isFollowing: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// REMOVED: Follow Permission feature has been removed from the application.
// const getFollowPermission = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const permission = await FollowModel.getFollowPermission(userId);
//     return res.status(200).json({ success: true, permission });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// const updateFollowPermission = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { permission } = req.body;
//     const valid = ['everyone', 'friends_of_friends', 'no_one'];
//     if (!valid.includes(permission)) {
//       return res.status(400).json({ success: false, message: 'Invalid permission value' });
//     }
//     const data = await FollowModel.updateFollowPermission(userId, permission);
//     return res.status(200).json({ success: true, data });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

module.exports = {
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  getCounts,
  checkIsFollowing,
  // REMOVED: Follow Permission feature removed
  // getFollowPermission,
  // updateFollowPermission,
};

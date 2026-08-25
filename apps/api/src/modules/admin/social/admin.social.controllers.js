// ═══════════════════════════════════════════════════════════════════════════
// admin.social.controllers.js
// ═══════════════════════════════════════════════════════════════════════════

const model = require("./admin.social.models");

const { logAdminActivity } = require("../activeLog/adminActivityLogger");
// ══════════════════════
// GET ALL COMMUNITIES
// ══════════════════════
exports.getAllCommunities = async (req, res) => {
  try {
    const search = req.query.search || "";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const communities = await model.getAllCommunities({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...communities,
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
// TOGGLE VERIFY COMMUNITY
// ══════════════════════
exports.toggleVerifyCommunity = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to verify communities",
      });
    }
    const { communityId } = req.params;

    const updatedCommunity = await model.toggleVerifyCommunity(communityId);

    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Communities",
      action: updatedCommunity.verified ? "VERIFY_COMMUNITY" : "UNVERIFY_COMMUNITY",

      entityType: "Community",
      entityId: updatedCommunity.id,
      entityName: updatedCommunity.name,

      icon: updatedCommunity.verified ? "shield-check" : "shield-x",
      iconColor: updatedCommunity.verified ? "success" : "warning",

      description: `${req.user.name} ${
        updatedCommunity.verified ? "verified" : "unverified"
      } community "${updatedCommunity.name}"`,
    });
    return res.status(200).json({
      success: true,
      message: `Community ${updatedCommunity.verified ? "verified" : "unverified"} successfully.`,

      data: updatedCommunity,
    });
  } catch (err) {
    console.error("TOGGLE VERIFY COMMUNITY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// TOGGLE SUSPEND COMMUNITY
// ══════════════════════
exports.toggleSuspendCommunity = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to verify communities",
      });
    }
    const { communityId } = req.params;

    const updatedCommunity = await model.toggleSuspendCommunity(communityId);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Communities",
      action: updatedCommunity.status ? "ACTIVATE_COMMUNITY" : "SUSPEND_COMMUNITY",

      entityType: "Community",
      entityId: updatedCommunity.id,
      entityName: updatedCommunity.name,

      icon: updatedCommunity.status ? "shield-check" : "shield-x",

      iconColor: updatedCommunity.status ? "success" : "danger",

      description: `${req.user.name} ${
        updatedCommunity.status ? "activated" : "suspended"
      } community "${updatedCommunity.name}"`,
    });
    return res.status(200).json({
      success: true,

      message: `Community ${updatedCommunity.status ? "activated" : "suspended"} successfully.`,

      data: updatedCommunity,
    });
  } catch (err) {
    console.error("TOGGLE SUSPEND COMMUNITY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// GET ALL FEEDS
// ══════════════════════
exports.getAllFeeds = async (req, res) => {
  try {
    const search = req.query.search || "";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const feeds = await model.getAllFeeds({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...feeds,
    });
  } catch (err) {
    console.error("GET ALL FEEDS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// REMOVE FEED (SOFT DELETE)
// ══════════════════════
exports.removeFeed = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to remove feeds",
      });
    }
    const { feedId } = req.params;

    const deletedFeed = await model.removeFeed(feedId);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Feeds",
      action: "REMOVE_FEED",

      entityType: "Feed",
      entityId: deletedFeed.id,
      entityName: `Feed ${deletedFeed.id}`,

      icon: "trash2",
      iconColor: "danger",

      description: `${req.user.name} removed feed ${deletedFeed.id}`,
    });
    return res.status(200).json({
      success: true,

      message: "Feed removed successfully.",

      data: deletedFeed,
    });
  } catch (err) {
    console.error("REMOVE FEED ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// GET FEED DETAILS
// ══════════════════════
exports.getFeedDetails = async (req, res) => {
  try {
    const { feedId } = req.params;

    const feed = await model.getFeedDetails(feedId);

    return res.status(200).json({
      success: true,
      data: feed,
    });
  } catch (err) {
    console.error("GET FEED DETAILS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// GET ALL ROOMS
// ══════════════════════
exports.getAllRooms = async (req, res) => {
  try {
    const search = req.query.search || "";

    const status = req.query.status || "all";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const rooms = await model.getAllRooms({
      search,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...rooms,
    });
  } catch (err) {
    console.error("GET ALL ROOMS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// CLOSE ROOM
// ══════════════════════
exports.closeRoom = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to close rooms",
      });
    }
    const { roomId } = req.params;

    const room = await model.closeRoom(roomId);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Rooms",
      action: "CLOSE_ROOM",

      entityType: "Room",
      entityId: room.id,
      entityName: room.title,

      icon: "lock",
      iconColor: "danger",

      description: `${req.user.name} closed room "${room.title}"`,
    });
    return res.status(200).json({
      success: true,

      message: "Room closed successfully.",

      data: room,
    });
  } catch (err) {
    console.error("CLOSE ROOM ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ══════════════════════
// TOGGLE FEATURED ROOM
// ══════════════════════
exports.toggleFeaturedRoom = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to feature rooms",
      });
    }
    const { roomId } = req.params;

    const room = await model.toggleFeaturedRoom(roomId);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Rooms",
      action: room.featured ? "FEATURE_ROOM" : "UNFEATURE_ROOM",

      entityType: "Room",
      entityId: room.id,
      entityName: room.title,

      icon: room.featured ? "star" : "star-off",

      iconColor: room.featured ? "warning" : "secondary",

      description: `${req.user.name} ${
        room.featured ? "featured" : "unfeatured"
      } room "${room.title}"`,
    });
    return res.status(200).json({
      success: true,

      message: `Room ${room.featured ? "featured" : "unfeatured"} successfully.`,

      data: room,
    });
  } catch (err) {
    console.error("TOGGLE FEATURED ROOM ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

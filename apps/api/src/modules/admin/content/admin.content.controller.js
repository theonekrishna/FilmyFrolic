// ═══════════════════════════════════════════════════════════════════════════
// admin.content.controller.js
// ═══════════════════════════════════════════════════════════════════════════

const model = require("./admin.content.model");
const { logAdminActivity } = require("../activeLog/adminActivityLogger");
// ═══════════════════════════════════════════════════════════════════════════
// GET ALL GOSSIPS
// ═══════════════════════════════════════════════════════════════════════════

exports.getAllGossips = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const result = await model.getAllGossips({
      page: Number(page),
      limit: Number(limit),
      search,
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      message: "Gossips fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE PUBLISH STATUS
// ═══════════════════════════════════════════════════════════════════════════

exports.togglePublishStatus = async (req, res, next) => {
  try {
    // PERMISSION CHECK
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to publish or unpublish gossips",
      });
    }

    const { id } = req.params;

    const data = await model.togglePublishStatus(id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "content",
      action: "UPDATE",

      entityType: "gossip",
      entityId: data.id,
      entityName: data.headline,

      icon: "Eye",
      iconColor: "blue",

      description: `${data.is_published ? "Published" : "Hidden"} gossip "${data.headline}"`,
    });
    return res.status(200).json({
      success: true,
      message: `Gossip ${data.is_published ? "published" : "hidden"} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE VERIFY STATUS
// ═══════════════════════════════════════════════════════════════════════════

exports.toggleVerifyGossip = async (req, res, next) => {
  try {
    // PERMISSION CHECK
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to verify gossips",
      });
    }

    const { id } = req.params;

    const data = await model.toggleVerifyGossip(id);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "content",
      action: "UPDATE",

      entityType: "gossip",
      entityId: data.id,
      entityName: data.headline,

      icon: "BadgeCheck",
      iconColor: "green",

      description: `${data.verified ? "Verified" : "Unverified"} gossip "${data.headline}"`,
    });
    return res.status(200).json({
      success: true,
      message: `Gossip ${data.verified ? "verified" : "unverified"} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// EDIT GOSSIP
// ═══════════════════════════════════════════════════════════════════════════

exports.editGossip = async (req, res, next) => {
  try {
    // PERMISSION CHECK
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit gossips",
      });
    }

    const { id } = req.params;

    const payload = {};

    // HEADLINE
    if (req.body.headline !== undefined) {
      payload.headline = req.body.headline;
    }

    // EXCERPT
    if (req.body.excerpt !== undefined) {
      payload.excerpt = req.body.excerpt;
    }

    // SOURCE
    if (req.body.source !== undefined) {
      payload.source = req.body.source;
    }

    // CATEGORY
    if (req.body.category !== undefined) {
      payload.category = req.body.category;
    }

    // VERIFIED
    if (req.body.verified !== undefined) {
      payload.verified = req.body.verified === true || req.body.verified === "true";
    }

    // IS PUBLISHED
    if (req.body.is_published !== undefined) {
      payload.is_published = req.body.is_published === true || req.body.is_published === "true";
    }

    // TAGS
    if (req.body.tags !== undefined) {
      payload.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(",").map((tag) => tag.trim());
    }

    const data = await model.editGossip(id, payload, req.file);

    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "content",
      action: "UPDATE",

      entityType: "gossip",
      entityId: data.id,
      entityName: data.headline,

      icon: "Pencil",
      iconColor: "orange",

      description: `Edited gossip "${data.headline}"`,
    });

    return res.status(200).json({
      success: true,
      message: "Gossip updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DELETE GOSSIP
// ═══════════════════════════════════════════════════════════════════════════

exports.deleteGossip = async (req, res, next) => {
  try {
    // PERMISSION CHECK
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete gossips",
      });
    }

    const { id } = req.params;

    const deletedData = await model.deleteGossip(id);

    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "content",
      action: "DELETE",

      entityType: "gossip",
      entityId: deletedData.id,
      entityName: deletedData.headline,

      icon: "Trash2",
      iconColor: "red",

      description: `Deleted gossip "${deletedData.headline}"`,
    });

    return res.status(200).json({
      success: true,
      message: "Gossip deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

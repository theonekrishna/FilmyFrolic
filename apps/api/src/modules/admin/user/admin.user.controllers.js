// ═══════════════════════════════════════════════════════════════════════════
// admin.user.controllers.js
// ═══════════════════════════════════════════════════════════════════════════

const model = require("./admin.user.models");

const { logAdminActivity } = require("../activeLog/adminActivityLogger");
// ═══════════════════════════════════════
// GET ALL USERS
// ═══════════════════════════════════════

exports.getAllUsers = async (req, res) => {
  try {
    // RBAC

    // SEARCH
    const search = req.query.search || "";

    // FILTERS
    const role = req.query.role || "all";

    const status = req.query.status || "all";

    // PAGINATION
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    // MODEL
    const users = await model.getAllUsers({
      search,

      role,

      status,

      page,

      limit,
    });

    // RESPONSE
    return res.status(200).json({
      success: true,
      ...users,
    });
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch users",
    });
  }
};

// ═══════════════════════════════════════
// CHANGE USER ROLE
// ═══════════════════════════════════════

exports.changeUserRole = async (req, res) => {
  try {
    // ═══════════════════════════════════════
    // SAFE PERMISSION CHECK (prevents crash)
    // ═══════════════════════════════════════

    const canManageUsers =
      req.user && req.user.permissions && req.user.permissions.can_manage_users;

    if (!canManageUsers) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage users",
      });
    }

    // ═══════════════════════════════════════
    // INPUTS
    // ═══════════════════════════════════════

    const { userId } = req.params;
    const { role } = req.body;

    // VALIDATION
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // ═══════════════════════════════════════
    // PREVENT SELF ROLE CHANGE
    // ═══════════════════════════════════════

    if (String(req.user.id) === String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    // ═══════════════════════════════════════
    // CALL MODEL
    // ═══════════════════════════════════════

    const updatedUser = await model.changeUserRole({
      userId,
      role,
      currentUserRole: req.user.role,
    });
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "User Management",
      action: "CHANGE_ROLE",

      entityType: "User",
      entityId: updatedUser.id,
      entityName: updatedUser.name,

      icon: "ShieldCheck",
      iconColor: "primary",

      description: `${req.user.name} changed ${updatedUser.name}'s role from ${updatedUser.old_role} to ${updatedUser.new_role}`,
    });
    // ═══════════════════════════════════════
    // SUCCESS RESPONSE
    // ═══════════════════════════════════════

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("CHANGE USER ROLE ERROR:", err);

    // ═══════════════════════════════════════
    // SAFE ERROR RESPONSE (production-safe)
    // ═══════════════════════════════════════

    let statusCode = 500;
    let message = "Something went wrong while updating role";

    if (err?.statusCode) {
      statusCode = err.statusCode;
      message = err.message;
    } else {
      // fallback classification (optional safety layer)
      if (err.message?.includes("not found")) statusCode = 404;
      if (err.message?.includes("already has")) statusCode = 409;
      if (err.message?.includes("permission")) statusCode = 403;
    }

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE SUSPEND USER
// ═══════════════════════════════════════

exports.toggleSuspendUser = async (req, res) => {
  try {
    // RBAC
    if (!req.user.permissions.can_manage_users) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to suspend users",
      });
    }

    // PARAMS
    const { userId } = req.params;

    // PREVENT SELF SUSPEND
    if (req.user.id === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot suspend your own account",
      });
    }

    // MODEL
    const result = await model.toggleSuspendUser(userId);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "User Management",
      action: result.user.is_suspended ? "SUSPEND_USER" : "RESTORE_USER",

      entityType: "User",
      entityId: result.user.id,
      entityName: result.user.name,

      icon: result.user.is_suspended ? "UserX" : "UserCheck",

      iconColor: result.user.is_suspended ? "warning" : "success",

      description: result.user.is_suspended
        ? `${req.user.name} suspended user ${result.user.name}`
        : `${req.user.name} restored user ${result.user.name}`,
    });
    // RESPONSE
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (err) {
    console.error("TOGGLE SUSPEND ERROR:", err);

    const statusCode = err.message.includes("not found")
      ? 404
      : err.message.includes("cannot")
        ? 403
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to suspend user",
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE BAN USER
// ═══════════════════════════════════════

exports.toggleBanUser = async (req, res) => {
  try {
    // RBAC
    if (!req.user.permissions.can_manage_users) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to ban users",
      });
    }

    // PARAMS
    const { userId } = req.params;

    // PREVENT SELF BAN
    if (req.user.id === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot ban your own account",
      });
    }

    // MODEL
    const result = await model.toggleBanUser(userId);

    // RESPONSE
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.user,
    });
  } catch (err) {
    console.error("TOGGLE BAN ERROR:", err);

    const statusCode = err.message.includes("not found")
      ? 404
      : err.message.includes("cannot")
        ? 403
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to ban user",
    });
  }
};

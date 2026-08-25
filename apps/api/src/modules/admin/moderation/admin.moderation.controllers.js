// ═══════════════════════════════════════════════════════════════════════════
// admin.moderation.controllers.js
// ═══════════════════════════════════════════════════════════════════════════

const model = require("./admin.moderation.models");

const { logAdminActivity } = require("../activeLog/adminActivityLogger");
const NotificationService = require("../../../services/notification.service");
// ═══════════════════════════════════════════════════════════════════════════
// GET ALL REPORTS
// ═══════════════════════════════════════════════════════════════════════════

exports.getAllReports = async (req, res) => {
  try {
    const search = req.query.search || "";

    const status = req.query.status || "all";

    const category = req.query.category || "all";

    const moduleType = req.query.module_type || "all";

    const sortBy = req.query.sortBy || "latest";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const reports = await model.getAllReports({
      search,
      status,
      category,
      moduleType,
      sortBy,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...reports,
    });
  } catch (err) {
    console.error("GET REPORTS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET MODERATION STATS
// ═══════════════════════════════════════════════════════════════════════════

exports.getModerationStats = async (req, res) => {
  try {
    const stats = await model.getModerationStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    console.error("GET MODERATION STATS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// WARN USER
// ═══════════════════════════════════════════════════════════════════════════

exports.warnUser = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const { reportId } = req.params;

    const adminId = req.user.id;

    const result = await model.warnUser({
      reportId,
      adminId,
    });

    // ALREADY WARNED
    if (result.already_warned) {
      return res.status(200).json({
        success: false,

        already_warned: true,

        message: result.message,
      });
    }
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Moderation",
      action: "WARN_USER",

      entityType: "Report",
      entityId: reportId,
      entityName: `Report #${reportId}`,

      icon: "TriangleAlert",
      iconColor: "warning",

      description: `${req.user.name} warned a user from report ${reportId}`,
    });

    // SUCCESS
    // ── Notification: warning issued ────────────────────────────
    try {
      if (result.target_user_id) {
        await NotificationService.createNotification({
          userId: result.target_user_id,
          actorId: adminId,
          title: "⚠️ Warning Issued",
          message:
            "You have received a warning for violating community guidelines. Please review our policies.",
          type: "moderation_warning",
          entityType: "report",
          entityId: reportId,
          actionUrl: "/settings",
          icon: "AlertTriangle",
          accent: "#ef4444",
          priority: "critical",
        });
      }
    } catch (notifErr) {
      console.error("[moderation.warnUser] notification error:", notifErr.message);
    }

    return res.status(200).json({
      success: true,

      message: "User warned successfully",

      data: result,
    });
  } catch (err) {
    console.error("WARN USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET USER WARNINGS
// ═══════════════════════════════════════════════════════════════════════════

exports.getUserWarnings = async (req, res) => {
  try {
    const result = await model.getUserWarnings({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,

      data: result,
    });
  } catch (err) {
    console.error("GET WARNINGS ERROR:", err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// REMOVE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

exports.removeContent = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const result = await model.removeContent({
      reportId: req.params.reportId,

      adminId: req.user.id,
    });
    if (result.success) {
      // ── Notification: content removed ──────────────────────────
      try {
        if (result.data?.target_user_id) {
          await NotificationService.createNotification({
            userId: result.data.target_user_id,
            actorId: req.user.id,
            title: "Content Removed",
            message: `Your ${result.data.module_type || "content"} has been removed for violating community guidelines.`,
            type: "content_removed",
            entityType: result.data.module_type || "content",
            entityId: result.data.target_id,
            actionUrl: "/settings",
            icon: "Trash2",
            accent: "#ef4444",
            priority: "critical",
          });
        }
      } catch (notifErr) {
        console.error("[moderation.removeContent] notification error:", notifErr.message);
      }

      await logAdminActivity({
        adminId: req.user.id,
        adminName: req.user.name,
        adminRole: req.user.role,

        module: "Moderation",
        action: "REMOVE_CONTENT",

        entityType: result.data.module_type,
        entityId: result.data.target_id,
        entityName: result.data.module_type,

        icon: "Trash2",
        iconColor: "red",

        description: `${req.user.name} removed ${result.data.module_type} content (${result.data.target_id})`,
      });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("REMOVE CONTENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DISMISS REPORT
// ═══════════════════════════════════════════════════════════════════════════

exports.dismissReport = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }
    const { reportId } = req.params;

    const adminId = req.user.id;

    const result = await model.dismissReport({
      reportId,
      adminId,
    });
    if (result.success) {
      await logAdminActivity({
        adminId: req.user.id,
        adminName: req.user.name,
        adminRole: req.user.role,

        module: "Moderation",
        action: "DISMISS_REPORT",

        entityType: "Report",
        entityId: reportId,
        entityName: `Report #${reportId}`,

        icon: "BadgeCheck",
        iconColor: "success",

        description: `${req.user.name} dismissed report ${reportId}`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Report dismissed successfully",
      data: result,
    });
  } catch (err) {
    console.error("DISMISS REPORT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ═══════════════════════════════════════════════════════════════════════════
// GET REMOVED CONTENT NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

exports.getRemovedContentNotifications = async (req, res) => {
  try {
    const result = await model.getRemovedContentNotifications({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,

      data: result,
    });
  } catch (err) {
    console.error("GET REMOVED NOTIFICATIONS ERROR:", err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

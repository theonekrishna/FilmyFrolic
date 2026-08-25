// ═══════════════════════════════════════════════════════════════════════════
// admin.notification.controllers.js
// ═══════════════════════════════════════════════════════════════════════════

const model = require("./admin.notification.models");
const { logAdminActivity } = require("../activeLog/adminActivityLogger");
const NotificationService = require("../../../services/notification.service");
const { supabaseAdmin: sbAdminClient } = require("../../../configs/supabase");
// ══════════════════════
// SEND NOTIFICATION
// ══════════════════════

exports.sendNotification = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_create && !req.user?.permissions?.can_manage_notifications) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create notifications",
      });
    }

    const adminId = req.user.id;

    let { title, message, type, target_audience, icon, accent } = req.body;

    // ══════════════════════
    // SANITIZE
    // ══════════════════════

    title = title?.trim();

    message = message?.trim();

    type = type?.trim();

    target_audience = target_audience?.trim();

    icon = icon?.trim();

    accent = accent?.trim();

    // ══════════════════════
    // REQUIRED FIELDS
    // ══════════════════════

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ══════════════════════
    // LENGTH VALIDATION
    // ══════════════════════

    if (title.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters",
      });
    }

    if (title.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 120 characters",
      });
    }

    if (message.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 5 characters",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters",
      });
    }

    // ══════════════════════
    // VALID TYPES
    // ══════════════════════

    const validTypes = ["announcement", "warning", "info"];

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification type",
      });
    }

    // ══════════════════════
    // VALID AUDIENCES
    // ══════════════════════

    const validAudiences = [
      "all_users",
      "content_users",
      "social_users",
      "entertainment_users",
      "new_users_7_days",
    ];

    if (target_audience && !validAudiences.includes(target_audience)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target audience",
      });
    }

    // ══════════════════════
    // ICON VALIDATION
    // ══════════════════════

    if (icon && icon.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Icon name too long",
      });
    }

    // ══════════════════════
    // ACCENT VALIDATION
    // ══════════════════════

    if (accent && accent.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Accent value too long",
      });
    }

    // ══════════════════════
    // CREATE NOTIFICATION
    // ══════════════════════

    const notification = await model.sendNotification({
      adminId,

      title,

      message,

      type: type || "announcement",

      target_audience: target_audience || "all_users",

      icon: icon || null,

      accent: accent || null,
    });
    // ── Broadcast: insert into user notifications table ─────────
    try {
      // Fetch target user IDs based on audience
      let userQuery = sbAdminClient.from("profiles").select("id");

      if (target_audience === "new_users_7_days") {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        userQuery = userQuery.gte("created_at", sevenDaysAgo);
      }
      // For module-specific audiences, we fetch all and filter (same as getLatestNotifications)
      // For production scale, this should be optimized with proper DB queries

      const { data: users } = await userQuery.limit(10000);

      if (users && users.length > 0) {
        const bulkNotifs = users.map((u) => ({
          userId: u.id,
          actorId: adminId,
          title: notification.title,
          message: notification.message,
          type: "admin_broadcast",
          entityType: "admin_notification",
          entityId: notification.id,
          icon: icon || "Megaphone",
          accent: accent || "#f97316",
          priority: "high",
          metadata: { target_audience: target_audience || "all_users" },
        }));

        await NotificationService.createBulkNotifications(bulkNotifs);
      }
    } catch (broadcastErr) {
      console.error("[admin.sendNotification] broadcast error:", broadcastErr.message);
      // Don't fail the admin response — the admin_notifications row was already created
    }

    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Notifications",
      action: "SEND_NOTIFICATION",

      entityType: "Notification",
      entityId: notification.id,
      entityName: notification.title,

      icon: "Mic",
      iconColor: "primary",

      description: `${req.user.name} sent notification "${notification.title}"`,
    });
    return res.status(201).json({
      success: true,

      message: "Notification sent successfully",

      data: notification,
    });
  } catch (err) {
    console.error("SEND_NOTIFICATION_ERROR:", err);

    return res.status(500).json({
      success: false,

      message: "Failed to send notification",
    });
  }
};

// ══════════════════════
// GET ALL NOTIFICATIONS
// ══════════════════════

exports.getAllNotifications = async (req, res) => {
  try {
    const search = req.query.search || "";

    const type = req.query.type || "";

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 100);

    const notifications = await model.getAllNotifications({
      search,
      type,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...notifications,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getLatestNotifications = async (req, res) => {
  try {
    const user = req.user;

    const limit = Math.min(parseInt(req.query.limit) || 2, 50);

    const result = await model.getLatestNotifications({
      user,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest notifications",
    });
  }
};

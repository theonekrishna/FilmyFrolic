// ═══════════════════════════════════════════════════════════════════════════
// notifications.controller.js
// Full notification API surface for authenticated users.
// ═══════════════════════════════════════════════════════════════════════════

const NotificationModel = require("./notifications.model");

// ──────────────────────────────────────────────────────────────────────────
// GET /api/notifications
// Paginated notification list with optional filtering.
// Query params: page, limit, type, unread_only
// ──────────────────────────────────────────────────────────────────────────

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const type = req.query.type || null;
    const unreadOnly = req.query.unread_only === "true";

    const result = await NotificationModel.getNotifications(userId, {
      page,
      limit,
      type,
      unreadOnly,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("[getNotifications]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/notifications/unread-count
// Returns the number of unread notifications (for badges).
// ──────────────────────────────────────────────────────────────────────────

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationModel.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (err) {
    console.error("[getUnreadCount]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Mark a single notification as read.
// ──────────────────────────────────────────────────────────────────────────

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const data = await NotificationModel.markAsRead(notificationId, userId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[markAsRead]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// PATCH /api/notifications/read-all
// Mark all notifications as read.
// ──────────────────────────────────────────────────────────────────────────

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await NotificationModel.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: `${data.length} notification(s) marked as read`,
      count: data.length,
    });
  } catch (err) {
    console.error("[markAllAsRead]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all as read",
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/:id
// Soft-delete a single notification.
// ──────────────────────────────────────────────────────────────────────────

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const data = await NotificationModel.softDelete(notificationId, userId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error("[deleteNotification]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/all
// Soft-delete all notifications for the current user.
// ──────────────────────────────────────────────────────────────────────────

const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await NotificationModel.softDeleteAll(userId);

    return res.status(200).json({
      success: true,
      message: `${data.length} notification(s) deleted`,
      count: data.length,
    });
  } catch (err) {
    console.error("[deleteAllNotifications]", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete all notifications",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

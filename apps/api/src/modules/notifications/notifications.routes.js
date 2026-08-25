// ═══════════════════════════════════════════════════════════════════════════
// notifications.routes.js
// User-facing notification API routes.
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/auth");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("./notifications.controller");

// All notification routes require authentication
router.use(protect);

// GET    /api/notifications              – paginated list (query: page, limit, type, unread_only)
router.get("/", getNotifications);

// GET    /api/notifications/unread-count  – badge count
router.get("/unread-count", getUnreadCount);

// PATCH  /api/notifications/read-all     – mark all as read
router.patch("/read-all", markAllAsRead);

// PATCH  /api/notifications/:id/read     – mark one as read
router.patch("/:id/read", markAsRead);

// DELETE /api/notifications/all          – soft-delete all
router.delete("/all", deleteAllNotifications);

// DELETE /api/notifications/:id          – soft-delete one
router.delete("/:id", deleteNotification);

module.exports = router;

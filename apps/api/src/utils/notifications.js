// ═══════════════════════════════════════════════════════════════════════════
// src/utils/notifications.js
// Backward-compatible wrapper around the central NotificationService.
// Fixed: was using ES module syntax (import/export) in a CommonJS project.
// ═══════════════════════════════════════════════════════════════════════════

const NotificationService = require("../services/notification.service");

/**
 * Legacy helper — wraps NotificationService.createNotification().
 * Kept for backward compatibility with any code that imported this file.
 */
const createNotification = async ({ userId, title, message, type = "general" }) => {
  return NotificationService.createNotification({
    userId,
    title,
    message,
    type,
  });
};

module.exports = { createNotification };

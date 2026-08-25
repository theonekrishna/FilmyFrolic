// ═══════════════════════════════════════════════════════════════════════════
// admin.notification.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");
const router = express.Router();

const controller = require("./admin.notification.controllers");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

router.use(protect);

// ══════════════════════
// SEND NOTIFICATION
// ══════════════════════

router.post("/send", staffOnly, loadUserRoleAndPermissions, controller.sendNotification);

// ══════════════════════
// GET ALL NOTIFICATIONS
// ══════════════════════

router.get("/", staffOnly, loadUserRoleAndPermissions, controller.getAllNotifications);

// GET LATEST NOTIFICATIONS
router.get("/latest", controller.getLatestNotifications);

module.exports = router;

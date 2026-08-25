// ═══════════════════════════════════════════════════════════════════════════
// admin.moderation.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");

const router = express.Router();

const controller = require("./admin.moderation.controllers");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

// // AUTH
// router.use(protect);

// // STAFF ONLY
// router.use(staffOnly);
// router.use(loadUserRoleAndPermissions);

// GET USER WARNINGS
router.get("/warnings", protect, controller.getUserWarnings);
// GET REMOVED CONTENT NOTIFICATIONS
router.get("/removed-notifications", protect, controller.getRemovedContentNotifications);
// GET ALL REPORTS
router.get("/", protect, staffOnly, loadUserRoleAndPermissions, controller.getAllReports);

// GET REPORT STATS
router.get("/stats", protect, staffOnly, loadUserRoleAndPermissions, controller.getModerationStats);

// WARN USER
router.post("/:reportId/warn", protect, staffOnly, loadUserRoleAndPermissions, controller.warnUser);

// REMOVE CONTENT
router.post(
  "/:reportId/remove",
  protect,
  staffOnly,
  loadUserRoleAndPermissions,
  controller.removeContent
);

// DISMISS REPORT
router.post(
  "/:reportId/dismiss",
  protect,
  staffOnly,
  loadUserRoleAndPermissions,
  controller.dismissReport
);
module.exports = router;

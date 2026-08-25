// ═══════════════════════════════════════════════════════════════════════════
// admin.overview.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");

const router = express.Router();

const controller = require("./admin.overview.controllers");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

router.use(protect, staffOnly, loadUserRoleAndPermissions);

router.get("/stats", controller.getOverviewStats);

router.get("/user-growth", controller.getUserGrowth);

router.get("/recent-activity", controller.getRecentActivity);

router.get("/module-health", controller.getModuleHealth);

module.exports = router;

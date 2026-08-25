// ═══════════════════════════════════════════════════════════════════════════
// admin.user.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");

const router = express.Router();

const controller = require("./admin.user.controllers");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

// AUTH
router.use(protect, staffOnly, loadUserRoleAndPermissions);

// GET USERS
router.get("/", controller.getAllUsers);

// CHANGE ROLE
router.patch("/:userId/role", controller.changeUserRole);

// TOGGLE SUSPEND
router.patch("/:userId/suspend", controller.toggleSuspendUser);

// TOGGLE BAN
router.patch("/:userId/ban", controller.toggleBanUser);

module.exports = router;

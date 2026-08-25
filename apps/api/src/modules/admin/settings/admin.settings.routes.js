const express = require("express");

const router = express.Router();

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

const controller = require("./admin.settings.controllers");

// ═══════════════════════════════════════════════════════════════════════════
// ROLE BASED ACCESS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

router.use(protect, staffOnly, loadUserRoleAndPermissions);

// GET LOGGED IN USER PERMISSIONS
router.get(
  "/me/permissions",

  controller.getMyPermissions
);

// GET ROLES DROPDOWN LIST
router.get(
  "/role/list/all",

  controller.getRolesList
);

// GET ALL ROLES
router.get(
  "/role",

  controller.getAllRoles
);

// GET SINGLE ROLE
router.get(
  "/role/:roleId",

  controller.getSingleRole
);

// CREATE ROLE
router.post(
  "/role",

  controller.createRole
);

// UPDATE ROLE
router.put(
  "/role/:roleId",

  controller.updateRole
);

// DELETE ROLE
router.delete(
  "/role/:roleId",

  controller.deleteRole
);

// TOGGLE ROLE STATUS
router.patch(
  "/role/:roleId/status",

  controller.toggleRoleStatus
);

// ═══════════════════════════════════════════════════════════════════════════
// MODULE CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

// GET ALL MODULES
router.get("/modules", controller.getAllModules);

// TOGGLE MODULE STATUS

router.patch(
  "/modules/:module_key/toggle",

  controller.toggleModuleStatus
);

// ═══════════════════════════════════════
// ACCESS & REGISTRATION SETTINGS
// ═══════════════════════════════════════

router.get(
  "/access-settings",

  controller.getAllAccessSettings
);

router.patch(
  "/access-settings/:setting_key/toggle",

  controller.toggleAccessSetting
);

// ═══════════════════════════════════════
// CONTENT CONTROL SETTINGS
// ═══════════════════════════════════════

// GET ALL CONTENT CONTROL SETTINGS
router.get(
  "/content-controls",

  controller.getAllContentControls
);

router.patch(
  "/content-controls/:control_key/toggle",

  controller.toggleContentControl
);

// ═══════════════════════════════════════
// GET ALL ENTERTAINMENT CONTROLS
// ═══════════════════════════════════════

router.get(
  "/entertainment-controls",
  staffOnly,
  loadUserRoleAndPermissions,
  controller.getAllEntertainmentControls
);

// ═══════════════════════════════════════
// TOGGLE ENTERTAINMENT CONTROL
// ═══════════════════════════════════════

router.patch(
  "/entertainment-controls/:control_key/toggle",

  controller.toggleEntertainmentControl
);
module.exports = router;

const express = require("express");

const router = express.Router();
const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

const controller = require("./admin.feedback.controllers");
// ═══════════════════════════════════════════════════════════════════════════
// ROLE BASED ACCESS CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

router.use(protect, staffOnly, loadUserRoleAndPermissions);

// Submit feedback
router.get("/", controller.getFeedbacks);

router.patch("/:feedbackId/approve", controller.approveFeedback);

router.patch("/:feedbackId/reject", controller.rejectFeedback);

module.exports = router;

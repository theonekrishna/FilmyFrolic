const express = require("express");

const router = express.Router();

const controller = require("./feedback.controllers");

const { protect } = require("../../middlewares/auth");

// Submit feedback
router.post("/", protect, controller.submitFeedback);

// Check already submitted
router.get("/check", protect, controller.checkFeedbackExists);

// My feedback
router.get("/my-feedback", protect, controller.getMyFeedback);

module.exports = router;

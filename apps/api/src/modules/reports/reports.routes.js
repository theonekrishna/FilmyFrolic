const express = require("express");

const router = express.Router();

const reportsController = require("./reports.controller");
const { protect } = require("../../middlewares/auth.js");

// Get Report Categories
router.get("/categories/:module_type", protect, reportsController.getReportCategories);

// Check report status
router.get("/check", protect, reportsController.checkUserReport);

// Create Report
router.post("/", protect, reportsController.createReport);

module.exports = router;

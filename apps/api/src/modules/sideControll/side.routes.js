const express = require("express");

const router = express.Router();

const controller = require("./side.controllers");

// module access
router.get("/module-access", controller.getAllModules);

// ACCESS & REGISTRATION

router.get("/maintenance-mode", controller.getMaintenanceMode);

router.get("/registration-open", controller.getRegistrationOpen);

router.get("/admin-announcements", controller.getAdminAnnouncements);

router.get("/analytics-tracking", controller.getAnalyticsTracking);

// CONTENT CONTROLS

// REMOVED: Spoiler Protection feature has been removed from the application.
// router.get("/spoiler-protection", controller.getSpoilerProtection);

router.get("/adult-content-filter", controller.getAdultContentFilter);

router.get("/gossip-section", controller.getGossipSection);

router.get("/meme-submissions", controller.getMemeSubmissions);

// ENTERTAINMENT

router.get("/daily-quiz", controller.getDailyQuiz);

router.get("/live-rooms", controller.getLiveRooms);

module.exports = router;

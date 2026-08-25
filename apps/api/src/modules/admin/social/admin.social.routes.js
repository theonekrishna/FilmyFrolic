// ═════════════════════════════════════════════════════════════════════════════════════════════════════
// admin.user.routes.js
// ═════════════════════════════════════════════════════════════════════════════════════════════════════

const express = require("express");
const router = express.Router();
const controller = require("./admin.social.controllers");
const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

// ── Admin role and authentication ────────────────────────────────────────────────────────────────────

router.use(protect, staffOnly, loadUserRoleAndPermissions);

// ── Get All Communities ─────────────────────────────────────────────────────────────────────────────

router.get("/communities", controller.getAllCommunities);

// ── TOGGLE VERIFY COMMUNITY (only for admins) ──────────────────────────────────────────────────────────────

router.patch("/communities/:communityId/verify", controller.toggleVerifyCommunity);

// ── TOGGLE SUSPEND COMMUNITY (only for admins) ───────────────────────────────────────────────────────────

router.patch("/communities/:communityId/suspend", controller.toggleSuspendCommunity);

// ── GET ALL POSTS / FEEDS (only for admins) ───────────────────────────────────────────────────────────

router.get("/feeds", controller.getAllFeeds);

// ── REMOVE FEED (SOFT DELETE) (only for admins) ───────────────────────────────────────────────────────────

router.delete("/feeds/:feedId", controller.removeFeed);

// ── GET SINGLE FEED DETAILS (only for admins) ───────────────────────────────────────────────────────────

router.get("/feeds/:feedId", controller.getFeedDetails);

// ── GET ALL ROOMS (only for admins) ───────────────────────────────────────────────────────────────────────

router.get("/rooms", controller.getAllRooms);

// ── CLOSE ROOM (only for admins) ───────────────────────────────────────────────────────────────────────

router.patch("/rooms/:roomId/close", controller.closeRoom);

// ── TOGGLE FEATURED ROOM (only for admins) ───────────────────────────────────────────────────────────

router.patch("/rooms/:roomId/featured", controller.toggleFeaturedRoom);

module.exports = router;

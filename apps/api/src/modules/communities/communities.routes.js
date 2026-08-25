const express = require("express");
const router = express.Router();
const multer = require("multer");
const controller = require("./communities.controller");
const { protect } = require("../../middlewares/auth");

// multer – store file in memory so we can forward the buffer to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

// ── Optional-auth helper ───────────────────────────────────────────────────────
// Attaches req.user when a valid Bearer token is present, but never blocks the
// request. Used on routes that are publicly readable yet return extra data for
// authenticated users (is_joined, is_creator, is_owner, reacted …).
const optionalProtect = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  protect(req, { status: () => ({ json: () => {} }) }, next);
};

// ── Communities ────────────────────────────────────────────────────────────────
// GET  /            – public, but optionally authenticated (is_joined / is_creator)
// POST /create      – authenticated; banner is an optional file upload
router.get("/", optionalProtect, controller.fetchAllCommunities);
router.post("/create", protect, upload.single("banner"), controller.createCommunity);

// ── User activity stats ────────────────────────────────────────────────────────
// Must be above /:id so "activity" is never treated as a community UUID
router.get("/activity", protect, controller.getUserActivity);

// ── Parameterised community routes ────────────────────────────────────────────
router.delete("/:id", protect, controller.deleteCommunity);

// ── Posts ──────────────────────────────────────────────────────────────────────
// GET uses optionalProtect — privacy is enforced inside the controller
// (public = anyone, private/invite_only = members only)
router.get("/:id/posts", optionalProtect, controller.getCommunityPosts);
router.post("/:id/posts", protect, controller.createPost);
router.delete("/:id/posts/:postId", protect, controller.deletePost);

// ── Reactions ─────────────────────────────────────────────────────────────────
router.post("/posts/:postId/react", protect, controller.reactToPost);

// ── Members ───────────────────────────────────────────────────────────────────
router.get("/:id/members", protect, controller.getCommunityMembers);
router.post("/:id/members/toggle", protect, controller.joinCommunity);
router.delete("/:id/members/toggle", protect, controller.leaveCommunity);

// ── Join Requests (private communities) ───────────────────────────────────────
// GET  /:id/members/requests         – list all pending requests (admin only)
// PATCH /:id/members/requests/:uid   – approve or reject a request (admin only)
router.get("/:id/members/requests", protect, controller.getJoinRequests);
router.patch("/:id/members/requests/:requestUserId", protect, controller.handleJoinRequest);

// ── Invites (invite-only communities) ─────────────────────────────────────────
// POST /:id/invite         – admin sends invite to a user
// POST /:id/invite/accept  – invited user accepts the invite
router.post("/:id/invite", protect, controller.inviteUser);
router.post("/:id/invite/accept", protect, controller.acceptInvite);

// ── Events ────────────────────────────────────────────────────────────────────
router.get("/:id/events", optionalProtect, controller.getCommunityEvents);

// ── Trending topics ───────────────────────────────────────────────────────────
router.get("/:id/trending-topics", controller.getTrendingTopics);

module.exports = router;

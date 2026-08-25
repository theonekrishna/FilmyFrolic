// src/modules/settings/settings.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("./settings.controller");

const { createClient } = require("@supabase/supabase-js");
const { supabase } = require("../../configs/supabase");

// ── Supabase Admin client (service-role) ──────────────────────────────────────
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Simple in-process rate limiter ────────────────────────────────────────────
// Keyed by userId (set after auth). Limits sensitive write operations to
// prevent abuse. For production, swap this for a Redis-backed solution.

function makeRateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // userId -> { count, resetAt }

  return function rateLimiter(req, res, next) {
    const userId = req.user?.id;
    if (!userId) return next();

    const now = Date.now();
    const entry = hits.get(userId);

    if (!entry || now > entry.resetAt) {
      hits.set(userId, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({
        success: false,
        error: message ?? "Too many requests. Please try again later.",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    entry.count += 1;
    return next();
  };
}

// 5 password-change attempts per 15 minutes
const passwordRateLimit = makeRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password change attempts. Please try again in 15 minutes.",
});

// 3 export generations per hour
const exportRateLimit = makeRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Export limit reached. You can generate up to 3 exports per hour.",
});

// 5 deactivation attempts per day
const deactivateRateLimit = makeRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: "Too many deactivation attempts.",
});

// ── Auth middleware ────────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: "No token provided" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user)
    return res.status(401).json({ success: false, error: "Invalid or expired token" });

  req.user = data.user;
  next();
}

// ── Attach admin client (for routes that need service-role ops) ────────────────
function attachAdmin(req, _res, next) {
  req.supabaseAdmin = supabaseAdmin;
  next();
}

// ── All settings routes require a valid JWT ───────────────────────────────────
router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT
//
// GET    /api/settings/account
// PATCH  /api/settings/account/profile
// POST   /api/settings/account/password           body: { currentPassword, newPassword }
// GET    /api/settings/account/connected
// DELETE /api/settings/account/connected/:identityId
// GET    /api/settings/account/2fa
// POST   /api/settings/account/2fa/prepare
// DELETE /api/settings/account/2fa/:factorId
// POST   /api/settings/account/deactivate
// POST   /api/settings/account/reactivate
//
// REMOVED: DELETE /api/settings/account  (deleteAccount)
//          Hard deletion is no longer supported. Use /deactivate instead.
//
// 2FA ENROLL NOTE:
//   Enrolling 2FA (QR generation / TOTP verification) is handled entirely
//   client-side via the Supabase JS SDK — no server route is needed for the
//   enroll path. Only unenrollment requires admin privileges (server-side).
// ─────────────────────────────────────────────────────────────────────────────

router.get("/account", ctrl.getAccount);
router.patch("/account/profile", ctrl.updateProfile);
router.post("/account/password", attachAdmin, passwordRateLimit, ctrl.changePassword);
router.get("/account/connected", attachAdmin, ctrl.getConnectedAccounts);
router.delete("/account/connected/:identityId", attachAdmin, ctrl.unlinkProvider);
router.get("/account/2fa", attachAdmin, ctrl.getTwoFactor);
router.post("/account/2fa/prepare", attachAdmin, ctrl.prepareTwoFactorEnroll);
router.delete("/account/2fa/:factorId", attachAdmin, ctrl.disableTwoFactor);
router.post("/account/deactivate", deactivateRateLimit, ctrl.deactivateAccount);
router.post("/account/reactivate", ctrl.reactivateAccount);
// DELETE /account (deleteAccount) has been removed — hard deletion not supported.

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR PRESETS
// GET /api/settings/avatars
// ─────────────────────────────────────────────────────────────────────────────

router.get("/avatars", ctrl.getAvatarPresets);

// ─────────────────────────────────────────────────────────────────────────────
// BLOCKED ACCOUNTS
// GET    /api/settings/blocked
// POST   /api/settings/blocked           body: { userId }
// DELETE /api/settings/blocked/:userId
// ─────────────────────────────────────────────────────────────────────────────

router.get("/blocked", ctrl.getBlockedUsers);
router.post("/blocked", ctrl.blockUser);
router.delete("/blocked/:userId", ctrl.unblockUser);

// ─────────────────────────────────────────────────────────────────────────────
// WATCH HISTORY
// GET    /api/settings/history?limit=50&offset=0
// DELETE /api/settings/history/:itemId    — remove single entry
// DELETE /api/settings/history            — clear all
//
// IMPORTANT: The specific route (/history/:itemId) MUST be registered before
// the wildcard clear-all route (/history) so Express matches the parameterised
// route first. Reversing this order would cause single-item deletes to silently
// clear the entire history. This ordering is intentional and must be preserved.
// ─────────────────────────────────────────────────────────────────────────────

router.get("/history", ctrl.getWatchHistory);
router.delete("/history/:itemId", ctrl.deleteWatchHistoryItem); // ← specific first
router.delete("/history", ctrl.clearWatchHistory); // ← wildcard second

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS
// GET    /api/settings/sessions
// POST   /api/settings/sessions/ping              body: { sessionId, label? }
// DELETE /api/settings/sessions/:sessionId        revoke one
// DELETE /api/settings/sessions                   body: { currentSessionId }  revoke all others
//
// IMPORTANT: /sessions/ping MUST be registered before /sessions/:sessionId.
// If the parameterised route is registered first, Express will match "ping"
// as the sessionId parameter and call revokeSession instead of pingSession.
// ─────────────────────────────────────────────────────────────────────────────

router.get("/sessions", ctrl.getSessions);
router.post("/sessions/ping", ctrl.pingSession); // ← literal first
router.delete("/sessions/:sessionId", attachAdmin, ctrl.revokeSession); // ← param second
router.delete("/sessions", attachAdmin, ctrl.revokeAllOtherSessions);

// ─────────────────────────────────────────────────────────────────────────────
// DATA EXPORT
// GET  /api/settings/data/export  → signed URL for existing export (no rebuild)
// POST /api/settings/data/export  → generate / regenerate + signed URL
//                                   Rate-limited: 3 per hour per user
// ─────────────────────────────────────────────────────────────────────────────

router.get("/data/export", attachAdmin, ctrl.getExportUrl);
router.post("/data/export", attachAdmin, exportRateLimit, ctrl.exportUserData);

// ─────────────────────────────────────────────────────────────────────────────
// PREFERENCES
// GET   /api/settings/preferences
// PATCH /api/settings/preferences
//
// Accepted body fields (all optional):
//   language          : string  — one of VALID_LANGUAGES
//   contentRating     : string  — one of VALID_RATINGS
//   notifications     : { newReleases?, reviews?, discussions?, liveRooms?, weeklyDigest? }
//
// REMOVED: spoilerProtection, autoSpoilerHide
// DISABLED (stored but not enforced): matureContent
// ─────────────────────────────────────────────────────────────────────────────

router.get("/preferences", ctrl.getPreferences);
router.patch("/preferences", ctrl.updatePreferences);

// ─────────────────────────────────────────────────────────────────────────────
// MODULES
// GET   /api/settings/modules
// PATCH /api/settings/modules   body: { social?, content?, entertain?, user? }
//                               Note: `core` is always forced to true server-side
// ─────────────────────────────────────────────────────────────────────────────

router.get("/modules", ctrl.getModules);
router.patch("/modules", ctrl.updateModules);

// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY
// GET   /api/settings/privacy
// PATCH /api/settings/privacy
//
// Accepted body fields (all optional):
//   messagePermission : "Everyone" | "Followers" | "No one"
//   activityVisible   : boolean
//   watchlistPublic   : boolean
//   profileIndexed    : boolean
//
// REMOVED: followPermission (Follow Permission section removed entirely)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/privacy", ctrl.getPrivacy);
router.patch("/privacy", ctrl.updatePrivacy);

module.exports = router;

// src/modules/contribute/contribute.routes.js

const express = require("express");
const router = express.Router();
const ctrl = require("./contribute.controller");

const { createClient } = require("@supabase/supabase-js");
const { supabase } = require("../../configs/supabase");

// ── Supabase Admin client ─────────────────────────────────────────────────────
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ── Simple in-process rate limiter ────────────────────────────────────────────

function makeRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

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

// 10 bug reports per day per user
const bugReportRateLimit = makeRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: "You can submit up to 10 bug reports per day.",
});

// 10 feature requests per day per user
const featureRequestRateLimit = makeRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  message: "You can submit up to 10 feature requests per day.",
});

// 50 upvotes per day per user
const upvoteRateLimit = makeRateLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  message: "Upvote limit reached for today.",
});

// 5 beta toggle attempts per hour (prevent spam toggling)
const betaToggleRateLimit = makeRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many beta enrollment changes. Please try again later.",
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

router.use(requireAuth);

// ─────────────────────────────────────────────────────────────────────────────
// BUG REPORTS
//
// POST   /api/contribute/bugs              Submit a bug report
// GET    /api/contribute/bugs              List user's bug reports (paginated)
// GET    /api/contribute/bugs/:reportId    Get a single bug report
// ─────────────────────────────────────────────────────────────────────────────

router.post("/bugs", bugReportRateLimit, ctrl.submitBugReport);
router.get("/bugs", ctrl.getUserBugReports);
router.get("/bugs/:reportId", ctrl.getBugReportById);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE REQUESTS
//
// POST   /api/contribute/features                      Submit a feature request
// GET    /api/contribute/features                      List user's requests (paginated)
// POST   /api/contribute/features/:requestId/upvote    Upvote a request (once per user)
//
// NOTE: The literal /features route and /features/:requestId/upvote are both
// POST routes — they do not conflict because the paths are distinct.
// ─────────────────────────────────────────────────────────────────────────────

router.post("/features", featureRequestRateLimit, ctrl.submitFeatureRequest);
router.get("/features", ctrl.getUserFeatureRequests);
router.post("/features/:requestId/upvote", upvoteRateLimit, ctrl.upvoteFeatureRequest);

// ─────────────────────────────────────────────────────────────────────────────
// BETA PROGRAM
//
// GET    /api/contribute/beta           Get enrollment status
// POST   /api/contribute/beta/enroll   Enroll (idempotent)
// DELETE /api/contribute/beta/enroll   Unenroll
// ─────────────────────────────────────────────────────────────────────────────

router.get("/beta", ctrl.getBetaStatus);
router.post("/beta/enroll", betaToggleRateLimit, ctrl.enrollBeta);
router.delete("/beta/enroll", betaToggleRateLimit, ctrl.unenrollBeta);

module.exports = router;

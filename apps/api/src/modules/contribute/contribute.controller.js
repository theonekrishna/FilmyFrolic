// src/modules/contribute/contribute.controller.js

const contributeModel = require("./contribute.model");

// ─── helpers ──────────────────────────────────────────────────────────────────

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}
function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}
function serverError(res, err, label = "Operation failed") {
  console.error(`[contribute] ${label}:`, err?.message ?? err);
  return res.status(500).json({ success: false, error: label });
}

// ── Validation helpers ─────────────────────────────────────────────────────────

const VALID_SEVERITIES = ["low", "medium", "high", "critical"];
const VALID_USER_PRIORITIES = ["low", "medium", "high"];
const VALID_MODULE_AREAS = [
  "auth",
  "profile",
  "feed",
  "communities",
  "gossip",
  "memes",
  "rooms",
  "messages",
  "games",
  "notifications",
  "settings",
  "search",
  "other",
];
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_URL_LEN = 2048;

// ══════════════════════════════════════════════════════════════════════════════
// BUG REPORTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/contribute/bugs
 * Submit a new bug report.
 *
 * Body:
 *   title              string  required  1–150 chars
 *   description        string  required  10–2000 chars
 *   steps_to_reproduce string  optional  max 2000 chars
 *   severity           string  optional  low | medium | high | critical  (default: medium)
 *   module_area        string  optional  one of VALID_MODULE_AREAS
 *   device_info        object  optional  { os, browser, app_version }
 *   attachments        array   optional  max 5 URLs (screenshots / logs)
 */
async function submitBugReport(req, res) {
  try {
    const {
      title,
      description,
      steps_to_reproduce,
      severity,
      module_area,
      device_info,
      attachments,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!title || typeof title !== "string" || title.trim().length === 0)
      return fail(res, "title is required");
    if (title.trim().length > 150) return fail(res, "title must be 150 characters or fewer");

    if (!description || typeof description !== "string" || description.trim().length < 10)
      return fail(res, "description is required and must be at least 10 characters");
    if (description.trim().length > 2000)
      return fail(res, "description must be 2000 characters or fewer");

    if (
      steps_to_reproduce !== undefined &&
      typeof steps_to_reproduce === "string" &&
      steps_to_reproduce.length > 2000
    )
      return fail(res, "steps_to_reproduce must be 2000 characters or fewer");

    if (severity !== undefined && !VALID_SEVERITIES.includes(severity))
      return fail(res, `severity must be one of: ${VALID_SEVERITIES.join(", ")}`);

    if (module_area !== undefined && !VALID_MODULE_AREAS.includes(module_area))
      return fail(res, `module_area must be one of: ${VALID_MODULE_AREAS.join(", ")}`);

    if (
      device_info !== undefined &&
      (typeof device_info !== "object" || Array.isArray(device_info))
    )
      return fail(res, "device_info must be an object");

    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) return fail(res, "attachments must be an array");
      if (attachments.length > MAX_ATTACHMENTS)
        return fail(res, `attachments must not exceed ${MAX_ATTACHMENTS} items`);
      for (const url of attachments) {
        if (typeof url !== "string" || url.length > MAX_ATTACHMENT_URL_LEN)
          return fail(res, "each attachment must be a valid URL string");
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const result = await contributeModel.createBugReport(req.user.id, {
      title,
      description,
      steps_to_reproduce,
      severity,
      module_area,
      device_info,
      attachments,
    });

    return ok(res, result, 201);
  } catch (err) {
    return serverError(res, err, "Could not submit bug report");
  }
}

/**
 * GET /api/contribute/bugs
 * Get all bug reports submitted by the authenticated user.
 */
async function getUserBugReports(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit ?? "20", 10));

    const result = await contributeModel.getUserBugReports(req.user.id, { page, limit });
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not fetch bug reports");
  }
}

/**
 * GET /api/contribute/bugs/:reportId
 * Get a single bug report (user-scoped).
 */
async function getBugReportById(req, res) {
  try {
    const { reportId } = req.params;
    const result = await contributeModel.getBugReportById(req.user.id, reportId);
    return ok(res, result);
  } catch (err) {
    if (err.code === "NOT_FOUND") return fail(res, "Bug report not found", 404);
    return serverError(res, err, "Could not fetch bug report");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE REQUESTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/contribute/features
 * Submit a new feature request.
 *
 * Body:
 *   title              string  required  1–150 chars
 *   description        string  required  10–2000 chars
 *   use_case           string  optional  max 1000 chars
 *   priority_for_user  string  optional  low | medium | high  (default: medium)
 *   module_area        string  optional  one of VALID_MODULE_AREAS
 */
async function submitFeatureRequest(req, res) {
  try {
    const { title, description, use_case, priority_for_user, module_area } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!title || typeof title !== "string" || title.trim().length === 0)
      return fail(res, "title is required");
    if (title.trim().length > 150) return fail(res, "title must be 150 characters or fewer");

    if (!description || typeof description !== "string" || description.trim().length < 10)
      return fail(res, "description is required and must be at least 10 characters");
    if (description.trim().length > 2000)
      return fail(res, "description must be 2000 characters or fewer");

    if (use_case !== undefined && typeof use_case === "string" && use_case.length > 1000)
      return fail(res, "use_case must be 1000 characters or fewer");

    if (priority_for_user !== undefined && !VALID_USER_PRIORITIES.includes(priority_for_user))
      return fail(res, `priority_for_user must be one of: ${VALID_USER_PRIORITIES.join(", ")}`);

    if (module_area !== undefined && !VALID_MODULE_AREAS.includes(module_area))
      return fail(res, `module_area must be one of: ${VALID_MODULE_AREAS.join(", ")}`);
    // ─────────────────────────────────────────────────────────────────────────

    const result = await contributeModel.createFeatureRequest(req.user.id, {
      title,
      description,
      use_case,
      priority_for_user,
      module_area,
    });

    return ok(res, result, 201);
  } catch (err) {
    return serverError(res, err, "Could not submit feature request");
  }
}

/**
 * GET /api/contribute/features
 * Get all feature requests submitted by the authenticated user.
 */
async function getUserFeatureRequests(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit ?? "20", 10));

    const result = await contributeModel.getUserFeatureRequests(req.user.id, { page, limit });
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not fetch feature requests");
  }
}

/**
 * POST /api/contribute/features/:requestId/upvote
 * Upvote a feature request (one per user).
 */
async function upvoteFeatureRequest(req, res) {
  try {
    const { requestId } = req.params;
    const result = await contributeModel.upvoteFeatureRequest(req.user.id, requestId);
    return ok(res, result);
  } catch (err) {
    if (err.code === "ALREADY_UPVOTED")
      return fail(res, "You have already upvoted this feature request", 409);
    return serverError(res, err, "Could not upvote feature request");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BETA PROGRAM
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/contribute/beta
 * Get the authenticated user's beta enrollment status.
 */
async function getBetaStatus(req, res) {
  try {
    const result = await contributeModel.getBetaStatus(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not fetch beta status");
  }
}

/**
 * POST /api/contribute/beta/enroll
 * Enroll the authenticated user in the beta program. Idempotent.
 */
async function enrollBeta(req, res) {
  try {
    const result = await contributeModel.enrollBeta(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not enroll in beta program");
  }
}

/**
 * DELETE /api/contribute/beta/enroll
 * Unenroll the authenticated user from the beta program.
 */
async function unenrollBeta(req, res) {
  try {
    const result = await contributeModel.unenrollBeta(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not unenroll from beta program");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Bug reports
  submitBugReport,
  getUserBugReports,
  getBugReportById,
  // Feature requests
  submitFeatureRequest,
  getUserFeatureRequests,
  upvoteFeatureRequest,
  // Beta program
  getBetaStatus,
  enrollBeta,
  unenrollBeta,
};

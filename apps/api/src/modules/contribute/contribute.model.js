// src/modules/contribute/contribute.model.js
//
// Data-access layer for the Contribute section:
//   • Bug reports       (type: 'bug')
//   • Feature requests  (type: 'feature')
//   • Beta program      (enrollment / unenrollment)
//
// All writes use supabaseAdmin (service-role) to bypass RLS.
// All reads are scoped to the authenticated user's own records.
// ─────────────────────────────────────────────────────────────────────────────

const { supabase, supabaseAdmin } = require("../../configs/supabase");

// ══════════════════════════════════════════════════════════════════════════════
// BUG REPORTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Submit a new bug report.
 */
async function createBugReport(
  userId,
  { title, description, steps_to_reproduce, severity, module_area, device_info, attachments }
) {
  const { data, error } = await supabaseAdmin
    .from("bug_reports")
    .insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      steps_to_reproduce: steps_to_reproduce?.trim() ?? null,
      severity: severity ?? "medium",
      module_area: module_area ?? null,
      device_info: device_info ?? null,
      attachments: attachments ?? [],
      status: "open",
    })
    .select("id, title, severity, status, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get all bug reports submitted by this user (paginated).
 */
async function getUserBugReports(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from("bug_reports")
    .select("id, title, severity, status, created_at, updated_at", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

/**
 * Get a single bug report by ID (user-scoped).
 */
async function getBugReportById(userId, reportId) {
  const { data, error } = await supabaseAdmin
    .from("bug_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw Object.assign(new Error("Bug report not found"), { code: "NOT_FOUND" });
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE REQUESTS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Submit a new feature request.
 */
async function createFeatureRequest(
  userId,
  { title, description, use_case, priority_for_user, module_area }
) {
  const { data, error } = await supabaseAdmin
    .from("feature_requests")
    .insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim(),
      use_case: use_case?.trim() ?? null,
      priority_for_user: priority_for_user ?? "medium",
      module_area: module_area ?? null,
      status: "open",
      upvote_count: 0,
    })
    .select("id, title, status, upvote_count, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get all feature requests submitted by this user (paginated).
 */
async function getUserFeatureRequests(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from("feature_requests")
    .select("id, title, status, upvote_count, priority_for_user, created_at, updated_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

/**
 * Upvote a feature request (one per user per request).
 * Returns the updated upvote count.
 */
async function upvoteFeatureRequest(userId, requestId) {
  // Check if already upvoted
  const { data: existing } = await supabaseAdmin
    .from("feature_request_upvotes")
    .select("id")
    .eq("user_id", userId)
    .eq("request_id", requestId)
    .maybeSingle();

  if (existing) {
    throw Object.assign(new Error("Already upvoted this feature request"), {
      code: "ALREADY_UPVOTED",
    });
  }

  // Insert upvote record
  const { error: upvoteError } = await supabaseAdmin
    .from("feature_request_upvotes")
    .insert({ user_id: userId, request_id: requestId });

  if (upvoteError) throw new Error(upvoteError.message);

  // Increment counter
  const { data, error } = await supabaseAdmin.rpc("increment_feature_upvote", {
    request_id: requestId,
  });

  if (error) throw new Error(error.message);
  return { upvoted: true, upvote_count: data };
}

// ══════════════════════════════════════════════════════════════════════════════
// BETA PROGRAM
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Get the user's current beta enrollment status.
 */
async function getBetaStatus(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_beta_member, beta_enrolled_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    enrolled: data?.is_beta_member ?? false,
    enrolled_at: data?.beta_enrolled_at ?? null,
  };
}

/**
 * Enroll the user in the beta program.
 * Idempotent — calling when already enrolled returns current status.
 */
async function enrollBeta(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_beta_member: true,
      beta_enrolled_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, is_beta_member, beta_enrolled_at")
    .single();

  if (error) throw new Error(error.message);

  return {
    enrolled: data.is_beta_member,
    enrolled_at: data.beta_enrolled_at,
  };
}

/**
 * Unenroll the user from the beta program.
 */
async function unenrollBeta(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      is_beta_member: false,
      beta_enrolled_at: null,
    })
    .eq("id", userId)
    .select("id, is_beta_member")
    .single();

  if (error) throw new Error(error.message);

  return {
    enrolled: data.is_beta_member,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Bug reports
  createBugReport,
  getUserBugReports,
  getBugReportById,
  // Feature requests
  createFeatureRequest,
  getUserFeatureRequests,
  upvoteFeatureRequest,
  // Beta program
  getBetaStatus,
  enrollBeta,
  unenrollBeta,
};

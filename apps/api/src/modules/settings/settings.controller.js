// src/modules/settings/settings.controller.js
const settingsModel = require("./settings.model");

// ─── helpers ──────────────────────────────────────────────────────────────────

function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}
function fail(res, message, status = 400) {
  return res.status(status).json({ success: false, error: message });
}
function serverError(res, err, label = "Operation failed") {
  console.error(`[settings] ${label}:`, err?.message ?? err);
  return res.status(500).json({ success: false, error: label });
}

// ─── ACCOUNT ──────────────────────────────────────────────────────────────────

async function getAccount(req, res) {
  try {
    const profile = await settingsModel.getProfile(req.user.id);
    return ok(res, { profile });
  } catch (err) {
    return serverError(res, err, "Could not fetch profile");
  }
}

async function updateProfile(req, res) {
  try {
    const { name, username, bio, avatar_url, initials, gradient, avatar_preset } = req.body;

    if (bio !== undefined && bio.length > 160)
      return fail(res, "Bio must be 160 characters or fewer");

    if (username !== undefined) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username))
        return fail(res, "Username must be 3–30 characters: letters, numbers, underscores only");
      const taken = await settingsModel.isUsernameTaken(username, req.user.id);
      if (taken) return fail(res, "Username is already taken", 409);
    }

    const updated = await settingsModel.updateProfile(req.user.id, {
      name,
      username,
      bio,
      avatar_url,
      initials,
      gradient,
      avatar_preset,
    });
    return ok(res, { profile: updated });
  } catch (err) {
    return serverError(res, err, "Could not update profile");
  }
}

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

/**
 * Requires both currentPassword and newPassword in the request body.
 * The model verifies the current password via signInWithPassword before
 * allowing the update — preventing JWT-only password takeover.
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== "string")
      return fail(res, "currentPassword is required");
    if (!newPassword || typeof newPassword !== "string")
      return fail(res, "newPassword is required");
    if (newPassword.length < 8) return fail(res, "Password must be at least 8 characters");
    if (currentPassword === newPassword)
      return fail(res, "New password must differ from current password");

    const result = await settingsModel.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
      req.supabaseAdmin
    );
    return ok(res, result);
  } catch (err) {
    if (err.code === "INVALID_CURRENT_PASSWORD")
      return fail(res, "Current password is incorrect", 401);
    return serverError(res, err, "Could not change password");
  }
}

// ─── CONNECTED ACCOUNTS ───────────────────────────────────────────────────────

async function getConnectedAccounts(req, res) {
  try {
    const accounts = await settingsModel.getConnectedAccounts(req.user.id, req.supabaseAdmin);
    return ok(res, { accounts });
  } catch (err) {
    return serverError(res, err, "Could not fetch connected accounts");
  }
}

/**
 * Unlinks a provider identity.
 * Returns 409 if the identity is the user's last sign-in method and they
 * have no password set — removing it would permanently lock them out.
 */
async function unlinkProvider(req, res) {
  try {
    const { identityId } = req.params;
    if (!identityId) return fail(res, "identityId is required");

    const result = await settingsModel.unlinkProvider(req.user.id, identityId, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    if (err.code === "LAST_IDENTITY") return fail(res, err.message, 409);
    return serverError(res, err, "Could not unlink provider");
  }
}

// ─── TWO-FACTOR AUTHENTICATION ────────────────────────────────────────────────

async function getTwoFactor(req, res) {
  try {
    const status = await settingsModel.getTwoFactorStatus(req.user.id, req.supabaseAdmin);
    return ok(res, status);
  } catch (err) {
    return serverError(res, err, "Could not fetch 2FA status");
  }
}

async function disableTwoFactor(req, res) {
  try {
    const { factorId } = req.params;
    if (!factorId) return fail(res, "factorId is required");

    const result = await settingsModel.disableTwoFactor(req.user.id, factorId, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not disable 2FA");
  }
}

async function prepareTwoFactorEnroll(req, res) {
  try {
    const result = await settingsModel.clearUnverifiedFactors(req.user.id, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not prepare 2FA enrollment");
  }
}

// ─── AVATAR PRESETS ───────────────────────────────────────────────────────────

async function getAvatarPresets(req, res) {
  try {
    const avatars = await settingsModel.getAvatarPresets();
    return ok(res, { avatars });
  } catch (err) {
    return serverError(res, err, "Could not fetch avatar presets");
  }
}

// ─── BLOCKED ACCOUNTS ─────────────────────────────────────────────────────────

async function getBlockedUsers(req, res) {
  try {
    const blocked = await settingsModel.getBlockedUsers(req.user.id);
    return ok(res, { blocked, count: blocked.length });
  } catch (err) {
    return serverError(res, err, "Could not fetch blocked users");
  }
}

async function blockUser(req, res) {
  try {
    const { userId: blockedId } = req.body;
    if (!blockedId) return fail(res, "userId is required");

    const result = await settingsModel.blockUser(req.user.id, blockedId);
    return ok(res, result, 201);
  } catch (err) {
    if (err.code === "23505") return fail(res, "User is already blocked", 409);
    return serverError(res, err, "Could not block user");
  }
}

async function unblockUser(req, res) {
  try {
    const { userId: blockedId } = req.params;
    const result = await settingsModel.unblockUser(req.user.id, blockedId);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not unblock user");
  }
}

// ─── WATCH HISTORY ────────────────────────────────────────────────────────────

async function getWatchHistory(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit ?? "50", 10), 200);
    const offset = parseInt(req.query.offset ?? "0", 10);
    const history = await settingsModel.getWatchHistory(req.user.id, { limit, offset });
    return ok(res, { history, limit, offset });
  } catch (err) {
    return serverError(res, err, "Could not fetch watch history");
  }
}

async function clearWatchHistory(req, res) {
  try {
    const result = await settingsModel.clearWatchHistory(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not clear watch history");
  }
}

async function deleteWatchHistoryItem(req, res) {
  try {
    const { itemId } = req.params;
    if (!itemId) return fail(res, "itemId is required");

    const result = await settingsModel.deleteWatchHistoryItem(req.user.id, itemId);
    return ok(res, result);
  } catch (err) {
    if (err.code === "NOT_FOUND") return fail(res, "History item not found", 404);
    return serverError(res, err, "Could not delete watch history item");
  }
}

// ─── ACTIVE SESSIONS ──────────────────────────────────────────────────────────

async function getSessions(req, res) {
  try {
    const sessions = await settingsModel.getSessions(req.user.id);
    return ok(res, { sessions });
  } catch (err) {
    return serverError(res, err, "Could not fetch sessions");
  }
}

async function pingSession(req, res) {
  try {
    const { sessionId, label } = req.body;
    if (!sessionId) return fail(res, "sessionId is required");

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? req.ip;
    const result = await settingsModel.upsertSession(req.user.id, sessionId, { label, ip });
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not register session");
  }
}

async function revokeSession(req, res) {
  try {
    const { sessionId } = req.params;
    const result = await settingsModel.revokeSession(req.user.id, sessionId, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not revoke session");
  }
}

async function revokeAllOtherSessions(req, res) {
  try {
    const { currentSessionId } = req.body;
    if (!currentSessionId) return fail(res, "currentSessionId is required");

    const result = await settingsModel.revokeAllOtherSessions(
      req.user.id,
      currentSessionId,
      req.supabaseAdmin
    );
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not revoke sessions");
  }
}

// ─── DOWNLOAD MY DATA ─────────────────────────────────────────────────────────

async function exportUserData(req, res) {
  try {
    const result = await settingsModel.exportUserData(req.user.id, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not export user data");
  }
}

async function getExportUrl(req, res) {
  try {
    const result = await settingsModel.getExistingExport(req.user.id, req.supabaseAdmin);
    return ok(res, result);
  } catch (err) {
    if (err.code === "NOT_FOUND")
      return fail(res, "No export found. Use POST /api/settings/data/export to generate one.", 404);
    return serverError(res, err, "Could not retrieve export");
  }
}

// ─── PREFERENCES ──────────────────────────────────────────────────────────────
//
// REMOVED:  spoilerProtection — feature removed entirely
// REMOVED:  autoSpoilerHide   — feature removed entirely
// DISABLED: matureContent      — implemented (stored) but not yet enforced;
//           commented out rather than deleted so it can be re-enabled later.
//
// ─────────────────────────────────────────────────────────────────────────────

async function getPreferences(req, res) {
  try {
    const preferences = await settingsModel.getPreferences(req.user.id);
    return ok(res, { preferences });
  } catch (err) {
    return serverError(res, err, "Could not fetch preferences");
  }
}

async function updatePreferences(req, res) {
  try {
    const VALID_LANGUAGES = ["English (US)", "English (UK)", "Spanish", "French", "Japanese"];
    const VALID_RATINGS = ["All ages", "PG-13 & below", "PG & below", "G only"];

    // spoilerProtection and autoSpoilerHide have been removed from this feature.
    // matureContent is accepted by the API but its enforcement is disabled — see model.
    const {
      language,
      contentRating,
      notifications,
      // matureContent, // DISABLED — uncomment when enforcement is ready
    } = req.body;

    if (language && !VALID_LANGUAGES.includes(language))
      return fail(res, `Invalid language. Allowed: ${VALID_LANGUAGES.join(", ")}`);
    if (contentRating && !VALID_RATINGS.includes(contentRating))
      return fail(res, `Invalid content rating. Allowed: ${VALID_RATINGS.join(", ")}`);

    // matureContent boolean validation — DISABLED
    // if (matureContent !== undefined && typeof matureContent !== "boolean")
    //   return fail(res, "'matureContent' must be a boolean");

    if (notifications !== undefined) {
      if (typeof notifications !== "object" || Array.isArray(notifications))
        return fail(res, "'notifications' must be an object");
      const VALID_NOTIF_KEYS = [
        "newReleases",
        "reviews",
        "discussions",
        "liveRooms",
        "weeklyDigest",
      ];
      for (const [key, val] of Object.entries(notifications)) {
        if (!VALID_NOTIF_KEYS.includes(key))
          return fail(
            res,
            `Unknown notification key: '${key}'. Allowed: ${VALID_NOTIF_KEYS.join(", ")}`
          );
        if (typeof val !== "boolean") return fail(res, `notifications.${key} must be a boolean`);
      }
    }

    const preferences = await settingsModel.updatePreferences(req.user.id, req.body);
    return ok(res, { preferences });
  } catch (err) {
    return serverError(res, err, "Could not update preferences");
  }
}

// ─── MODULES ──────────────────────────────────────────────────────────────────

async function getModules(req, res) {
  try {
    const modules = await settingsModel.getModules(req.user.id);
    return ok(res, { modules });
  } catch (err) {
    return serverError(res, err, "Could not fetch modules");
  }
}

async function updateModules(req, res) {
  try {
    const VALID_MODULES = ["core", "social", "content", "entertain", "user"];
    const patch = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => VALID_MODULES.includes(k))
    );

    for (const [key, val] of Object.entries(patch)) {
      if (typeof val !== "boolean") return fail(res, `Module '${key}' must be a boolean`);
    }
    if (!Object.keys(patch).length) return fail(res, "No valid module keys provided");

    const modules = await settingsModel.updateModules(req.user.id, patch);
    return ok(res, { modules });
  } catch (err) {
    return serverError(res, err, "Could not update modules");
  }
}

// ─── PRIVACY ──────────────────────────────────────────────────────────────────
//
// REMOVED: followPermission — the Follow Permission section has been removed.
//          Only messagePermission and the three visibility booleans remain.
//
// ─────────────────────────────────────────────────────────────────────────────

async function getPrivacy(req, res) {
  try {
    const privacy = await settingsModel.getPrivacy(req.user.id);
    return ok(res, { privacy });
  } catch (err) {
    return serverError(res, err, "Could not fetch privacy settings");
  }
}

async function updatePrivacy(req, res) {
  try {
    const MESSAGE_OPTS = ["Everyone", "Followers", "No one"];
    const BOOL_FIELDS = ["activityVisible", "watchlistPublic", "profileIndexed"];

    // followPermission has been removed — it is no longer a valid field.
    const { messagePermission } = req.body;

    if (messagePermission && !MESSAGE_OPTS.includes(messagePermission))
      return fail(res, `messagePermission must be one of: ${MESSAGE_OPTS.join(", ")}`);

    for (const f of BOOL_FIELDS) {
      if (req.body[f] !== undefined && typeof req.body[f] !== "boolean")
        return fail(res, `'${f}' must be a boolean`);
    }

    const privacy = await settingsModel.updatePrivacy(req.user.id, req.body);
    return ok(res, { privacy });
  } catch (err) {
    return serverError(res, err, "Could not update privacy settings");
  }
}

// ─── ACCOUNT LIFECYCLE ────────────────────────────────────────────────────────
//
// REMOVED: deleteAccount — hard deletion is no longer supported.
//          Use deactivateAccount for soft-deactivation (data is always preserved).
//
// Deactivation flow (enforced at login in auth.controller.js):
//   • Deactivated + within 60 days  → auto-reactivate on next login
//   • Deactivated + beyond 60 days  → login blocked (403), data preserved
//
// ─────────────────────────────────────────────────────────────────────────────

async function deactivateAccount(req, res) {
  try {
    const result = await settingsModel.deactivateAccount(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not deactivate account");
  }
}

async function reactivateAccount(req, res) {
  try {
    const result = await settingsModel.reactivateAccount(req.user.id);
    return ok(res, result);
  } catch (err) {
    return serverError(res, err, "Could not reactivate account");
  }
}

// deleteAccount has been removed. Hard deletion is not supported.
// All deactivation is soft (data preserved). See deactivateAccount above.

module.exports = {
  // Account
  getAccount,
  updateProfile,
  // Password
  changePassword,
  // Connected accounts
  getConnectedAccounts,
  unlinkProvider,
  // Two-factor auth
  getTwoFactor,
  disableTwoFactor,
  prepareTwoFactorEnroll,
  // Avatar presets
  getAvatarPresets,
  // Blocked users
  getBlockedUsers,
  blockUser,
  unblockUser,
  // Watch history
  getWatchHistory,
  clearWatchHistory,
  deleteWatchHistoryItem,
  // Sessions
  getSessions,
  pingSession,
  revokeSession,
  revokeAllOtherSessions,
  // Data export
  exportUserData,
  getExportUrl,
  // Preferences
  getPreferences,
  updatePreferences,
  // Modules
  getModules,
  updateModules,
  // Privacy
  getPrivacy,
  updatePrivacy,
  // Account lifecycle
  deactivateAccount,
  reactivateAccount,
  // deleteAccount — removed; hard deletion is not supported
};

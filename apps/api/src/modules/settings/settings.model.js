// src/modules/settings/settings.model.js
const { supabase } = require("../../configs/supabase");

// ─── helpers ──────────────────────────────────────────────────────────────────

function assertNoError({ error, data }, label) {
  if (error) throw Object.assign(new Error(error.message), { label, code: error.code });
  return data;
}

// ─── ACCOUNT ──────────────────────────────────────────────────────────────────

async function getProfile(userId) {
  const res = await supabase
    .from("profiles")
    .select(
      "id, name, display_name, username, bio, avatar_url, avatar_preset, gradient, initials, " +
        "email, preferences, modules, privacy, is_deactivated, deactivated_at, created_at, updated_at"
    )
    .eq("id", userId)
    .maybeSingle();
  const data = assertNoError(res, "getProfile");
  if (data) {
    data.name = data.name || data.display_name || null;
  }
  return data;
}

async function updateProfile(userId, fields) {
  const ALLOWED = [
    "name",
    "display_name",
    "username",
    "bio",
    "avatar_url",
    "avatar_preset",
    "initials",
    "gradient",
  ];
  const payload = Object.fromEntries(
    Object.entries(fields).filter(([k, v]) => ALLOWED.includes(k) && v !== undefined)
  );
  // Keep display_name in sync with name
  if (payload.name !== undefined) {
    payload.display_name = payload.name;
  }
  if (!Object.keys(payload).length) throw new Error("No valid fields to update");

  const res = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, name, username, bio, avatar_url, avatar_preset, gradient, initials")
    .single();
  return assertNoError(res, "updateProfile");
}

async function isUsernameTaken(username, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

async function changePassword(userId, currentPassword, newPassword, supabaseAdmin) {
  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userErr) throw new Error(userErr.message);

  const email = userData.user.email;
  if (!email) throw new Error("Account has no email — cannot verify current password");

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (signInErr) {
    throw Object.assign(new Error("Current password is incorrect"), {
      code: "INVALID_CURRENT_PASSWORD",
    });
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
  return { updated: true, userId: data.user.id };
}

// ─── CONNECTED ACCOUNTS ───────────────────────────────────────────────────────

async function getConnectedAccounts(userId, supabaseAdmin) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) throw new Error(error.message);

  return (data.user.identities ?? []).map((id) => ({
    provider: id.provider,
    identity_id: id.id,
    email: id.identity_data?.email ?? null,
    created_at: id.created_at,
  }));
}

async function unlinkProvider(userId, identityId, supabaseAdmin) {
  const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userErr) throw new Error(userErr.message);

  const identities = userData.user.identities ?? [];
  const hasPassword = !!(
    userData.user.encrypted_password && userData.user.encrypted_password !== ""
  );
  const isLastIdentity = identities.length <= 1;

  if (isLastIdentity && !hasPassword) {
    throw Object.assign(
      new Error(
        "Cannot unlink the only sign-in method. Set a password first, or connect another account."
      ),
      { code: "LAST_IDENTITY" }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUserIdentity(userId, identityId);
  if (error) throw new Error(error.message);
  return { unlinked: true, identityId };
}

// ─── TWO-FACTOR AUTHENTICATION ────────────────────────────────────────────────

async function getTwoFactorStatus(userId, supabaseAdmin) {
  const { data, error } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId });
  if (error) throw new Error(error.message);

  const factors = data?.factors ?? [];
  const totpFactor = factors.find((f) => f.factor_type === "totp" && f.status === "verified");

  return {
    enabled: !!totpFactor,
    factor_id: totpFactor?.id ?? null,
    enrolled_at: totpFactor?.created_at ?? null,
    all_factors: factors.map((f) => ({
      id: f.id,
      type: f.factor_type,
      status: f.status,
      friendly_name: f.friendly_name ?? null,
      created_at: f.created_at,
    })),
  };
}

async function clearUnverifiedFactors(userId, supabaseAdmin) {
  const { data, error } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId });
  if (error) throw new Error(error.message);

  const factors = data?.factors ?? [];
  const unverified = factors.filter((f) => f.status === "unverified");

  for (const factor of unverified) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
      userId,
      id: factor.id,
    });
    if (deleteError) throw new Error(deleteError.message);
  }

  return {
    cleared: unverified.length,
    message:
      unverified.length > 0
        ? `Cleared ${unverified.length} unverified factor(s)`
        : "No unverified factors found",
  };
}

async function disableTwoFactor(userId, factorId, supabaseAdmin) {
  const { error } = await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId, id: factorId });
  if (error) throw new Error(error.message);
  return { disabled: true, factorId };
}

// ─── AVATAR PRESETS ───────────────────────────────────────────────────────────

async function getAvatarPresets() {
  const res = await supabase.from("avatars").select("id, url").order("id", { ascending: true });
  return assertNoError(res, "getAvatarPresets");
}

// ─── BLOCKED ACCOUNTS ─────────────────────────────────────────────────────────

async function getBlockedUsers(userId) {
  const res = await supabase
    .from("blocked_users")
    .select(
      `
      id,
      created_at,
      blocked:profiles!blocked_users_blocked_fkey (
        id, name, username, avatar_url, gradient, initials
      )
    `
    )
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });
  return assertNoError(res, "getBlockedUsers");
}

async function blockUser(blockerId, blockedId) {
  if (blockerId === blockedId) throw new Error("Cannot block yourself");
  const res = await supabase
    .from("blocked_users")
    .insert({ blocker_id: blockerId, blocked_id: blockedId })
    .select("id, blocker_id, blocked_id, created_at")
    .single();
  return assertNoError(res, "blockUser");
}

async function unblockUser(blockerId, blockedId) {
  const res = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId)
    .select("id")
    .single();
  return assertNoError(res, "unblockUser");
}

// ─── WATCH HISTORY ────────────────────────────────────────────────────────────

async function getWatchHistory(userId, { limit = 50, offset = 0 } = {}) {
  const res = await supabase
    .from("watch_history")
    .select("id, movie_id, movie_title, poster_url, watched_at, progress")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return assertNoError(res, "getWatchHistory");
}

async function clearWatchHistory(userId) {
  const res = await supabase.from("watch_history").delete().eq("user_id", userId).select("id");
  const rows = assertNoError(res, "clearWatchHistory");
  return { deleted: rows.length };
}

async function deleteWatchHistoryItem(userId, itemId) {
  const { data, error } = await supabase
    .from("watch_history")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) throw Object.assign(new Error(error.message), { code: error.code });
  if (!data) throw Object.assign(new Error("History item not found"), { code: "NOT_FOUND" });
  return { deleted: true, id: data.id };
}

// ─── ACTIVE SESSIONS ──────────────────────────────────────────────────────────

async function getSessions(userId) {
  const res = await supabase
    .from("user_sessions")
    .select("id, session_label, ip_address, last_active, created_at, is_current")
    .eq("user_id", userId)
    .order("last_active", { ascending: false });
  return assertNoError(res, "getSessions");
}

async function upsertSession(userId, sessionId, { label, ip } = {}) {
  const res = await supabase
    .from("user_sessions")
    .upsert(
      {
        id: sessionId,
        user_id: userId,
        session_label: label ?? "Unknown device",
        ip_address: ip ?? null,
        last_active: new Date().toISOString(),
        is_current: true,
      },
      { onConflict: "id" }
    )
    .select("id, session_label, last_active, is_current")
    .single();
  return assertNoError(res, "upsertSession");
}

async function revokeSession(userId, sessionId, supabaseAdmin) {
  await supabase.from("user_sessions").delete().eq("id", sessionId).eq("user_id", userId);

  const { error } = await supabaseAdmin.auth.admin.signOut(sessionId, "local");
  if (error) throw new Error(error.message);
  return { revoked: true, sessionId };
}

async function revokeAllOtherSessions(userId, currentSessionId, supabaseAdmin) {
  await supabase.from("user_sessions").delete().eq("user_id", userId).neq("id", currentSessionId);

  const { error } = await supabaseAdmin.auth.admin.signOut(currentSessionId, "others");
  if (error) throw new Error(error.message);
  return { revoked: true };
}

// ─── DOWNLOAD MY DATA ─────────────────────────────────────────────────────────

async function exportUserData(userId, supabaseAdmin) {
  const [
    profileRes,
    historyRes,
    blockedRes,
    postsRes,
    commentsRes,
    reactionsRes,
    gossipRes,
    memesRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("watch_history").select("*").eq("user_id", userId),
    supabase.from("blocked_users").select("*").eq("blocker_id", userId),
    supabase.from("posts").select("*").eq("user_id", userId),
    supabase.from("comments").select("*").eq("user_id", userId),
    supabase.from("reactions").select("*").eq("user_id", userId),
    supabase.from("gossips").select("*").eq("user_id", userId),
    supabase.from("memes").select("*").eq("created_by", userId),
  ]);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    user_id: userId,
    profile: profileRes.data ?? {},
    watch_history: historyRes.data ?? [],
    blocked_users: blockedRes.data ?? [],
    posts: postsRes.data ?? [],
    comments: commentsRes.data ?? [],
    reactions: reactionsRes.data ?? [],
    gossips: gossipRes.data ?? [],
    memes: memesRes.data ?? [],
  };

  const filePath = `exports/${userId}/data.json`;
  const fileContent = JSON.stringify(exportPayload, null, 2);

  const { error: uploadError } = await supabaseAdmin.storage
    .from("user-data-exports")
    .upload(filePath, fileContent, { contentType: "application/json", upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("user-data-exports")
    .createSignedUrl(filePath, 3600);
  if (signedError) throw new Error(signedError.message);

  return {
    download_url: signedData.signedUrl,
    expires_in: 3600,
    exported_at: exportPayload.exported_at,
  };
}

async function getExistingExport(userId, supabaseAdmin) {
  const dirPath = `exports/${userId}`;
  const fileName = "data.json";

  const { data: listData, error: listError } = await supabaseAdmin.storage
    .from("user-data-exports")
    .list(dirPath, { search: fileName });

  if (listError) throw new Error(listError.message);

  const fileExists = Array.isArray(listData) && listData.some((f) => f.name === fileName);
  if (!fileExists) {
    throw Object.assign(new Error("No export found. Please generate one first."), {
      code: "NOT_FOUND",
    });
  }

  const filePath = `${dirPath}/${fileName}`;
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from("user-data-exports")
    .createSignedUrl(filePath, 3600);

  if (signedError) throw new Error(signedError.message);

  return {
    download_url: signedData.signedUrl,
    expires_in: 3600,
  };
}

// ─── PREFERENCES ──────────────────────────────────────────────────────────────
//
// spoilerProtection and autoSpoilerHide are no longer accepted in patches.
// Any existing stored values are cleaned up via the DB migration.
//
// matureContent is accepted if sent but its enforcement is DISABLED —
// the key is stored but nothing reads it to gate content yet.
// To re-enable: uncomment the matureContent line in the controller validator
// and add enforcement logic to the content-serving modules.
//
// ─────────────────────────────────────────────────────────────────────────────

async function getPreferences(userId) {
  const res = await supabase.from("profiles").select("preferences").eq("id", userId).single();
  return assertNoError(res, "getPreferences").preferences;
}

async function updatePreferences(userId, patch) {
  // Strip removed keys from any incoming patch so they can never be re-inserted
  const {
    spoilerProtection: _sp, // eslint-disable-line no-unused-vars
    autoSpoilerHide: _ash, // eslint-disable-line no-unused-vars
    ...safePatch
  } = patch;

  const current = await getPreferences(userId);

  // Also strip removed keys from the current stored value during merge
  const {
    spoilerProtection: _csp, // eslint-disable-line no-unused-vars
    autoSpoilerHide: _cash, // eslint-disable-line no-unused-vars
    ...cleanCurrent
  } = current ?? {};

  const merged = {
    ...cleanCurrent,
    ...safePatch,
    notifications: {
      ...(cleanCurrent.notifications ?? {}),
      ...(safePatch.notifications ?? {}),
    },
  };

  const res = await supabase
    .from("profiles")
    .update({ preferences: merged })
    .eq("id", userId)
    .select("preferences")
    .single();
  return assertNoError(res, "updatePreferences").preferences;
}

// ─── MODULES ──────────────────────────────────────────────────────────────────

async function getModules(userId) {
  const res = await supabase.from("profiles").select("modules").eq("id", userId).single();
  return assertNoError(res, "getModules").modules;
}

async function updateModules(userId, patch) {
  const current = await getModules(userId);
  // `core` is always true — cannot be toggled off.
  const merged = { ...current, ...patch, core: true };
  const res = await supabase
    .from("profiles")
    .update({ modules: merged })
    .eq("id", userId)
    .select("modules")
    .single();
  return assertNoError(res, "updateModules").modules;
}

// ─── PRIVACY ──────────────────────────────────────────────────────────────────
//
// followPermission has been removed from ALLOWED_KEYS.
// The field will be ignored if sent by a client and will never be written.
// The legacy profiles.follow_permission column (separate from the JSONB field)
// can be dropped via migration when convenient.
//
// ─────────────────────────────────────────────────────────────────────────────

async function getPrivacy(userId) {
  const res = await supabase.from("profiles").select("privacy").eq("id", userId).single();
  return assertNoError(res, "getPrivacy").privacy;
}

async function updatePrivacy(userId, patch) {
  // followPermission is intentionally excluded from ALLOWED_KEYS
  const ALLOWED_KEYS = [
    "messagePermission",
    "activityVisible",
    "watchlistPublic",
    "profileIndexed",
  ];
  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(([k]) => ALLOWED_KEYS.includes(k))
  );
  if (!Object.keys(safePatch).length) throw new Error("No valid privacy fields to update");
  const current = await getPrivacy(userId);
  const merged = { ...current, ...safePatch };
  const res = await supabase
    .from("profiles")
    .update({ privacy: merged })
    .eq("id", userId)
    .select("privacy")
    .single();
  return assertNoError(res, "updatePrivacy").privacy;
}

// ─── ACCOUNT LIFECYCLE ────────────────────────────────────────────────────────

async function deactivateAccount(userId) {
  const res = await supabase
    .from("profiles")
    .update({ is_deactivated: true, deactivated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("id, is_deactivated, deactivated_at")
    .single();
  return assertNoError(res, "deactivateAccount");
}

async function reactivateAccount(userId) {
  const res = await supabase
    .from("profiles")
    .update({ is_deactivated: false, deactivated_at: null })
    .eq("id", userId)
    .select("id, is_deactivated")
    .single();
  return assertNoError(res, "reactivateAccount");
}

// deleteAccount has been removed.
// Hard deletion of user accounts is not supported.
// All account termination is handled via soft deactivation.
// Data is always preserved in the database.

module.exports = {
  // Account
  getProfile,
  updateProfile,
  isUsernameTaken,
  // Password
  changePassword,
  // Connected accounts
  getConnectedAccounts,
  unlinkProvider,
  // Two-factor auth
  getTwoFactorStatus,
  disableTwoFactor,
  clearUnverifiedFactors,
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
  upsertSession,
  revokeSession,
  revokeAllOtherSessions,
  // Data export
  exportUserData,
  getExistingExport,
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

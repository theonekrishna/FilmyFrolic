import { privateAxios } from "../../../utils/AxiosInstance";

const BASE_URL = "/api/settings";
const API_BASE = "/api";

// Response interceptor to handle both { success: true, data: ... } and direct data formats
const handleResponse = (response) => {
  const result = response.data;
  if (result && typeof result === "object" && result.success && "data" in result) {
    return result.data;
  }
  return result;
};

// Error handler for API errors
const handleError = (error) => {
  if (error.response) {
    const contentType = error.response.headers?.["content-type"];
    if (contentType && contentType.includes("text/html")) {
      console.error("API returned HTML instead of JSON");
      throw new Error(
        `Route not found (${error.response.status}): The API endpoint does not exist on the backend.`
      );
    }
    const errorData = error.response.data;
    throw new Error(
      errorData?.message || errorData?.error || `API Error: ${error.response.status}`
    );
  }
  throw error;
};

export const settingsService = {
  // ============================================================
  // ACCOUNT  (endpoints 1–10)
  // ============================================================

  // 1. GET /api/settings/account
  // Returns: { profile: { id, name, username, bio, avatar_url, avatar_preset,
  //            gradient, initials, email, preferences, modules, privacy,
  //            is_deactivated, deactivated_at, created_at, updated_at } }
  getAccount: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/account`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 2. PATCH /api/settings/account/profile
  // Body (all optional): name, username, bio, avatar_url, avatar_preset,
  //                      initials, gradient
  // Returns: { profile: { id, name, username, bio, avatar_url,
  //            avatar_preset, gradient, initials } }
  updateProfile: async (data) => {
    try {
      console.log("Updating profile with data:", data);
      const response = await privateAxios.patch(`${BASE_URL}/account/profile`, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 3. POST /api/settings/account/password
  // Body: { currentPassword, newPassword }
  // Rate limited: 5 requests / 15 min
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/account/password`, {
        currentPassword,
        newPassword,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 8. POST /api/settings/account/deactivate
  deactivateAccount: async () => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/account/deactivate`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 9. POST /api/settings/account/reactivate
  reactivateAccount: async () => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/account/reactivate`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 10. DELETE /api/settings/account
  // Rate limited: 3 requests / 24 hours
  deleteAccount: async () => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/account`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // SECURITY — CONNECTED ACCOUNTS & 2FA  (endpoints 4–7)
  // ============================================================

  // 4. GET /api/settings/account/connected
  // Returns: { accounts: [{ provider, identity_id, email, created_at }] }
  getConnectedAccounts: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/account/connected`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 5. DELETE /api/settings/account/connected/:identityId
  // identityId comes from getConnectedAccounts → accounts[n].identity_id
  unlinkOAuthProvider: async (identityId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/account/connected/${identityId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /api/settings/account/2fa/prepare
  // Must be called before supabase.auth.mfa.enroll() to clean up any stale
  // "unverified" TOTP factors left behind when a user previously opened the
  // 2FA setup modal but closed it without completing verification.
  // Supabase rejects a new enroll() call if an unverified factor already exists,
  // so this endpoint deletes it server-side first.
  // Returns: { cleaned: true } or { cleaned: false } (no factor to clean up)
  prepare2FA: async () => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/account/2fa/prepare`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 6. GET /api/settings/account/2fa
  // Returns: { enabled, factor_id, enrolled_at, all_factors }
  // NOTE: Enrolling 2FA is handled client-side via supabase.auth.mfa.enroll —
  //       this endpoint only reads status.
  get2FAStatus: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/account/2fa`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 7. DELETE /api/settings/account/2fa/:factorId
  // factorId comes from get2FAStatus → factor_id or all_factors[n].id
  disable2FA: async (factorId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/account/2fa/${factorId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // AVATAR PRESETS  (endpoint 11)
  // ============================================================

  // 11. GET /api/settings/avatars
  // Returns: { avatars: [{ id, url }] }
  getAvatars: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/avatars`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Upload a custom avatar image (multipart/form-data)
  // Endpoint: PATCH /api/profile/me/avatar/upload  (outside /api/settings)
  // Accepted: image/jpeg, image/png, image/webp — max 2 MB
  // Returns: { avatar_url }
  uploadAvatarFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await privateAxios.patch(`${API_BASE}/profile/me/avatar/upload`, formData, {
        headers: {
          // Do NOT set Content-Type — the browser sets it with the correct boundary
          "Content-Type": undefined,
        },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // SESSIONS  (endpoints 18–21)
  // ============================================================

  // 18. GET /api/settings/sessions
  // Returns: { sessions: [{ id, session_label, ip_address, last_active,
  //            created_at, is_current }] }
  getSessions: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/sessions`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 19. POST /api/settings/sessions/ping
  // Body: { sessionId, label }  — call on app boot + every 5 min heartbeat
  // Returns: { id, session_label, last_active, is_current }
  pingSession: async (sessionId, label) => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/sessions/ping`, {
        sessionId,
        label,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 20. DELETE /api/settings/sessions/:sessionId
  // Returns: { revoked: true, sessionId }
  revokeSession: async (sessionId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/sessions/${sessionId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 21. DELETE /api/settings/sessions
  // Body: { currentSessionId }  — keeps current session, revokes all others
  revokeAllSessions: async (currentSessionId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/sessions`, {
        data: { currentSessionId },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // PREFERENCES  (endpoints 24–25)
  // ============================================================

  // 24. GET /api/settings/preferences
  // Returns: { preferences: { language, contentRating, spoilerProtection,
  //            autoSpoilerHide, matureContent,
  //            notifications: { newReleases, reviews, discussions,
  //                             liveRooms, weeklyDigest } } }
  getPreferences: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/preferences`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 25. PATCH /api/settings/preferences
  // Body (all optional): language, contentRating, spoilerProtection,
  //   autoSpoilerHide, matureContent, notifications (deep-merged on server)
  // Allowed language values:  "English (US)" | "English (UK)" | "Spanish" |
  //                            "French" | "Japanese"
  // Allowed contentRating:    "All ages" | "PG-13 & below" | "PG & below" |
  //                            "G only"
  updatePreferences: async (updates) => {
    try {
      const response = await privateAxios.patch(`${BASE_URL}/preferences`, updates);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // MODULES  (endpoints 26–27)
  // ============================================================

  // 26. GET /api/settings/modules
  // Returns: { modules: { core, social, content, entertain, user } }
  // Note: core is always true and cannot be disabled.
  getModulesConfig: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/modules`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 27. PATCH /api/settings/modules
  // Body (all optional): social, content, entertain, user  — all boolean
  // Note: sending core: false is silently ignored server-side.
  // Returns: { modules: { core, social, content, entertain, user } }
  updateModulesConfig: async (updates) => {
    try {
      const response = await privateAxios.patch(`${BASE_URL}/modules`, updates);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // PRIVACY  (endpoints 28–29)
  // ============================================================

  // 28. GET /api/settings/privacy
  // Returns: { privacy: { followPermission, messagePermission,
  //            activityVisible, watchlistPublic, profileIndexed } }
  // Allowed followPermission:  "Everyone" | "Friends of friends" | "No one"
  // Allowed messagePermission: "Everyone" | "Followers" | "No one"
  getPrivacy: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/privacy`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 29. PATCH /api/settings/privacy
  // Body (all optional): followPermission, messagePermission,
  //   activityVisible, watchlistPublic, profileIndexed
  // Settings are merged with existing values on the server.
  updatePrivacy: async (updates) => {
    try {
      const response = await privateAxios.patch(`${BASE_URL}/privacy`, updates);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // BLOCKED USERS  (endpoints 12–14)
  // ============================================================

  // 12. GET /api/settings/blocked
  // Returns: { blocked: [{ id, created_at,
  //            blocked: { id, name, username, avatar_url, gradient, initials } }],
  //            count }
  getBlockedUsers: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/blocked`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // User search — used by BlockedUsersPage to find users before blocking.
  // This is NOT part of the /api/settings namespace; it reuses the messages
  // search endpoint as a workaround until a dedicated /api/users/search exists.
  // The response shape varies: may return users, conversations, or data arrays.
  searchUsers: async (query) => {
    try {
      const response = await privateAxios.get(`${API_BASE}/messages/search`, {
        params: { q: query },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 13. POST /api/settings/blocked
  // Body: { userId }
  // Returns: { id, blocker_id, blocked_id, created_at }
  // Errors: 409 if already blocked
  blockUser: async (userId) => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/blocked`, {
        userId,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 14. DELETE /api/settings/blocked/:userId
  // userId = the ID of the user to unblock (same ID used when blocking)
  unblockUser: async (userId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/blocked/${userId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // WATCH HISTORY  (endpoints 15–17)
  // ============================================================

  // 15. GET /api/settings/history?limit=&offset=
  // Defaults: limit=50, max=200, offset=0
  // Returns: { history: [{ id, movie_id, movie_title, poster_url,
  //            watched_at, progress }], limit, offset }
  getWatchHistory: async (limit = 20, offset = 0) => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/history`, {
        params: { limit, offset },
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 16. DELETE /api/settings/history/:itemId
  // Returns: { deleted: true, id }
  // Error 404 if item not found or not owned by user
  deleteHistoryRecord: async (historyId) => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/history/${historyId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 17. DELETE /api/settings/history
  // Returns: { deleted: <count> }
  clearAllHistory: async () => {
    try {
      const response = await privateAxios.delete(`${BASE_URL}/history`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============================================================
  // DATA EXPORT  (endpoints 22–23)
  // ============================================================

  // 22. POST /api/settings/data/export
  // Compiles all user data into a JSON file and returns a signed URL.
  // Rate limited: 3 requests / hour
  // Returns: { download_url, expires_in: 3600, exported_at }
  exportData: async () => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/data/export`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // 23. GET /api/settings/data/export
  // Returns a fresh signed URL for an already-generated export.
  // Returns 404 if no export exists yet — call exportData() (POST) first.
  // Returns: { download_url, expires_in: 3600 }
  getDataExportUrl: async () => {
    try {
      const response = await privateAxios.get(`${BASE_URL}/data/export`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // After changePassword method, add:

  // POST /api/settings/account/password/set
  // Body: { newPassword }
  // Use when hasPassword === false (Google-only accounts setting password for first time)
  // Returns 409 if account already has a password — use changePassword() instead
  setPassword: async (newPassword) => {
    try {
      const response = await privateAxios.post(`${BASE_URL}/account/password/set`, {
        newPassword,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

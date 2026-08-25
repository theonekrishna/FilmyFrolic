import { privateAxios } from "../../../utils/AxiosInstance.jsx";

// ─── Response Normalizer ────────────────────────────────────────────────────
const handleResponse = (response) => {
  const result = response?.data;
  if (result && typeof result === "object" && result.success === true) {
    if ("data" in result) return result.data;
  }
  return result ?? [];
};

// ─── 1. Latest / All Admin Notifications ────────────────────────────────────
// GET /api/admin/notifications/latest?limit=20
export const fetchLatestNotifications = async (limit = 20) => {
  try {
    const res = await privateAxios.get(`/api/admin/notifications/latest`, {
      params: { limit },
    });
    return handleResponse(res);
  } catch (error) {
    console.error("[notificationService] fetchLatestNotifications error:", error);
    throw error;
  }
};

// ─── 2. Warning Notifications ────────────────────────────────────────────────
// GET /api/admin/moderation/warnings
export const fetchWarningNotifications = async () => {
  try {
    const res = await privateAxios.get(`/api/admin/moderation/warnings`);
    return handleResponse(res);
  } catch (error) {
    console.error("[notificationService] fetchWarningNotifications error:", error);
    throw error;
  }
};

// ─── 3. Removed Content Notifications ────────────────────────────────────────
// GET /api/admin/moderation/removed-notifications
export const fetchRemovedNotifications = async () => {
  try {
    const res = await privateAxios.get(`/api/admin/moderation/removed-notifications`);
    return handleResponse(res);
  } catch (error) {
    console.error("[notificationService] fetchRemovedNotifications error:", error);
    throw error;
  }
};

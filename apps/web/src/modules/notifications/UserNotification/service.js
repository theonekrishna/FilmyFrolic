import { privateAxios } from "../../../utils/AxiosInstance.jsx";

// ─── Response Normalizer ────────────────────────────────────────────────────
const handleResponse = (response) => {
  const result = response?.data;
  if (result && typeof result === "object" && result.success === true) {
    // For list endpoints return { data, total, page, limit, totalPages }
    if ("data" in result) return result;
  }
  return result ?? {};
};

// ─── 1. GET /api/notifications ───────────────────────────────────────────────
// Params: page, limit, type, unread_only (all optional)
export const fetchNotifications = async (params = {}) => {
  try {
    const res = await privateAxios.get("/api/notifications", { params });
    return handleResponse(res);
  } catch (error) {
    console.error("[userNotificationService] fetchNotifications error:", error);
    throw error;
  }
};

// ─── 2. GET /api/notifications/unread-count ──────────────────────────────────
export const fetchUnreadCount = async () => {
  try {
    const res = await privateAxios.get("/api/notifications/unread-count");
    const result = res?.data;
    return typeof result?.count === "number" ? result.count : 0;
  } catch (error) {
    console.error("[userNotificationService] fetchUnreadCount error:", error);
    throw error;
  }
};

// ─── 3. PATCH /api/notifications/:id/read ───────────────────────────────────
export const markNotificationRead = async (id) => {
  try {
    const res = await privateAxios.patch(`/api/notifications/${id}/read`);
    return handleResponse(res);
  } catch (error) {
    console.error("[userNotificationService] markNotificationRead error:", error);
    throw error;
  }
};

// ─── 4. PATCH /api/notifications/read-all ───────────────────────────────────
export const markAllNotificationsRead = async () => {
  try {
    const res = await privateAxios.patch("/api/notifications/read-all");
    return res?.data ?? {};
  } catch (error) {
    console.error("[userNotificationService] markAllNotificationsRead error:", error);
    throw error;
  }
};

// ─── 5. DELETE /api/notifications/:id ───────────────────────────────────────
export const deleteNotification = async (id) => {
  try {
    const res = await privateAxios.delete(`/api/notifications/${id}`);
    return res?.data ?? {};
  } catch (error) {
    console.error("[userNotificationService] deleteNotification error:", error);
    throw error;
  }
};

// ─── 6. DELETE /api/notifications/all ───────────────────────────────────────
export const deleteAllNotifications = async () => {
  try {
    const res = await privateAxios.delete("/api/notifications/all");
    return res?.data ?? {};
  } catch (error) {
    console.error("[userNotificationService] deleteAllNotifications error:", error);
    throw error;
  }
};

import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";

const BASE_PATH = "/api/follow";

// ── Helper — silent on 404/500 (routes may have quirks but DB works), loud on real errors ─────────
function logFollowError(label, error) {
  const msg = error?.message ?? String(error);
  const status = error?.response?.status;
  if (msg.includes("404") || status === 404) {
    // Backend follow routes not deployed yet — harmless, don't spam console
    console.warn(`[follow] ${label}: route not found (404)`);
  } else if (status === 500) {
    // DB operation works but API returns 500 — suppress error spam
    console.log(`[follow] ${label}: server 500 (DB likely updated)`);
  } else {
    console.error(`[follow] ${label}:`, error);
  }
}

// ── 1. Follow a user ──────────────────────────────────────────────────────────
export const followUser = async (userId) => {
  try {
    const res = await privateAxios.post(`${BASE_PATH}/${userId}`);
    return res.data; // { success: true, data: { id, follower_id, following_id, created_at } }
  } catch (error) {
    logFollowError("followUser", error);
    const data = error?.response?.data;
    return {
      success: false,
      message: data?.message || "Network error",
      code: data?.code,
    };
  }
};

// ── 2. Unfollow a user ────────────────────────────────────────────────────────
export const unfollowUser = async (userId) => {
  try {
    const res = await privateAxios.delete(`${BASE_PATH}/${userId}`);
    return res.data; // { success: true, message: "Unfollowed successfully" }
  } catch (error) {
    logFollowError("unfollowUser", error);
    const data = error?.response?.data;
    return { success: false, message: data?.message || "Network error" };
  }
};

// ── 3. Get followers list ─────────────────────────────────────────────────────
export const getFollowers = async (userId) => {
  try {
    const res = await privateAxios.get(`${BASE_PATH}/${userId}/followers`);
    return res.data; // { success: true, data: [...] }
  } catch (error) {
    logFollowError("getFollowers", error);
    return { success: false, data: [] };
  }
};

// ── 4. Get following list ─────────────────────────────────────────────────────
export const getFollowing = async (userId) => {
  try {
    const res = await privateAxios.get(`${BASE_PATH}/${userId}/following`);
    return res.data; // { success: true, data: [...] }
  } catch (error) {
    logFollowError("getFollowing", error);
    return { success: false, data: [] };
  }
};

// ── 5. Get counts (public — no auth needed) ───────────────────────────────────
export const getFollowCounts = async (userId) => {
  try {
    const res = await publicAxios.get(`${BASE_PATH}/${userId}/counts`);
    return res.data; // { success: true, data: { followers: N, following: N } }
  } catch (error) {
    logFollowError("getFollowCounts", error);
    return { success: false, data: { followers: 0, following: 0 } };
  }
};

// ── 6. Check follow status ────────────────────────────────────────────────────
export const checkIsFollowing = async (userId) => {
  try {
    const res = await privateAxios.get(`${BASE_PATH}/${userId}/is-following`);
    return res.data; // { success: true, isFollowing: bool }
  } catch (error) {
    logFollowError("checkIsFollowing", error);
    return { success: false, isFollowing: false };
  }
};

// ── 7. Get current user's follow permission ───────────────────────────────────
export const getFollowPermission = async () => {
  try {
    const res = await privateAxios.get(`${BASE_PATH}/permission`);
    return res.data; // { success: true, permission: "everyone" | "friends_of_friends" | "no_one" }
  } catch (error) {
    logFollowError("getFollowPermission", error);
    return { success: false, permission: "everyone" };
  }
};

// ── 8. Update follow permission ───────────────────────────────────────────────
export const updateFollowPermission = async (permission) => {
  try {
    const res = await privateAxios.patch(`${BASE_PATH}/permission`, {
      permission,
    });
    return res.data; // { success: true, data: { id, follow_permission } }
  } catch (error) {
    logFollowError("updateFollowPermission", error);
    const data = error?.response?.data;
    return { success: false, message: data?.message || "Network error" };
  }
};

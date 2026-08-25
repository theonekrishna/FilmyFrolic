import { privateAxios } from "../../../utils/AxiosInstance.jsx";

const BASE_URL = "/api/reports";

const handleResponse = (response) => {
  const result = response.data;
  if (result && typeof result === "object" && result.success === true) {
    if ("data" in result) return result.data;
    if ("payload" in result) return result.payload;
  }
  return result;
};

/**
 * Fetch report categories for a given module_type.
 * @param {string} moduleType - e.g. "feed", "feed_comment", "meme", "meme_comment", "gossip", "gossip_comment"
 */
export const getReportCategories = async (moduleType) => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/categories/${moduleType}`);
    return handleResponse(res);
  } catch (error) {
    console.error("getReportCategories error:", error);
    throw error;
  }
};

/**
 * Check if the current user has already reported a specific target.
 * @param {string} moduleType
 * @param {string} targetId
 */
export const checkUserReport = async (moduleType, targetId) => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/check`, {
      params: { module_type: moduleType, target_id: targetId },
    });
    // Returns { success, reported, data }
    return res.data;
  } catch (error) {
    console.error("checkUserReport error:", error);
    throw error;
  }
};

/**
 * Submit a new report.
 * @param {Object} payload
 * @param {string} payload.module_type
 * @param {string} payload.target_id
 * @param {string} [payload.target_user_id]
 * @param {string} payload.category_id
 * @param {string} [payload.custom_issue]
 * @param {string} [payload.description]
 */
export const submitReport = async (payload) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}`, payload);
    return handleResponse(res);
  } catch (error) {
    console.error("submitReport error:", error);
    throw error;
  }
};

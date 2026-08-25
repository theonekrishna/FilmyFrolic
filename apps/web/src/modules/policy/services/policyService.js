import { publicAxios } from "../../../utils/AxiosInstance";

const BASE_URL = "/api/admin/policy/public";

// ── Response helper ───────────────────────────────────────────────────────────
const handleResponse = (response) => {
  const result = response.data;
  if (result && typeof result === "object" && result.success && "data" in result) {
    return result.data;
  }
  return result;
};

// ── Error handler ─────────────────────────────────────────────────────────────
const handleError = (error) => {
  if (error.response) {
    const contentType = error.response.headers?.["content-type"];
    if (contentType && contentType.includes("text/html")) {
      console.error("Policy API returned HTML instead of JSON");
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

// ── Policy Service ────────────────────────────────────────────────────────────
export const policyService = {
  /**
   * GET /api/admin/policy/public/list
   * Returns only title + slug for each active policy.
   * No authentication required.
   * Response: { success: true, data: [{ title, slug }] }
   */
  getPolicyList: async () => {
    try {
      const response = await publicAxios.get(`${BASE_URL}/list`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/admin/policy/public/all
   * Returns all active policies along with their sections.
   * No authentication required.
   * Response: { success: true, data: [{ id, title, slug, description,
   *   icon, color, is_active, sections: [{ id, policy_id, title,
   *   description, sort_order, is_active }] }] }
   */
  getAllPolicies: async () => {
    try {
      const response = await publicAxios.get(`${BASE_URL}/all`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * GET /api/admin/policy/public/:slug
   * Returns a single policy and all associated sections.
   * No authentication required.
   * @param {string} slug  e.g. "privacy-policy"
   * Response: { success: true, data: { id, title, slug, description,
   *   icon, color, is_active, sections: [...] } }
   */
  getPolicyBySlug: async (slug) => {
    try {
      const response = await publicAxios.get(`${BASE_URL}/${slug}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

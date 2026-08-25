import { publicAxios, privateAxios } from "../../../utils/AxiosInstance"; // adjust path if needed

const BASE_PATH = "/api/gossips";

// ==============================
// Helper (optional but clean)
// ==============================
const handleResponse = (res) => res?.data;

// ==============================
// GOSSIP SERVICES
// ==============================

const gossipService = {
  // 🔹 1. Get All Gossips (Public)
  getAllGossips: async (params = {}) => {
    const res = await privateAxios.get(BASE_PATH, { params });
    return handleResponse(res);
  },

  // 🔹 2. Get Breaking Gossips (Public)
  getBreakingGossips: async () => {
    const res = await privateAxios.get(`${BASE_PATH}/breaking`);
    return handleResponse(res);
  },

  // 🔹 3. Get Trending Tags (Public)
  getTrendingTags: async (limit = 7) => {
    const res = await publicAxios.get(`${BASE_PATH}/trending-tags`, {
      params: { limit },
    });
    return handleResponse(res);
  },

  // 🔹 4. Get Single Gossip (Public)
  getGossipById: async (id) => {
    const res = await privateAxios.get(`${BASE_PATH}/${id}`);
    return handleResponse(res);
  },

  // 🔹 5. Create Gossip (Private)
  createGossip: async (data) => {
    const res = await privateAxios.post(BASE_PATH, data);
    return handleResponse(res);
  },

  // 🔹 6. React to Gossip (Private)
  reactToGossip: async (id, reaction) => {
    const res = await privateAxios.post(`${BASE_PATH}/${id}/react`, {
      reaction,
    });
    return handleResponse(res);
  },

  // 🔹 7. Bookmark Gossip (Private)
  toggleBookmark: async (id) => {
    const res = await privateAxios.post(`${BASE_PATH}/${id}/bookmark`);
    return handleResponse(res);
  },

  // 🔹 8. Get Bookmarked Gossips (Private)
  getBookmarkedGossips: async () => {
    const res = await privateAxios.get(`${BASE_PATH}/bookmarked`);
    return handleResponse(res);
  },

  // ==============================
  // COMMENTS
  // ==============================

  // 🔹 Add Comment (Private)
  addComment: async (gossipId, content) => {
    const res = await privateAxios.post(`${BASE_PATH}/${gossipId}/comment`, { content });
    return handleResponse(res);
  },

  // 🔹 Get Comments (Public)
  getComments: async (gossipId) => {
    const res = await publicAxios.get(`${BASE_PATH}/${gossipId}/comments`);
    return handleResponse(res);
  },

  // 🔹 Delete Comment (Private)
  deleteComment: async (commentId) => {
    const res = await privateAxios.delete(`${BASE_PATH}/comment/${commentId}`);
    return handleResponse(res);
  },
};

export default gossipService;

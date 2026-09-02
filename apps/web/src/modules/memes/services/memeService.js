import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";
const BASE_URL = "/api/memes";

// Response wrapper - handles both { success: true, data: ... } and direct data formats
const unwrap = (res) => {
  if (!res) return { success: false, data: null, message: "No response" };
  const data = res.data;
  if (data && typeof data === "object" && "success" in data) {
    return data;
  }
  return { success: true, data };
};

// Error handler
const handleError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Request failed";
  console.error("API Error:", message);
  return { success: false, data: null, message };
};

export const memeService = {
  // ============ FEED ============

  /** Fetch memes feed (hot | new | top | saved) */
  getMemes: async (tab = "hot") => {
    try {
      const axiosClient = tab === "saved" ? privateAxios : publicAxios;
      const res = await axiosClient.get(BASE_URL, { params: { tab } });
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Get trending tags */
  getTrendingTags: async () => {
    try {
      const res = await publicAxios.get(`${BASE_URL}/trending-tags`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Get meme of the week */
  getMemeOfTheWeek: async () => {
    try {
      const res = await publicAxios.get(`${BASE_URL}/meme-of-the-week`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Get top memers */
  getTopMemers: async () => {
    try {
      const res = await publicAxios.get(`${BASE_URL}/top-memers`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============ MEME CRUD ============

  /** Create meme (text or image) */
  createMeme: async (memeData) => {
    try {
      const res = await privateAxios.post(BASE_URL, memeData);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Upload image for meme */
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      console.log("Uploading image to:", `${BASE_URL}/upload-image`);
      console.log("File:", file.name, file.size, file.type);

      // Don't set any headers - let browser set Content-Type with boundary automatically
      const res = await privateAxios.post(`${BASE_URL}/upload-image`, formData);

      console.log("Axios response:", res);
      console.log("res.data:", res.data);

      return unwrap(res);
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      return handleError(error);
    }
  },

  // ============ INTERACTIONS ============

  /** Toggle upvote on meme */
  toggleUpvote: async (memeId) => {
    try {
      const res = await privateAxios.post(`${BASE_URL}/${memeId}/upvote`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Toggle save on meme */
  toggleSave: async (memeId) => {
    try {
      const res = await privateAxios.post(`${BASE_URL}/${memeId}/save`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** React to meme with emoji */
  reactToMeme: async (memeId, emoji) => {
    try {
      const res = await privateAxios.post(`${BASE_URL}/${memeId}/react`, { emoji });
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Share meme (increment share count) */
  shareMeme: async (memeId) => {
    try {
      const res = await privateAxios.post(`${BASE_URL}/${memeId}/share`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============ MEME DETAILS ============

  /** Get single meme by ID */
  getMemeById: async (memeId) => {
    try {
      const res = await publicAxios.get(`${BASE_URL}/${memeId}`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Update meme (owner only) */
  updateMeme: async (memeId, updateData) => {
    try {
      const res = await privateAxios.put(`${BASE_URL}/${memeId}`, updateData);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Delete meme (owner only, soft delete) */
  deleteMeme: async (memeId) => {
    try {
      const res = await privateAxios.delete(`${BASE_URL}/${memeId}`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  // ============ COMMENTS ============

  /** Get comments for a meme (nested + count) */
  getComments: async (memeId) => {
    try {
      const res = await publicAxios.get(`${BASE_URL}/${memeId}/comments`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Add comment to meme or reply to comment */
  addComment: async (memeId, content, parentId = null) => {
    try {
      const body = { content };
      if (parentId) body.parentId = parentId;
      const res = await privateAxios.post(`${BASE_URL}/${memeId}/comments`, body);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },

  /** Delete comment */
  deleteComment: async (memeId, commentId) => {
    try {
      const res = await privateAxios.delete(`${BASE_URL}/${memeId}/comments/${commentId}`);
      return unwrap(res);
    } catch (error) {
      return handleError(error);
    }
  },
};

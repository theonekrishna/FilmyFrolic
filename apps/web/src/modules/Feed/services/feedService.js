import { publicAxios, privateAxios } from "../../../utils/AxiosInstance.jsx";
const BASE_URL = "/api/feeds";
const PROFILE_BASE_URL = "/api/profile";
const COMMUNITIES_BASE_URL = "/api/communities";
const ROOMS_BASE_URL = "/api/rooms";

const handleResponse = (response) => {
  const result = response.data;
  // API returns { success: true, data: ... } or { success: true, payload: ... } format
  if (result && typeof result === "object" && result.success === true) {
    if ("data" in result) return result.data;
    if ("payload" in result) return result.payload;
  }
  return result;
};

// ============ FEED POSTS ============

export const getPostById = async (postId) => {
  try {
    const res = await publicAxios.get(`${BASE_URL}/${postId}`);
    return handleResponse(res);
  } catch (error) {
    console.error("getPostById error:", error);
    throw error;
  }
};

export const getAllPosts = async () => {
  try {
    // Public endpoint - works without token
    const res = await publicAxios.get(`${BASE_URL}/`);
    return handleResponse(res);
  } catch (error) {
    console.error("getAllPosts error:", error);
    throw error;
  }
};

export const getHotFeeds = async (page = 1, limit = 6) => {
  try {
    const res = await publicAxios.get(`/api/feeds/hot`, { params: { page, limit } });
    return handleResponse(res);
  } catch (error) {
    console.error("getHotFeeds error:", error);
    throw error;
  }
};

export const getPopularFeeds = async (page = 1, limit = 6) => {
  try {
    const res = await publicAxios.get(`/api/feeds/popular`, { params: { page, limit } });
    return handleResponse(res);
  } catch (error) {
    console.error("getPopularFeeds error:", error);
    throw error;
  }
};

export const getMostCommentedFeeds = async (page = 1, limit = 6) => {
  try {
    const res = await publicAxios.get(`/api/feeds/most-commented`, { params: { page, limit } });
    return handleResponse(res);
  } catch (error) {
    console.error("getMostCommentedFeeds error:", error);
    throw error;
  }
};

export const createPost = async (content, movieTag = null) => {
  try {
    const body = { content };
    if (movieTag) body.movie_tag = movieTag; // API expects movie_tag field

    const res = await privateAxios.post(`${BASE_URL}/`, body);
    return handleResponse(res);
  } catch (error) {
    console.error("createPost error:", error);
    throw error;
  }
};

export const updatePost = async (postId, content) => {
  try {
    const res = await privateAxios.put(`${BASE_URL}/${postId}`, { content });
    return handleResponse(res);
  } catch (error) {
    // Suppress 403 error logging - DB update works but API returns 403 bug
    if (error.response?.status === 403) {
      console.log("updatePost: 403 received (DB likely updated)");
    } else {
      console.error("updatePost error:", error);
    }
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await privateAxios.delete(`${BASE_URL}/${postId}`);
    return handleResponse(res);
  } catch (error) {
    console.error("deletePost error:", error);
    throw error;
  }
};

// ============ ENGAGEMENT & INTERACTIONS ============

export const reactToPost = async (postId, reaction) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}/${postId}/react`, { reactionType: reaction });
    return handleResponse(res);
  } catch (error) {
    console.error("reactToPost error:", error);
    throw error;
  }
};

export const commentOnPost = async (postId, content) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}/${postId}/comment`, { content });
    return handleResponse(res);
  } catch (error) {
    console.error("commentOnPost error:", error);
    throw error;
  }
};

// ============ BOOKMARKS & SHARING ============

export const toggleSavePost = async (postId) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}/${postId}/save`);
    return handleResponse(res);
  } catch (error) {
    console.error("toggleSavePost error:", error);
    throw error;
  }
};

export const getSavedPosts = async () => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/saved`);
    return handleResponse(res);
  } catch (error) {
    console.error("getSavedPosts error:", error);
    throw error;
  }
};

export const getShareDetails = async (postId) => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/share/${postId}`);
    return handleResponse(res);
  } catch (error) {
    console.error("getShareDetails error:", error);
    throw error;
  }
};

// ============ COMMENTS API ============

export const addComment = async (postId, comment_text, parent_id = null) => {
  try {
    // Validate inputs before making request
    if (!postId) {
      throw new Error("Post ID is required");
    }
    if (!comment_text || typeof comment_text !== "string" || !comment_text.trim()) {
      throw new Error("Comment text is required and cannot be empty");
    }
    if (comment_text.trim().length > 500) {
      throw new Error("Comment text cannot exceed 500 characters");
    }

    const body = {
      content: comment_text.trim(),
      comment_text: comment_text.trim(),
      parentId: parent_id,
      parent_id: parent_id,
    };

    const res = await privateAxios.post(`${BASE_URL}/${postId}/comment`, body);
    return handleResponse(res);
  } catch (error) {
    console.error("addComment error:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);

    // If 400 error, provide more specific error message
    if (error.response?.status === 400) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || "Invalid request";
      throw new Error(`Server rejected comment: ${errorMessage}`);
    }

    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const res = await publicAxios.get(`${BASE_URL}/${postId}/comments`);
    return handleResponse(res);
  } catch (error) {
    console.error("getComments error:", error);
    throw error;
  }
};

export const editComment = async (commentId, comment_text) => {
  try {
    const body = {
      content: comment_text.trim(),
      comment_text: comment_text.trim(),
    };
    const res = await privateAxios.put(`${BASE_URL}/comments/${commentId}`, body);
    return handleResponse(res);
  } catch (error) {
    console.error("editComment error:", error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const res = await privateAxios.delete(`${BASE_URL}/comments/${commentId}`);
    return handleResponse(res);
  } catch (error) {
    console.error("deleteComment error:", error);
    throw error;
  }
};

export const getMyProfile = async () => {
  try {
    const res = await privateAxios.get(`${PROFILE_BASE_URL}/me`);
    return handleResponse(res);
  } catch (error) {
    console.error("getMyProfile error:", error);
    throw error;
  }
};

// ============ COMMUNITIES API ============

export const getFeedCommunities = async () => {
  try {
    const res = await publicAxios.get(`${COMMUNITIES_BASE_URL}`);
    return handleResponse(res);
  } catch (error) {
    console.error("getFeedCommunities error:", error);
    throw error;
  }
};

export const toggleCommunityJoin = async (communityId, isDeparting) => {
  try {
    const res = isDeparting
      ? await privateAxios.delete(`${COMMUNITIES_BASE_URL}/${communityId}/members/toggle`)
      : await privateAxios.post(`${COMMUNITIES_BASE_URL}/${communityId}/members/toggle`);
    return handleResponse(res);
  } catch (error) {
    console.error("toggleCommunityJoin error:", error);
    throw error;
  }
};

// ============ ROOMS API ============

// Helper for retry delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllRooms = async (retries = 2) => {
  try {
    // Auth is optional - works without token too
    const res = await publicAxios.get(`${ROOMS_BASE_URL}`, {
      timeout: 15000, // 15s timeout
    });
    return handleResponse(res);
  } catch (error) {
    // Retry on network errors or 5xx server errors
    const status = error.response?.status;
    const isRetryable = status >= 500 || !error.response || error.code === "ECONNABORTED";

    if (isRetryable && retries > 0) {
      console.warn(
        `getAllRooms failed (status ${status || error.message}), retrying... (${retries} left)`
      );
      await sleep(1000 * (3 - retries)); // 1s, 2s delay
      return getAllRooms(retries - 1);
    }

    console.error("getAllRooms error:", error);
    throw error;
  }
};

export const joinRoom = async (roomId, inviteCode = null) => {
  try {
    const body = { room_id: roomId };
    if (inviteCode) body.invite_code = inviteCode;

    const res = await privateAxios.post(`${ROOMS_BASE_URL}/join`, body);
    // Return raw response (API doesn't use success field)
    return res.data;
  } catch (error) {
    console.error("joinRoom error:", error);
    throw error;
  }
};

// ============ OMDB MOVIE SEARCH ============

// ============ TMDB BACKEND MOVIE SEARCH ============

export const searchMoviesOMDB = async (query) => {
  try {
    if (!query || !query.trim()) {
      return { results: [], all: [] };
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_BASE_URL}/tmdb/search?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.success || !data.data?.results) {
      return { results: [], all: [] };
    }

    const movies = data.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genre: movie.genres || [],
      rating: movie.rating,
      image: movie.poster_url || movie.image,
      source: "tmdb",
    }));

    return {
      results: movies,
      all: movies,
    };
  } catch (error) {
    console.error("TMDB search error:", error);
    return { results: [], all: [] };
  }
};

// Get popular/default movie suggestions from backend TMDB trending
export const getMovieSuggestions = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_BASE_URL}/tmdb/trending`);
    const data = await res.json();

    if (!data.success || !data.data?.results) {
      return [];
    }

    return data.data.results.slice(0, 6).map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      genre: movie.genres || [],
      rating: movie.rating,
      image: movie.poster_url || movie.image,
      source: "tmdb",
    }));
  } catch (error) {
    console.error("TMDB trending error:", error);
    return [];
  }
};

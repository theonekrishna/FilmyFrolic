import { privateAxios, publicAxios } from "../../../utils/AxiosInstance.jsx"; // adjust path if needed

const BASE_URL = "/api/communities";

// helper to normalize API response
const unwrap = (res) => {
  if (!res) return null;
  return res.data?.data || res.data || res;
};

// Helper for exponential backoff retry
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ LOCAL JOIN STATE CACHE ============

const getCacheKey = (userId) => `ff_community_joined_${userId || "guest"}`;

export function getLocalJoinedMap(userId) {
  try {
    return JSON.parse(localStorage.getItem(getCacheKey(userId)) || "{}");
  } catch {
    return {};
  }
}

export function persistLocalJoin(communityId, isJoined, userId) {
  try {
    const map = getLocalJoinedMap(userId);
    if (isJoined) {
      map[communityId] = true;
    } else {
      delete map[communityId];
    }
    localStorage.setItem(getCacheKey(userId), JSON.stringify(map));
  } catch {
    // silently ignore
  }
}

// ============ COMMUNITIES ============

export const getAllCommunities = async () => {
  try {
    // Use privateAxios so auth token is sent - backend needs token to return is_joined status
    const res = await privateAxios.get(BASE_URL);
    return unwrap(res);
  } catch (error) {
    console.error("getAllCommunities error:", error.response?.data || error.message);
    throw error;
  }
};

export const createCommunity = async (payload, retries = 2) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}/create`, payload, {
      timeout: 15000,
    });
    return unwrap(res);
  } catch (error) {
    // Retry on 500/502/503 errors or network errors
    const status = error.response?.status;
    const isRetryable = status >= 500 || !error.response;

    if (isRetryable && retries > 0) {
      console.warn(
        `createCommunity failed (status ${status || "network"}), retrying... (${retries} left)`
      );
      await sleep(1000 * (3 - retries));
      return createCommunity(payload, retries - 1);
    }

    console.error("createCommunity error:", error.response?.data || error.message);
    throw error;
  }
};

export const createCommunityWithBanner = async (payload, bannerFile, retries = 2) => {
  const formData = new FormData();

  Object.keys(payload).forEach((key) => {
    if (key === "genres" && Array.isArray(payload[key])) {
      const pgArray = `{${payload[key].map((g) => `"${g}"`).join(",")}}`;
      formData.append(key, pgArray);
    } else {
      formData.append(key, payload[key]);
    }
  });

  if (bannerFile) {
    formData.append("banner", bannerFile);
  }

  try {
    const res = await privateAxios.post(`${BASE_URL}/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Increase timeout for file uploads
      timeout: 30000,
    });

    return unwrap(res);
  } catch (error) {
    // Retry on 500/502/503 errors or network errors
    const status = error.response?.status;
    const isRetryable = status >= 500 || !error.response; // 5xx or network error

    if (isRetryable && retries > 0) {
      console.warn(
        `createCommunityWithBanner failed (status ${status || "network"}), retrying... (${retries} left)`
      );
      await sleep(1000 * (3 - retries)); // 1s, 2s backoff
      return createCommunityWithBanner(payload, bannerFile, retries - 1);
    }

    console.error("createCommunityWithBanner error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteCommunity = async (id) => {
  const res = await privateAxios.delete(`${BASE_URL}/${id}`);
  return unwrap(res);
};

// ============ MEMBERS / JOIN ============

export const toggleCommunityMembership = async (id, isDeparting) => {
  const method = isDeparting ? "delete" : "post";

  const res = await privateAxios({
    url: `${BASE_URL}/${id}/members/toggle`,
    method,
  });

  return unwrap(res);
};

export const getCommunityMembers = async (id) => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/${id}/members`);
    return unwrap(res);
  } catch (error) {
    console.error("getCommunityMembers error:", error.response?.data || error.message);
    throw error;
  }
};

// ============ POSTS ============

export const getCommunityPosts = async (id) => {
  try {
    const res = await publicAxios.get(`${BASE_URL}/${id}/posts`);
    return unwrap(res);
  } catch (error) {
    console.error("getCommunityPosts error:", error.response?.data || error.message);
    throw error;
  }
};

export const createCommunityPost = async (id, payload) => {
  try {
    const res = await privateAxios.post(`${BASE_URL}/${id}/posts`, payload);
    return unwrap(res);
  } catch (error) {
    console.error("createCommunityPost error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteCommunityPost = async (communityId, postId) => {
  const res = await privateAxios.delete(`${BASE_URL}/${communityId}/posts/${postId}`);
  return unwrap(res);
};

export const reactToCommunityPost = async (postId, emoji) => {
  const res = await privateAxios.post(`${BASE_URL}/posts/${postId}/react`, { emoji });
  return unwrap(res);
};

// ============ EVENTS ============

export const getCommunityEvents = async (id) => {
  const res = await privateAxios.get(`${BASE_URL}/${id}/events`);
  return unwrap(res);
};

// ============ TRENDING ============

export const getTrendingTopics = async (id) => {
  const res = await privateAxios.get(`${BASE_URL}/${id}/trending-topics`);
  return unwrap(res);
};

// ============ ACTIVITY ============

export const getUserActivity = async (userId) => {
  const res = await privateAxios.get(`${BASE_URL}/activity`, {
    params: { userId },
  });
  return unwrap(res);
};

// ============ TMDB BACKEND MOVIE SEARCH ============

export const searchMoviesOMDB = async (query) => {
  try {
    if (!query || !query.trim()) {
      return { results: [], all: [] };
    }

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.VITE_BASE_URL
        ? `${import.meta.env.VITE_BASE_URL}/api`
        : "https://filmyfrolic-api.onrender.com/api");
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
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.VITE_BASE_URL
        ? `${import.meta.env.VITE_BASE_URL}/api`
        : "https://filmyfrolic-api.onrender.com/api");
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

import axios from "axios";
const BASE_URL = (import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const ARCHIVE_API_BASE_URL = import.meta.env.VITE_ARCHIVE_API_BASE_URL;
const publicAxios = axios.create({
  baseURL: BASE_URL,
});

const privateAxios = axios.create({
  baseURL: BASE_URL,
});

// request interceptor
privateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
privateAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle both 401 (Unauthorized) and 403 (Forbidden) for token refresh
    // 403 often indicates expired token in this backend
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      // use refresh token to get new access token, or redirect to login
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // use refresh token to get new access token
        try {
          const response = await publicAxios.post(`/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          // Handle both { access_token } and { session: { access_token } } response structures
          const access_token = response.data.access_token || response.data.session?.access_token;
          if (!access_token) {
            throw new Error("No access_token in refresh response");
          }
          localStorage.setItem("accessToken", access_token);
          // Update the original request with the new token and retry
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return privateAxios(originalRequest);
        } catch (err) {
          console.error("Token refresh failed:", err);
          // Clear tokens and redirect to login on refresh failure
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // window.location.href = '/login';
          return Promise.reject(err);
        }
      } else {
        // Handle unauthorized access, e.g., redirect to login page
        console.error("Unauthorized access - redirecting to login");
        // window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    // For non-401/403 errors or already retried, reject normally
    return Promise.reject(error);
  }
);

const archiveAxios = axios.create({
  baseURL: ARCHIVE_API_BASE_URL,
});

export { privateAxios, publicAxios, archiveAxios };

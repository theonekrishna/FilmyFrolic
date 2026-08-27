import axios from "axios";
import { supabase } from "./supabase";

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL ? `${import.meta.env.VITE_BASE_URL}/api` : "https://filmyfrolic-api.onrender.com/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor to attach Supabase JWT token
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    // Ignore session error in guest mode
  }
  return config;
});

export const adminApi = {
  // Overview & Analytics
  getOverview: async () => {
    try {
      const res = await api.get("/admin/overview");
      return res.data;
    } catch (e) {
      return null;
    }
  },

  // User Management
  getUsers: async () => {
    try {
      const res = await api.get("/admin/users");
      return res.data?.users || res.data;
    } catch (e) {
      return null;
    }
  },

  changeUserRole: async (userId, role) => {
    const res = await api.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  toggleBanUser: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/ban`);
    return res.data;
  },

  toggleSuspendUser: async (userId) => {
    const res = await api.patch(`/admin/users/${userId}/suspend`);
    return res.data;
  },

  // Moderation Queue
  getReports: async () => {
    try {
      const res = await api.get("/admin/moderation");
      return res.data?.reports || res.data;
    } catch (e) {
      return null;
    }
  },

  resolveReport: async (reportId, action) => {
    const res = await api.patch(`/admin/moderation/${reportId}`, { action });
    return res.data;
  },

  // Notifications
  sendNotification: async (payload) => {
    const res = await api.post("/admin/notifications", payload);
    return res.data;
  },

  // Content Feedback
  getContentFeedback: async () => {
    try {
      const res = await api.get("/admin/feedback");
      return res.data;
    } catch (e) {
      return null;
    }
  },

  updateFeedbackStatus: async (feedbackId, status, notes) => {
    const res = await api.patch(`/admin/feedback/${feedbackId}`, { status, notes });
    return res.data;
  },
};

import { privateAxios } from "../../../utils/AxiosInstance";

const BASE_URL = "/api/messages";

/**
 * Normalize API response so UI always gets:
 * { success: boolean, data: any, message?: string }
 */
const unwrap = (res) => {
  if (!res) {
    return { success: false, data: null, message: "No response from server" };
  }

  const data = res.data;

  // if backend already follows { success, data }
  if (data && typeof data === "object" && "success" in data) {
    return data;
  }

  // fallback → wrap raw data
  return {
    success: true,
    data: data,
  };
};

// ============ INBOX ============

export const getInbox = async () => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/inbox`);
    return unwrap(res);
  } catch (error) {
    console.error("getInbox error:", error);
    return { success: false, data: [] };
  }
};

// ============ CONVERSATION ============

export const getConversation = async (userId, before = null, limit = 50) => {
  try {
    const params = { limit };

    if (before) {
      params.before = new Date(before).toISOString();
    }

    const res = await privateAxios.get(`${BASE_URL}/${userId}`, {
      params,
    });

    return unwrap(res);
  } catch (error) {
    console.error("getConversation error:", error);
    return { success: false, data: [] };
  }
};

// ============ SEND MESSAGE ============

/**
 * Send a message with optional media attachment.
 * @param {string} receiver_id  - UUID of the recipient
 * @param {string|null} content - Text body (optional if file supplied)
 * @param {File|null}   file    - Image or video file (optional if content supplied)
 */
export const sendMessage = async (receiver_id, content, file = null) => {
  try {
    const formData = new FormData();
    formData.append("receiver_id", receiver_id);

    if (content && content.trim()) {
      formData.append("content", content.trim());
    }

    if (file) {
      formData.append("media", file);
    }

    const res = await privateAxios.post(`${BASE_URL}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap(res);
  } catch (error) {
    console.error("sendMessage error:", error);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to send message",
    };
  }
};

// ============ SEARCH USERS ============

export const searchUsers = async (q) => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/search`, {
      params: { q },
    });

    return unwrap(res);
  } catch (error) {
    console.error("searchUsers error:", error);
    return { success: false, data: [] };
  }
};

// ============ SUGGESTIONS ============

export const getSuggestedUsers = async () => {
  try {
    const res = await privateAxios.get(`${BASE_URL}/suggested`);
    return unwrap(res);
  } catch (error) {
    console.error("getSuggestedUsers error:", error);
    return { success: false, data: [] };
  }
};

// ============ READ STATUS ============

export const markMessageAsRead = async (id) => {
  try {
    const res = await privateAxios.patch(`${BASE_URL}/${id}/read`);
    return unwrap(res);
  } catch (error) {
    console.error("markMessageAsRead error:", error);
    return { success: false };
  }
};

export const markConversationAsRead = async (userId) => {
  try {
    const res = await privateAxios.patch(`${BASE_URL}/${userId}/read-all`);
    return unwrap(res);
  } catch (error) {
    console.error("markConversationAsRead error:", error);
    return { success: false };
  }
};

// ============ DELETE ============

export const deleteMessage = async (id) => {
  try {
    const res = await privateAxios.delete(`${BASE_URL}/${id}`);
    return unwrap(res);
  } catch (error) {
    console.error("deleteMessage error:", error);
    return { success: false };
  }
};

const MessagesModel = require("./messages.model");
const { isBlocked } = require("../../middlewares/blockCheck");
const NotificationService = require("../../services/notification.service");

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;
    const file = req.file; // populated by multer when media is uploaded

    const trimmedContent = String(content ?? "").trim();

    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        message: "receiver_id is required",
      });
    }

    // must have at least one of: text, file
    if (!trimmedContent && !file) {
      return res.status(400).json({
        success: false,
        message: "Message must have text content or media",
      });
    }

    if (receiver_id === sender_id) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }
    // In sendMessage, after the self-message check:
    const blocked = await isBlocked(sender_id, receiver_id);
    if (blocked) {
      return res.status(403).json({ success: false, message: "Cannot send message to this user" });
    }

    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot exceed 1000 characters",
      });
    }

    // tighter image size limit (multer caps everything at 50MB, we cap images at 10MB)
    if (file && file.mimetype.startsWith("image/") && file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Images must be under 10MB",
      });
    }

    // upload media first (if any), then create message row
    let mediaFields = { media_url: null, media_type: null, media_path: null };
    if (file) {
      mediaFields = await MessagesModel.uploadMedia(file, sender_id);
    }

    const message = await MessagesModel.create({
      sender_id,
      receiver_id,
      content: trimmedContent || null,
      ...mediaFields,
    });

    // ── Notification: new message ───────────────────────────────
    try {
      const actorName = await NotificationService.getActorDisplayName(sender_id);
      const preview = trimmedContent
        ? trimmedContent.length > 50
          ? trimmedContent.substring(0, 50) + "..."
          : trimmedContent
        : "sent you media";

      await NotificationService.createNotification({
        userId: receiver_id,
        actorId: sender_id,
        title: "New Message",
        message: `${actorName}: ${preview}`,
        type: "new_message",
        entityType: "message",
        entityId: message.id,
        actionUrl: `/messages/${sender_id}`,
        groupKey: `message:${sender_id}:${receiver_id}`,
        icon: "MessageSquare",
        accent: "#06b6d4",
      });
    } catch (notifErr) {
      console.error("[messages.sendMessage] notification error:", notifErr.message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("[sendMessage]", error);

    // use the model's statusCode if it set one, otherwise 500
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// GET /api/messages/inbox
const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await MessagesModel.getInbox(userId);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const currentUser = req.user.id;
    const otherUser = req.params.userId;
    const blocked = await isBlocked(currentUser, otherUser);
    if (blocked) {
      return res.status(403).json({ success: false, message: "Conversation not available" });
    }
    // before: ISO timestamp string, e.g. "2026-04-05T10:00:00Z"
    // if not provided, defaults to now — fetches the latest batch
    const before = req.query.before || new Date().toISOString();
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // cap at 100

    const messages = await MessagesModel.getConversation(currentUser, otherUser, before, limit);

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("[getConversation]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/messages/:id/read
const markAsRead = async (req, res) => {
  try {
    const message = await MessagesModel.markAsRead(req.params.id, req.user.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const message = await MessagesModel.delete(req.params.id, req.user.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/messages/:userId/read-all
const markConversationRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const updated = await MessagesModel.markConversationRead(currentUserId, otherUserId);

    res.status(200).json({
      success: true,
      message: `${updated.length} message(s) marked as read`,
      data: updated,
    });
  } catch (error) {
    console.error("[markConversationRead]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await MessagesModel.search(q.trim(), currentUserId);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("[searchUsers]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/suggested
const getSuggested = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await MessagesModel.suggested(currentUserId);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("[getSuggested]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
  deleteMessage,
  markConversationRead,
  searchUsers,
  getSuggested,
};

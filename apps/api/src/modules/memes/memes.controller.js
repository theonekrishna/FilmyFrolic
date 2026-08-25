const model = require("./memes.model");
const multer = require("multer");
const NotificationService = require("../../services/notification.service");

const isUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

// Multer — stores file in memory as buffer (not on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, WEBP allowed"));
    }
  },
});

// ═══════════════════════════════════════════════════
// MEMES FEED
// ═══════════════════════════════════════════════════

exports.getAllMemes = async (req, res) => {
  try {
    let { tab } = req.query;

    const userId = req.user?.id || null;

    if (tab) {
      tab = tab.toLowerCase();

      const allowedTabs = ["hot", "top", "saved"];

      if (!allowedTabs.includes(tab)) {
        tab = null;
      }
    }

    if (tab === "saved" && !userId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const memes = await model.getAllMemes({
      tab,
      userId,
    });

    res.status(200).json({
      success: true,
      data: memes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════
// CREATE MEME
// ═══════════════════════════════════════════════════

exports.createMeme = async (req, res) => {
  try {
    const { title, imageUrl, movieRef, format, textContent, tags } = req.body;
    const userId = req.user.id; // ✅ from token

    if (!title?.trim())
      return res.status(400).json({ success: false, message: "Title is required" });
    if (!isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid user UUID" });

    // const data = await model.createMeme({ title, imageUrl, movieRef, format, textContent, tags, created_by: userId });
    const data = await model.createMeme({
      title,
      imageUrl,
      movieRef,
      format,
      textContent,
      tags,
      userId, // ✅ correct
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════
// TOGGLE UPVOTE
// ═══════════════════════════════════════════════════

exports.toggleUpvote = async (req, res) => {
  try {
    const { id: memeId } = req.params;

    const userId = req.user.id;

    if (!isUUID(memeId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    const result = await model.toggleUpvote({ memeId, userId });

    // ── Notification: meme upvote ───────────────────────────────
    try {
      if (result.upvoted) {
        // ✅ Fix — add this at the top of toggleUpvote's notification block
        const { supabaseAdmin: sbAdmin } = require("../../configs/supabase");
        const { data: meme } = await sbAdmin
          .from("memes")
          .select("created_by")
          .eq("id", memeId)
          .maybeSingle();

        if (meme?.created_by && meme.created_by !== userId) {
          const actorName = await NotificationService.getActorDisplayName(userId);
          await NotificationService.createNotification({
            userId: meme.created_by,
            actorId: userId,
            title: "Meme Upvoted",
            message: `${actorName} upvoted your meme`,
            type: "meme_upvote",
            entityType: "meme",
            entityId: memeId,
            actionUrl: `/memes/${memeId}`,
            groupKey: `upvote:meme:${memeId}`,
            icon: "ThumbsUp",
            accent: "#22c55e",
          });
        }
      }
    } catch (notifErr) {
      console.error("[meme.toggleUpvote] notification error:", notifErr.message);
    }

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════
// TOGGLE SAVE
// ═══════════════════════════════════════════════════

exports.toggleSave = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const userId = req.user.id;

    if (!isUUID(memeId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    const result = await model.toggleSave({ memeId, userId });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════
// SET REACTION
// ═══════════════════════════════════════════════════

exports.setReaction = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!isUUID(memeId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    if (!emoji) return res.status(400).json({ success: false, message: "Emoji is required" });

    const result = await model.setReaction({ memeId, userId, emoji });

    // ── Notification: meme reaction ─────────────────────────────
    try {
      const { supabaseAdmin: sbAdmin } = require("../../configs/supabase");
      const { data: meme } = await sbAdmin
        .from("memes")
        .select("created_by")
        .eq("id", memeId)
        .maybeSingle();

      if (meme?.created_by && meme.created_by !== userId) {
        const actorName = await NotificationService.getActorDisplayName(userId);
        await NotificationService.createNotification({
          userId: meme.created_by,
          actorId: userId,
          title: "New Reaction",
          message: `${actorName} reacted ${emoji} to your meme`,
          type: "meme_reaction",
          entityType: "meme",
          entityId: memeId,
          actionUrl: `/memes/${memeId}`,
          groupKey: `reaction:meme:${memeId}`,
          icon: "Smile",
          accent: "#eab308",
          priority: "low",
          metadata: { emoji },
        });
      }
    } catch (notifErr) {
      console.error("[meme.setReaction] notification error:", notifErr.message);
    }

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════

exports.getComments = async (req, res) => {
  try {
    const { id: memeId } = req.params;

    if (!isUUID(memeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meme UUID",
      });
    }

    const data = await model.getComments({ memeId });

    res.status(200).json({
      success: true,
      ...data, // ✅ includes totalCount + comments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const { content, parentId } = req.body; // ✅ NEW
    const userId = req.user.id;

    if (!isUUID(memeId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    if (parentId && !isUUID(parentId))
      return res.status(400).json({ success: false, message: "Invalid parentId" });

    if (!content?.trim())
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });

    const data = await model.addComment({
      memeId,
      userId,
      content: content.trim(),
      parentId: parentId || null,
    });

    // ── Notification: meme comment / reply ─────────────────────
    try {
      const { supabaseAdmin: sbAdmin } = require("../../configs/supabase");
      const actorName = await NotificationService.getActorDisplayName(userId);

      if (parentId) {
        // Reply — notify parent comment author
        const { data: parentComment } = await sbAdmin
          .from("meme_comments")
          .select("user_id")
          .eq("id", parentId)
          .maybeSingle();

        if (parentComment?.user_id) {
          await NotificationService.createNotification({
            userId: parentComment.user_id,
            actorId: userId,
            title: "New Reply",
            message: `${actorName} replied to your comment`,
            type: "meme_reply",
            entityType: "meme",
            entityId: memeId,
            actionUrl: `/memes/${memeId}`,
            groupKey: `reply:meme_comment:${parentId}`,
            icon: "Reply",
            accent: "#8b5cf6",
          });
        }
      } else {
        // Top-level comment — notify meme creator
        const { data: meme } = await sbAdmin
          .from("memes")
          .select("created_by")
          .eq("id", memeId)
          .maybeSingle();

        if (meme?.created_by) {
          await NotificationService.createNotification({
            userId: meme.created_by,
            actorId: userId,
            title: "New Comment",
            message: `${actorName} commented on your meme`,
            type: "meme_comment",
            entityType: "meme",
            entityId: memeId,
            actionUrl: `/memes/${memeId}`,
            groupKey: `comment:meme:${memeId}`,
            icon: "MessageCircle",
            accent: "#f97316",
          });
        }
      }
    } catch (notifErr) {
      console.error("[meme.addComment] notification error:", notifErr.message);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!isUUID(commentId) || !isUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID",
      });
    }

    const result = await model.deleteComment({ commentId, userId });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════
// SHARE COUNT
// ═══════════════════════════════════════════════════

exports.incrementShare = async (req, res) => {
  try {
    const { id: memeId } = req.params;

    if (!isUUID(memeId))
      return res.status(400).json({ success: false, message: "Invalid meme UUID" });

    const result = await model.incrementShare({ memeId });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═══════════════════════════════════════════════════
// SIDEBAR ENDPOINTS
// ═══════════════════════════════════════════════════

exports.getTrendingTags = async (req, res) => {
  try {
    const data = await model.getTrendingTags();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getMemeOfTheWeek = async (req, res) => {
  try {
    const data = await model.getMemeOfTheWeek();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTopMemers = async (req, res) => {
  try {
    const data = await model.getTopMemers();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ═══════════════════════════════════════════════════
// IMAGE UPLOAD
// ═══════════════════════════════════════════════════

exports.uploadImage = [
  upload.single("image"), // middleware runs first, parses multipart form
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ success: false, message: "No image file provided" });

      const { originalname, buffer, mimetype } = req.file;

      const result = await model.uploadMemeImage({
        fileBuffer: buffer,
        fileName: originalname,
        mimeType: mimetype,
      });

      res.status(200).json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.updateMeme = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const userId = req.user.id;

    const { title, imageUrl, movieRef, format, textContent, tags } = req.body;

    if (!isUUID(memeId) || !isUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID",
      });
    }

    // optional validations
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title cannot be empty",
      });
    }

    const data = await model.updateMeme({
      memeId,
      userId,
      title,
      imageUrl,
      movieRef,
      format,
      textContent,
      tags,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteMeme = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const userId = req.user.id;

    if (!isUUID(memeId) || !isUUID(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid UUID",
      });
    }

    const result = await model.deleteMeme({ memeId, userId });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    if (err.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getMemeById = async (req, res) => {
  try {
    const { id: memeId } = req.params;
    const userId = req.user?.id || null;

    if (!isUUID(memeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meme UUID",
      });
    }

    const data = await model.getMemeById({ memeId, userId });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Meme not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

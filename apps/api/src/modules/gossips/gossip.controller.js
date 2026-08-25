const GossipService = require("./gossip.service");
const { supabase } = require("../../configs/supabase");
const NotificationService = require("../../services/notification.service");
// const { get } = require("./gossip.route");

async function getOptionalUserId(req) {
  if (req.user?.id) {
    return req.user.id;
  }

  const authHeader = req.headers?.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return null;

  return data?.user?.id || null;
}

async function getGossips(req, res) {
  try {
    const { category } = req.query;

    const userId = await getOptionalUserId(req);

    const gossips = await GossipService.fetchGossips(userId, category);

    res.json({
      success: true,
      data: gossips,
    });
  } catch (err) {
    console.error("[getGossips]", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch gossips",
    });
  }
}
async function getGossipById(req, res) {
  try {
    const userId = await getOptionalUserId(req);

    const gossip = await GossipService.fetchGossipById(req.params.id, userId);

    res.json({
      success: true,
      data: gossip,
    });
  } catch (err) {
    console.error("[getGossipById]", err);

    res.status(404).json({
      success: false,
      message: "Gossip not found",
    });
  }
}
async function getBreakingNow(req, res) {
  try {
    const gossips = await GossipService.fetchBreakingNow();
    res.json({ success: true, data: gossips });
  } catch (err) {
    console.error("[getBreakingNow]", err);
    res.status(500).json({ success: false, message: "Failed to fetch breaking news" });
  }
}

async function getTrendingTags(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 7, 20);
    const tags = await GossipService.fetchTrendingTags(limit);
    res.json({ success: true, data: tags });
  } catch (err) {
    console.error("[getTrendingTags]", err);
    res.status(500).json({ success: false, message: "Failed to fetch trending tags" });
  }
}

async function getBookmarked(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id; // ← fixed
    const gossips = await GossipService.fetchBookmarked(userId);
    res.json({ success: true, data: gossips });
  } catch (err) {
    console.error("[getBookmarked]", err);
    res.status(500).json({ success: false, message: "Failed to fetch bookmarks" });
  }
}

async function createGossip(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id; // ← fixed

    // Pass the file (req.file) and the body to the service
    const gossip = await GossipService.insertGossip(req.body, userId, req.file);

    res.status(201).json({ success: true, data: gossip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function reactToGossip(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id; // ← fixed
    const result = await GossipService.toggleReaction(req.params.id, userId, req.body.reaction);

    // ── Notification: gossip reaction ────────────────────────────
    try {
      const { supabaseAdmin } = require("../../configs/supabase");
      const { data: gossip } = await supabaseAdmin
        .from("gossips")
        .select("user_id")
        .eq("id", req.params.id)
        .maybeSingle();

      if (gossip?.user_id && gossip.user_id !== userId) {
        const actorName = await NotificationService.getActorDisplayName(userId);
        const reactionEmoji = req.body.reaction === "fire" ? "🔥" : "😱";
        await NotificationService.createNotification({
          userId: gossip.user_id,
          actorId: userId,
          title: "New Reaction",
          message: `${actorName} reacted ${reactionEmoji} to your gossip`,
          type: "gossip_reaction",
          entityType: "gossip",
          entityId: req.params.id,
          actionUrl: `/gossips/${req.params.id}`,
          groupKey: `reaction:gossip:${req.params.id}`,
          icon: "Flame",
          accent: "#ef4444",
          metadata: { reaction: req.body.reaction },
        });
      }
    } catch (notifErr) {
      console.error("[gossip.reactToGossip] notification error:", notifErr.message);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[reactToGossip]", err);
    res.status(500).json({ success: false, message: "Failed to toggle reaction" });
  }
}

async function bookmarkGossip(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id; // ← fixed
    const result = await GossipService.toggleBookmark(req.params.id, userId);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[bookmarkGossip]", err);
    res.status(500).json({ success: false, message: "Failed to toggle bookmark" });
  }
}
async function addComment(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;
    const { content, parent_id } = req.body;

    const result = await GossipService.addComment(req.params.id, userId, content, parent_id);

    // ── Notification: gossip comment / reply ─────────────────────
    try {
      const { supabaseAdmin } = require("../../configs/supabase");
      const actorName = await NotificationService.getActorDisplayName(userId);

      if (parent_id) {
        // Reply — notify parent comment author
        const { data: parentComment } = await supabaseAdmin
          .from("gossip_comments")
          .select("user_id")
          .eq("id", parent_id)
          .maybeSingle();

        if (parentComment?.user_id) {
          await NotificationService.createNotification({
            userId: parentComment.user_id,
            actorId: userId,
            title: "New Reply",
            message: `${actorName} replied to your comment`,
            type: "gossip_reply",
            entityType: "gossip",
            entityId: req.params.id,
            actionUrl: `/gossips/${req.params.id}`,
            groupKey: `reply:gossip_comment:${parent_id}`,
            icon: "Reply",
            accent: "#8b5cf6",
          });
        }
      } else {
        // Top-level comment — notify gossip author
        const { data: gossip } = await supabaseAdmin
          .from("gossips")
          .select("user_id")
          .eq("id", req.params.id)
          .maybeSingle();

        if (gossip?.user_id) {
          await NotificationService.createNotification({
            userId: gossip.user_id,
            actorId: userId,
            title: "New Comment",
            message: `${actorName} commented on your gossip`,
            type: "gossip_comment",
            entityType: "gossip",
            entityId: req.params.id,
            actionUrl: `/gossips/${req.params.id}`,
            groupKey: `comment:gossip:${req.params.id}`,
            icon: "MessageCircle",
            accent: "#ec4899",
          });
        }
      }
    } catch (notifErr) {
      console.error("[gossip.addComment] notification error:", notifErr.message);
    }

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("[addComment]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getComments(req, res) {
  try {
    const userId = await getOptionalUserId(req);

    const result = await GossipService.getComments(req.params.id, userId);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[getComments]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
async function deleteComment(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;
    const { commentId } = req.params;

    const result = await GossipService.deleteComment(commentId, userId);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[deleteComment]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
async function editComment(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;
    const { commentId } = req.params;
    const { content } = req.body;

    const result = await GossipService.editComment(commentId, userId, content);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[editComment]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
async function deleteGossip(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await GossipService.deleteGossip(req.params.id, req.user.id);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[deleteGossip]", err);
    res.status(500).json({ success: false, message: err.message });
  }
}
async function getMyGossips(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const gossips = await GossipService.fetchMyGossips(userId);

    res.json({
      success: true,
      count: gossips.length,
      data: gossips,
    });
  } catch (err) {
    console.error("[getMyGossips]", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user gossips",
    });
  }
}
async function editGossip(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const result = await GossipService.editGossip(req.params.id, userId, req.body, req.file);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[editGossip]", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
module.exports = {
  getGossips,
  getBreakingNow,
  getTrendingTags,
  getBookmarked,
  createGossip,
  reactToGossip,
  bookmarkGossip,
  addComment,
  getComments,
  deleteComment,
  getGossipById,
  editComment,
  deleteGossip,
  getMyGossips,
  editGossip,
};

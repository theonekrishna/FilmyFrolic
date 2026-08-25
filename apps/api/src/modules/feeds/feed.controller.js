const { supabase, supabaseAdmin } = require("../../configs/supabase.js");
const feedService = require("./feed.service.js");
const NotificationService = require("../../services/notification.service");

const sendResponse = (res, status, success, payload, count = null) => {
  const key = success ? "data" : "error";
  const response = { success, [key]: payload };
  if (count !== null) response.count = count;
  return res.status(status).json(response);
};

/** GET ALL POSTS */
const getFeedPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const userId = req.user?.id;

    let blockedIds = [];

    if (userId) {
      const { data: blocks, error: blockError } = await supabaseAdmin
        .from("blocked_users")
        .select("blocked_id, blocker_id")
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

      if (blockError) throw blockError;

      blockedIds = (blocks || []).map((b) =>
        b.blocker_id === userId ? b.blocked_id : b.blocker_id
      );
    }

    let query = supabase
      .from("feeds")
      .select(
        `
        *,
        profiles:user_id (
          name,
          username,
          display_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (blockedIds.length > 0) {
      query = query.not("user_id", "in", `(${blockedIds.join(",")})`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return sendResponse(res, 200, true, data, count);
  } catch (err) {
    console.error("GET FEEDS ERROR:", err);

    return sendResponse(res, 500, false, err.message);
  }
};

/** 🔥 HOT FEEDS */
const getHotFeeds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await feedService.getHotFeeds(page, limit);
    return sendResponse(res, 200, true, result.data, result.count);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** ❤️ POPULAR FEEDS */
const getPopularFeeds = async (req, res) => {
  try {
    const page = 1;
    const limit = 6; // ✅ top 6

    const result = await feedService.getPopularFeeds(page, limit);
    return sendResponse(res, 200, true, result.data, result.count);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** 💬 MOST COMMENTED */
const getMostCommentedFeeds = async (req, res) => {
  try {
    const page = 1;
    const limit = 6; // ✅ top 6

    const result = await feedService.getMostCommentedFeeds(page, limit);
    return sendResponse(res, 200, true, result.data, result.count);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** CREATE POST */
const createPost = async (req, res) => {
  const { content, movie_tag } = req.body;

  if (!content?.trim()) {
    return sendResponse(res, 400, false, "Content is required.");
  }

  try {
    const { data, error } = await supabase
      .from("feeds")
      .insert([
        {
          user_id: req.user.id,
          content: content.trim(),
          movie_tag: movie_tag || null,
        },
      ])
      .select(`*, profiles:user_id (name, username, avatar_url)`)
      .single();

    if (error) throw error;

    return sendResponse(res, 201, true, data);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** GET COMMENTS */
const getPostComments = async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from("feeds_comments")
      .select(
        `
        id,
        feed_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        parent_id,
        is_deleted,

        profiles:user_id (
          id,
          name,
          username,
          display_name,
          avatar_url
        )
      `,
        { count: "exact" }
      )
      .eq("feed_id", req.params.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const map = {};
    const roots = {};
    const replyCountMap = {};

    // Count replies
    (data || []).forEach((c) => {
      if (c.parent_id) {
        replyCountMap[c.parent_id] = (replyCountMap[c.parent_id] || 0) + 1;
      }
    });

    // Build nodes
    (data || []).forEach((c) => {
      map[c.id] = {
        id: c.id,
        feedId: c.feed_id,

        content: c.is_deleted ? "This comment was deleted" : c.comment_text,

        isDeleted: c.is_deleted || false,

        parentId: c.parent_id,

        createdAt: c.created_at,
        updatedAt: c.updated_at,

        replyCount: replyCountMap[c.id] || 0,

        replies: [],

        author: {
          id: c.profiles?.id,
          name: c.profiles?.name || "Unknown",
          username: c.profiles?.username || "Unknown",
          avatar: c.profiles?.avatar_url || null,
          displayName: c.profiles?.display_name || "Unknown",
        },
      };
    });

    // Build tree
    Object.values(map).forEach((comment) => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].replies.push(comment);
      } else {
        roots[comment.id] = comment;
      }
    });

    return sendResponse(
      res,
      200,
      true,
      {
        totalCount: count || 0,
        comments: Object.values(roots),
      },
      count
    );
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** COMMENT */
const commentOnPost = async (req, res) => {
  const { comment_text, parent_id } = req.body;
  const { id: feed_id } = req.params;

  if (!comment_text?.trim()) {
    return sendResponse(res, 400, false, "Comment cannot be empty.");
  }
  const { data: feed } = await supabase
    .from("feeds")
    .select("id")
    .eq("id", feed_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!feed) {
    return sendResponse(res, 404, false, "Post not found.");
  }
  if (parent_id) {
    const { data: parentComment } = await supabase
      .from("feeds_comments")
      .select("id")
      .eq("id", parent_id)
      .eq("feed_id", feed_id)
      .maybeSingle();

    if (!parentComment) {
      return sendResponse(res, 400, false, "Invalid parent comment.");
    }
  }
  try {
    const { data, error } = await supabase
      .from("feeds_comments")
      .insert([
        {
          feed_id,
          user_id: req.user.id,
          comment_text,
          parent_id: parent_id || null,
        },
      ])
      .select(`*, profiles:user_id (name, username, display_name, avatar_url)`)
      .single();

    if (error) throw error;

    // ── Notification: feed comment / reply ─────────────────────────
    try {
      const actorName = await NotificationService.getActorDisplayName(req.user.id);

      if (parent_id) {
        // Reply to a comment — notify the parent comment author
        const { data: parentComment } = await supabase
          .from("feeds_comments")
          .select("user_id")
          .eq("id", parent_id)
          .maybeSingle();

        if (parentComment?.user_id) {
          await NotificationService.createNotification({
            userId: parentComment.user_id,
            actorId: req.user.id,
            title: "New Reply",
            message: `${actorName} replied to your comment`,
            type: "feed_reply",
            entityType: "feed",
            entityId: feed_id,
            actionUrl: `/feeds/${feed_id}`,
            groupKey: `reply:feed_comment:${parent_id}`,
            icon: "Reply",
            accent: "#8b5cf6",
          });
        }
      } else {
        // Top-level comment — notify the feed author
        const { data: feedData } = await supabase
          .from("feeds")
          .select("user_id")
          .eq("id", feed_id)
          .maybeSingle();

        if (feedData?.user_id) {
          await NotificationService.createNotification({
            userId: feedData.user_id,
            actorId: req.user.id,
            title: "New Comment",
            message: `${actorName} commented on your post`,
            type: "feed_comment",
            entityType: "feed",
            entityId: feed_id,
            actionUrl: `/feeds/${feed_id}`,
            groupKey: `comment:feed:${feed_id}`,
            icon: "MessageCircle",
            accent: "#3b82f6",
          });
        }
      }
    } catch (notifErr) {
      console.error("[feed.commentOnPost] notification error:", notifErr.message);
    }

    return sendResponse(res, 201, true, data);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** UPDATE COMMENT */
const updateComment = async (req, res) => {
  const { comment_text } = req.body;
  const { commentId } = req.params;

  if (!comment_text?.trim()) {
    return sendResponse(res, 400, false, "Comment cannot be empty.");
  }

  try {
    const { data, error } = await supabase
      .from("feeds_comments")
      .update({ comment_text, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", req.user.id)
      .eq("is_deleted", false)
      .select(`*, profiles:user_id (name, username, display_name, avatar_url)`)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return sendResponse(res, 403, false, "Unauthorized or not found.");
    }

    return sendResponse(res, 200, true, data);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** DELETE COMMENT */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const { data: comment, error } = await supabase
      .from("feeds_comments")
      .select("id, user_id, is_deleted")
      .eq("id", commentId)
      .maybeSingle();

    if (error) throw error;

    if (!comment) {
      return sendResponse(res, 404, false, "Comment not found");
    }

    if (comment.user_id !== req.user.id) {
      return sendResponse(res, 403, false, "Unauthorized");
    }

    if (comment.is_deleted) {
      return sendResponse(res, 200, true, "Comment already deleted");
    }

    const { error: updateError } = await supabase
      .from("feeds_comments")
      .update({
        is_deleted: true,
        comment_text: "This comment was deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("is_deleted", false)
      .eq("id", commentId);

    if (updateError) throw updateError;

    return sendResponse(res, 200, true, "Comment deleted successfully");
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** UPDATE POST */
const updatePost = async (req, res) => {
  try {
    const { content, movie_tag } = req.body;

    // validation
    if (!content?.trim()) {
      return sendResponse(res, 400, false, "Content is required.");
    }

    const updatedPost = await feedService.updateFeedPost(
      req.params.id,
      req.user.id,
      content,
      movie_tag
    );

    return sendResponse(res, 200, true, updatedPost);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** DELETE POST */
const deletePost = async (req, res) => {
  try {
    const { data } = await supabase
      .from("feeds")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select();

    if (!data || data.length === 0) {
      return sendResponse(res, 403, false, "Unauthorized");
    }

    return sendResponse(res, 200, true, "Post soft deleted.");
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** REACTION */
const handleReaction = async (req, res) => {
  try {
    if (!req.body.reactionType) {
      return sendResponse(res, 400, false, "reactionType required");
    }

    const result = await feedService.updateReaction(
      req.params.id,
      req.user.id,
      req.body.reactionType
    );

    // ── Notification: feed reaction ──────────────────────────────────
    try {
      if (result && result.user_id && result.user_id !== req.user.id) {
        const actorName = await NotificationService.getActorDisplayName(req.user.id);
        await NotificationService.createNotification({
          userId: result.user_id,
          actorId: req.user.id,
          title: "New Reaction",
          message: `${actorName} reacted to your post`,
          type: "feed_reaction",
          entityType: "feed",
          entityId: req.params.id,
          actionUrl: `/feeds/${req.params.id}`,
          groupKey: `reaction:feed:${req.params.id}`,
          icon: "Heart",
          accent: "#ef4444",
          metadata: { reactionType: req.body.reactionType },
        });
      }
    } catch (notifErr) {
      console.error("[feed.handleReaction] notification error:", notifErr.message);
    }

    return sendResponse(res, 200, true, result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** SAVE */
const savePost = async (req, res) => {
  try {
    const result = await feedService.toggleSaveFeed(req.params.id, req.user.id);
    return sendResponse(res, 200, true, result);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** SAVED POSTS */
const getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("feeds")
      .select(`*, profiles:user_id (name, username, avatar_url)`, {
        count: "exact",
      })
      .contains("saved_by", [req.user.id])
      .is("deleted_at", null)
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return sendResponse(res, 200, true, data, count);
  } catch (err) {
    return sendResponse(res, 400, false, err.message);
  }
};

/** GET ONE */
const getOneFeedPosts = async (req, res) => {
  try {
    const data = await feedService.getPostById(req.params.id);

    return sendResponse(res, 200, true, data);
  } catch (err) {
    return sendResponse(res, 404, false, err.message);
  }
};

module.exports = {
  getFeedPosts,
  getHotFeeds,
  getPopularFeeds,
  getMostCommentedFeeds,
  createPost,
  updatePost,
  deletePost,
  handleReaction,
  savePost,
  commentOnPost,
  getSavedPosts,
  getOneFeedPosts,
  getPostComments,
  updateComment,
  deleteComment,
};

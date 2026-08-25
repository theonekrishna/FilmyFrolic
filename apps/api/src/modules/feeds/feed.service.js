const { supabase } = require("../../configs/supabase.js");

/** Utility: Sum reactions */
const sumReactions = (obj = {}) => Object.values(obj).reduce((acc, val) => acc + val, 0);

const feedService = {
  /** 🔥 HOT FEEDS (latest posts with pagination) */
  getHotFeeds: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("feeds")
      .select(`*, profiles:user_id (name, username, avatar_url)`, {
        count: "exact",
      })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count };
  },

  /** ❤️ POPULAR FEEDS (reaction-based ranking) */
  getPopularFeeds: async (page = 1, limit = 10) => {
    const { data, error } = await supabase
      .from("feeds")
      .select(`*, profiles:user_id (name, username, avatar_url)`)
      .is("deleted_at", null);

    if (error) throw error;

    const sorted = data.sort(
      (a, b) => sumReactions(b.reaction_counts) - sumReactions(a.reaction_counts)
    );

    const offset = (page - 1) * limit;
    return {
      data: sorted.slice(offset, offset + limit),
      count: sorted.length,
    };
  },

  /** 💬 MOST COMMENTED FEEDS */
  getMostCommentedFeeds: async (page = 1, limit = 10) => {
    const { data, error } = await supabase
      .from("feeds")
      .select(
        `
        *,
        profiles:user_id (name, username, avatar_url),
        feeds_comments(count)
      `
      )
      .is("deleted_at", null);

    if (error) throw error;

    const sorted = data.sort(
      (a, b) => (b.feeds_comments?.[0]?.count || 0) - (a.feeds_comments?.[0]?.count || 0)
    );

    const offset = (page - 1) * limit;
    return {
      data: sorted.slice(offset, offset + limit),
      count: sorted.length,
    };
  },

  /** 👍 REACTION HANDLER */
  updateReaction: async (feedId, userId, newReactionType) => {
    const { data: feed, error: fetchError } = await supabase
      .from("feeds")
      .select("reactions_data, reaction_counts")
      .eq("id", feedId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !feed) {
      throw new Error("Post not found.");
    }

    let reactionsData = feed.reactions_data || {};
    let counts = feed.reaction_counts || {};

    const oldReaction = reactionsData[userId];

    // Toggle off
    if (oldReaction === newReactionType) {
      delete reactionsData[userId];
      counts[newReactionType] = Math.max(0, (counts[newReactionType] || 0) - 1);
    } else {
      // Remove old reaction
      if (oldReaction) {
        counts[oldReaction] = Math.max(0, (counts[oldReaction] || 0) - 1);
      }

      // Add new reaction
      reactionsData[userId] = newReactionType;
      counts[newReactionType] = (counts[newReactionType] || 0) + 1;
    }

    const { data, error } = await supabase
      .from("feeds")
      .update({
        reactions_data: reactionsData,
        reaction_counts: counts,
      })
      .eq("id", feedId)
      .select(`*, profiles:user_id (name, avatar_url)`)
      .single();

    if (error) throw error;

    return data;
  },

  /** ⭐ SAVE / UNSAVE */
  toggleSaveFeed: async (feedId, userId) => {
    const { data: feed, error: fetchError } = await supabase
      .from("feeds")
      .select("saved_by")
      .eq("id", feedId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !feed) {
      throw new Error("Post not found.");
    }

    const savedBy = feed.saved_by || [];
    const isSaved = savedBy.includes(userId);

    const updated = isSaved ? savedBy.filter((id) => id !== userId) : [...savedBy, userId];

    const { data, error } = await supabase
      .from("feeds")
      .update({ saved_by: updated })
      .eq("id", feedId)
      .select()
      .single();

    if (error) throw error;

    return {
      post: data,
      isSaved: !isSaved,
    };
  },

  /** 📄 GET SINGLE POST */
  getPostById: async (feedId) => {
    const { data, error } = await supabase
      .from("feeds")
      .select(
        `
        *,
        profiles:user_id (*),
        feeds_comments (
          *,
          profiles:user_id (*)
        )
      `
      )
      .eq("id", feedId)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      throw new Error("Post not found.");
    }

    return data;
  },
  /** ✏️ UPDATE POST */
  updateFeedPost: async (feedId, userId, content, movie_tag) => {
    const { data, error } = await supabase
      .from("feeds")
      .update({
        content,
        movie_tag: movie_tag || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select(
        `
      *,
      profiles:user_id (
        name,
        username,
        avatar_url
      )
    `
      )
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      throw new Error("Unauthorized or post not found.");
    }

    return data;
  },
};

module.exports = feedService;

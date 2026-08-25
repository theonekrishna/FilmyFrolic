const { supabase } = require("../../configs/supabase");

const isUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const getTimeAgo = (date) => {
  if (!date) return "Unknown";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const interval = seconds / 3600;
  if (interval > 24) return Math.floor(interval / 24) + "d ago";
  if (interval >= 1) return Math.floor(interval) + "h ago";
  return Math.floor(seconds / 60) + "m ago";
};

// ═══════════════════════════════════════════════════
// MEMES FEED
// ═══════════════════════════════════════════════════

exports.getAllMemes = async ({ tab, userId }) => {
  let query = supabase
    .from("memes")
    .select(
      `
    id, title, image_url, movie_ref, format, text_content,
    tags, is_trending, created_at, share_count,
    profiles:created_by!inner (
      id, name, initials, gradient, username, avatar_url, display_name
    ),
    meme_upvotes (user_id),
    meme_saves (user_id),
    meme_reactions (user_id, emoji),
    meme_comments (count)
    `
    )
    .eq("is_deleted", false)
    .eq("status", "approved");

  // ✅ Saved memes
  if (tab === "saved" && isUUID(userId)) {
    const { data: savedIds } = await supabase
      .from("meme_saves")
      .select("meme_id", { head: false })
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .eq("status", "approved");
    const ids = (savedIds || []).map((s) => s.meme_id);

    if (!ids.length) return [];

    query = query.in("id", ids);
  }

  // default latest memes
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  const userIdStr = String(userId);
  const mapped = (data || []).map((meme) => {
    const upvotes = meme.meme_upvotes?.length || 0;
    const commentCount = meme.meme_comments?.[0]?.count || 0;
    const upvoteSet = new Set((meme.meme_upvotes || []).map((u) => String(u.user_id)));

    const saveSet = new Set((meme.meme_saves || []).map((s) => String(s.user_id)));

    const reactionMap = new Map(
      (meme.meme_reactions || []).map((r) => [String(r.user_id), r.emoji])
    );
    return {
      id: meme.id,
      title: meme.title,
      image: meme.image_url || null,
      movieRef: meme.movie_ref || null,
      format: meme.format || "text",
      textContent: meme.text_content || null,
      tags: meme.tags || [],
      trending: meme.is_trending || false,
      timeAgo: getTimeAgo(meme.created_at),

      upvotes,
      commentCount,
      shareCount: meme.share_count || 0,

      author: {
        id: meme.profiles?.id,
        name: meme.profiles?.name || "Unknown",
        initials: meme.profiles?.initials || "UK",
        gradient: meme.profiles?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
        username: meme.profiles?.username || "Unknown",
        avatar: meme.profiles?.avatar_url || null,
        displayName: meme.profiles?.display_name || "Unknown",
      },

      isUpvoted: isUUID(userId) ? upvoteSet.has(userIdStr) : false,

      isSaved: isUUID(userId) ? saveSet.has(userIdStr) : false,

      userReaction: isUUID(userId) ? reactionMap.get(userIdStr) || "" : "",
    };
  });

  // ✅ HOT → most likes/upvotes
  if (tab === "hot") {
    return mapped.sort((a, b) => b.upvotes - a.upvotes);
  }

  // ✅ TOP → most comments
  if (tab === "top") {
    return mapped.sort((a, b) => b.commentCount - a.commentCount);
  }

  // ✅ DEFAULT → latest/all memes
  return mapped;
};

// ═══════════════════════════════════════════════════
// CREATE MEME
// ═══════════════════════════════════════════════════

exports.createMeme = async ({ title, imageUrl, movieRef, format, textContent, tags, userId }) => {
  const { data, error } = await supabase
    .from("memes")
    .insert([
      {
        title,
        image_url: imageUrl || null,
        movie_ref: movieRef || null,
        format: format || "text",
        text_content: textContent || null,
        tags: tags || [],
        is_trending: false,
        created_by: userId,
        share_count: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ═══════════════════════════════════════════════════
// TOGGLE UPVOTE
// ═══════════════════════════════════════════════════

exports.toggleUpvote = async ({ memeId, userId }) => {
  const { data: existing } = await supabase
    .from("meme_upvotes")
    .select("id")
    .match({ meme_id: memeId, user_id: userId })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("meme_upvotes").delete().eq("id", existing.id);
    if (error) throw error;
    return { upvoted: false };
  } else {
    const { error } = await supabase
      .from("meme_upvotes")
      .insert([{ meme_id: memeId, user_id: userId }]);
    if (error) throw error;
    return { upvoted: true };
  }
};

// ═══════════════════════════════════════════════════
// TOGGLE SAVE
// ═══════════════════════════════════════════════════

exports.toggleSave = async ({ memeId, userId }) => {
  const { data: existing } = await supabase
    .from("meme_saves")
    .select("id")
    .match({ meme_id: memeId, user_id: userId })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("meme_saves").delete().eq("id", existing.id);
    if (error) throw error;
    return { saved: false };
  } else {
    const { error } = await supabase
      .from("meme_saves")
      .insert([{ meme_id: memeId, user_id: userId }]);
    if (error) throw error;
    return { saved: true };
  }
};

// ═══════════════════════════════════════════════════
// SET REACTION
// ═══════════════════════════════════════════════════

exports.setReaction = async ({ memeId, userId, emoji }) => {
  const { data: existing } = await supabase
    .from("meme_reactions")
    .select("id, emoji")
    .match({ meme_id: memeId, user_id: userId })
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      const { error } = await supabase.from("meme_reactions").delete().eq("id", existing.id);
      if (error) throw error;
      return { reaction: null };
    } else {
      const { error } = await supabase
        .from("meme_reactions")
        .update({ emoji })
        .eq("id", existing.id);
      if (error) throw error;
      return { reaction: emoji };
    }
  } else {
    const { error } = await supabase
      .from("meme_reactions")
      .insert([{ meme_id: memeId, user_id: userId, emoji }]);
    if (error) throw error;
    return { reaction: emoji };
  }
};

// ═══════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════

exports.getComments = async ({ memeId }) => {
  const { data, error, count } = await supabase
    .from("meme_comments")
    .select(
      `
      id, content, created_at, parent_id, is_deleted,
      profiles:user_id!inner (
        id, name, initials, gradient, username, avatar_url, display_name
      )
    `,
      { count: "exact" }
    )
    .eq("meme_id", memeId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const map = {};
  const roots = {};
  const replyCountMap = {};

  // ✅ First pass → count replies
  (data || []).forEach((c) => {
    if (c.parent_id) {
      replyCountMap[c.parent_id] = (replyCountMap[c.parent_id] || 0) + 1;
    }
  });

  // ✅ Second pass → build nodes
  (data || []).forEach((c) => {
    map[c.id] = {
      id: c.id,
      content: c.is_deleted ? "This comment was deleted" : c.content,
      isDeleted: c.is_deleted || false,
      parentId: c.parent_id,
      timeAgo: getTimeAgo(c.created_at),
      replyCount: replyCountMap[c.id] || 0, // ✅ important
      replies: [],
      author: {
        id: c.profiles?.id,
        name: c.profiles?.name || "Unknown",
        initials: c.profiles?.initials || "UK",
        gradient: c.profiles?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
        username: c.profiles?.username || "Unknown",
        avatar: c.profiles?.avatar_url || null,
        displayName: c.profiles?.display_name || "Unknown",
      },
    };
  });

  // ✅ Third pass → build tree
  Object.values(map).forEach((comment) => {
    if (comment.parentId && map[comment.parentId]) {
      map[comment.parentId].replies.push(comment);
    } else {
      roots[comment.id] = comment;
    }
  });

  return {
    totalCount: count || 0,
    comments: Object.values(roots),
  };
};

exports.addComment = async ({ memeId, userId, content, parentId = null }) => {
  const { data, error } = await supabase
    .from("meme_comments")
    .insert([
      {
        meme_id: memeId,
        user_id: userId,
        content,
        parent_id: parentId, // ✅ NEW
      },
    ])
    .select(
      `
      id, content, created_at, parent_id,
      profiles:user_id!inner (id, name, initials, gradient, username, avatar_url, display_name)
    `
    )
    .single();

  if (error) throw error;

  return {
    id: data.id,
    content: data.content,
    parentId: data.parent_id,
    timeAgo: getTimeAgo(data.created_at),
    author: {
      id: data.profiles?.id,
      name: data.profiles?.name || "Unknown",
      initials: data.profiles?.initials || "UK",
      gradient: data.profiles?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
      username: data.profiles?.username || "Unknown",
      avatar: data.profiles?.avatar_url || null,
      displayName: data.profiles?.display_name || "Unknown",
    },
  };
};

exports.deleteComment = async ({ commentId, userId }) => {
  const { data: existing, error: fetchError } = await supabase
    .from("meme_comments")
    .select("id, user_id")
    .eq("id", commentId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existing || existing.user_id !== userId) {
    throw new Error("Unauthorized to delete this comment");
  }

  const { error } = await supabase
    .from("meme_comments")
    .update({
      is_deleted: true,
      content: "This comment was deleted",
    })
    .eq("id", commentId);

  if (error) throw error;

  return {
    deleted: true,
    type: "soft",
  };
};

// ═══════════════════════════════════════════════════
// SHARE COUNT
// ═══════════════════════════════════════════════════

exports.incrementShare = async ({ memeId }) => {
  const { error } = await supabase.rpc("increment_share_count", {
    meme_id: memeId,
  });

  if (error) {
    throw error;
  }

  return {
    shared: true,
  };
};

// ═══════════════════════════════════════════════════
// SIDEBAR — TRENDING TAGS
// ═══════════════════════════════════════════════════

exports.getTrendingTags = async () => {
  const { data, error } = await supabase
    .from("memes")
    .select(
      `
      id,
      tags,
      meme_upvotes(id),
      meme_reactions(id)
    `
    )
    .eq("is_deleted", false)
    .eq("status", "approved");

  if (error) throw error;

  const tagStats = {};

  (data || []).forEach((meme) => {
    const tags = meme.tags || [];

    // engagement score
    const score = (meme.meme_upvotes?.length || 0) + (meme.meme_reactions?.length || 0);

    tags.forEach((tag) => {
      const normalized = "#" + tag.replace(/\s+/g, "").toLowerCase();

      if (!tagStats[normalized]) {
        tagStats[normalized] = 0;
      }

      tagStats[normalized] += score;
    });
  });

  return Object.entries(tagStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([tag, score]) => ({
      tag,
      score,
    }));
};

// ═══════════════════════════════════════════════════
// SIDEBAR — MEME OF THE WEEK
// ═══════════════════════════════════════════════════

exports.getMemeOfTheWeek = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("memes")
    .select(
      `
      id,
      title,
      image_url,
      tags,
      created_at,
      share_count,

      profiles:created_by (
        id,
        name,
        username,
        initials,
        gradient,
        avatar_url,
        display_name
      ),

      meme_upvotes(id),
      meme_comments(id),
      meme_reactions(id)
    `
    )
    .eq("is_deleted", false)
    .eq("status", "approved")
    .gte("created_at", sevenDaysAgo.toISOString());

  if (error) throw error;

  if (!data || !data.length) {
    return [];
  }

  const ranked = data
    .map((meme) => {
      const upvotes = meme.meme_upvotes?.length || 0;
      const comments = meme.meme_comments?.length || 0;
      const reactions = meme.meme_reactions?.length || 0;
      const shares = meme.share_count || 0;

      // weighted engagement score
      const score = upvotes * 2 + comments * 3 + reactions * 2 + shares * 4;

      return {
        id: meme.id,
        title: meme.title,
        image: meme.image_url || null,
        tags: meme.tags || [],
        createdAt: meme.created_at,
        timeAgo: getTimeAgo(meme.created_at),

        stats: {
          upvotes,
          comments,
          reactions,
          shares,
          score,
        },

        author: {
          id: meme.profiles?.id,
          name: meme.profiles?.name || "Unknown",
          username: meme.profiles?.username || "Unknown",
          initials: meme.profiles?.initials || "UK",

          gradient: meme.profiles?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",

          avatar: meme.profiles?.avatar_url || null,

          displayName: meme.profiles?.display_name || "Unknown",
        },
      };
    })
    .sort((a, b) => b.stats.score - a.stats.score)
    .slice(0, 3);

  return ranked;
};

// ═══════════════════════════════════════════════════
// SIDEBAR — TOP MEMERS
// ═══════════════════════════════════════════════════

exports.getTopMemers = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("memes")
    .select(
      `
      id,
      created_by,
      created_at,

      profiles:created_by (
        id,
        name,
        username,
        initials,
        gradient,
        avatar_url,
        display_name
      ),

      meme_upvotes(id),
      meme_comments(id)
    `
    )
    .eq("is_deleted", false)
    .eq("status", "approved")
    .gte("created_at", sevenDaysAgo.toISOString());

  if (error) throw error;

  const usersMap = {};

  (data || []).forEach((meme) => {
    const uid = meme.created_by;

    if (!uid) return;

    if (!usersMap[uid]) {
      usersMap[uid] = {
        id: uid,
        totalMemes: 0,
        totalLikes: 0,
        totalComments: 0,
        profile: meme.profiles,
      };
    }

    usersMap[uid].totalMemes += 1;

    usersMap[uid].totalLikes += meme.meme_upvotes?.length || 0;

    usersMap[uid].totalComments += meme.meme_comments?.length || 0;
  });

  const result = Object.values(usersMap)
    .map((user) => {
      const avgLikes =
        user.totalMemes > 0 ? Number((user.totalLikes / user.totalMemes).toFixed(1)) : 0;

      const avgComments =
        user.totalMemes > 0 ? Number((user.totalComments / user.totalMemes).toFixed(1)) : 0;

      // ranking score
      const score = user.totalMemes * 5 + avgLikes * 2 + avgComments * 3;

      return {
        id: user.id,

        name: user.profile?.name || "Unknown",

        username: user.profile?.username || "Unknown",

        initials: user.profile?.initials || "UK",

        gradient: user.profile?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",

        avatar: user.profile?.avatar_url || null,

        displayName: user.profile?.display_name || "Unknown",

        stats: {
          totalMemes: user.totalMemes,
          totalLikes: user.totalLikes,
          totalComments: user.totalComments,
          avgLikes,
          avgComments,
          score,
        },
      };
    })
    .sort((a, b) => b.stats.score - a.stats.score)
    .slice(0, 3);

  return result;
};

// ═══════════════════════════════════════════════════
// IMAGE UPLOAD
// ═══════════════════════════════════════════════════

exports.uploadMemeImage = async ({ fileBuffer, fileName, mimeType }) => {
  const filePath = `memes/${Date.now()}_${fileName}`;

  const { data, error } = await supabase.storage
    .from("meme-images") // your storage bucket name
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage.from("meme-images").getPublicUrl(filePath);

  return { imageUrl: urlData.publicUrl };
};

exports.updateMeme = async ({
  memeId,
  userId,
  title,
  imageUrl,
  movieRef,
  format,
  textContent,
  tags,
}) => {
  // 1. Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from("memes")
    .select("id, created_by")
    .eq("id", memeId)
    .single();

  if (fetchError) throw fetchError;
  if (!existing || existing.created_by !== userId) {
    throw new Error("Unauthorized to update this meme");
  }

  // 2. Build dynamic update object (only provided fields)
  const updatePayload = {};

  if (title !== undefined) updatePayload.title = title;
  if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
  if (movieRef !== undefined) updatePayload.movie_ref = movieRef;
  if (format !== undefined) updatePayload.format = format;
  if (textContent !== undefined) updatePayload.text_content = textContent;
  if (tags !== undefined) updatePayload.tags = tags;

  // nothing to update
  if (Object.keys(updatePayload).length === 0) {
    return existing;
  }

  const { data, error } = await supabase
    .from("memes")
    .update(updatePayload)
    .eq("id", memeId)
    .select()
    .single();

  if (error) throw error;

  return data;
};
exports.deleteMeme = async ({ memeId, userId }) => {
  // 1. Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from("memes")
    .select("id, created_by")
    .eq("id", memeId)
    .single();

  if (fetchError) throw fetchError;
  if (!existing || existing.created_by !== userId) {
    throw new Error("Unauthorized to delete this meme");
  }

  // 2. Soft delete
  const { error } = await supabase.from("memes").update({ is_deleted: true }).eq("id", memeId);

  if (error) throw error;

  return { deleted: true };
};
exports.getMemeById = async ({ memeId, userId }) => {
  const { data, error } = await supabase
    .from("memes")
    .select(
      `
      id,
      title,
      image_url,
      movie_ref,
      format,
      text_content,
      tags,
      is_trending,
      created_at,
      share_count,
      is_deleted,

      profiles:created_by!inner (
        id,
        name,
        initials,
        gradient,
        username,
        avatar_url,
        display_name
      ),

      meme_upvotes (user_id),
      meme_saves (user_id),
      meme_reactions (user_id, emoji),
      meme_comments (count)
    `
    )
    .eq("id", memeId)
    .eq("is_deleted", false)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const upvotes = data.meme_upvotes?.length || 0;
  const commentCount = data.meme_comments?.[0]?.count || 0;
  const shareCount = data.share_count || 0;

  const userIdStr = userId ? String(userId) : null;

  const upvoteSet = new Set((data.meme_upvotes || []).map((u) => String(u.user_id)));

  const saveSet = new Set((data.meme_saves || []).map((s) => String(s.user_id)));

  const reactionMap = new Map((data.meme_reactions || []).map((r) => [String(r.user_id), r.emoji]));

  return {
    id: data.id,
    title: data.title,
    image: data.image_url || null,
    movieRef: data.movie_ref || null,
    format: data.format || "text",
    textContent: data.text_content || null,
    tags: data.tags || [],
    trending: data.is_trending || false,
    timeAgo: getTimeAgo(data.created_at),

    upvotes,
    shareCount,
    commentCount,

    author: {
      id: data.profiles?.id,
      name: data.profiles?.name || "Unknown",
      initials: data.profiles?.initials || "UK",
      gradient: data.profiles?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
      username: data.profiles?.username || "Unknown",
      avatar: data.profiles?.avatar_url || null,
      displayName: data.profiles?.display_name || "Unknown",
    },

    isUpvoted: userIdStr ? upvoteSet.has(userIdStr) : false,

    isSaved: userIdStr ? saveSet.has(userIdStr) : false,

    userReaction: userIdStr ? reactionMap.get(userIdStr) || "" : "",
  };
};

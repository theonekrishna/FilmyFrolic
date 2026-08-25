// src/modules/gossips/gossip.service.js

const { supabase } = require("../../configs/supabase");
const { timeAgo, formatGossip } = require("./gossip.helpers.js");

// ─── Feed ──────────────────────────────────────────────────────────────────────
async function fetchGossipById(gossipId, userId = null) {
  const { data, error } = await supabase
    .from("gossips")
    .select(
      `
      *,
      gossip_reactions (user_id, reaction),
      gossip_bookmarks (user_id)
    `
    )
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .single();

  if (error) throw error;

  const base = {
    id: data.id,
    headline: data.headline,
    excerpt: data.excerpt,
    source: data.source,
    timeAgo: timeAgo(data.created_at),
    category: data.category,
    verified: data.verified,
    image: data.image_url ?? undefined,
    fire: Number(data.fire_count),
    shocked: Number(data.shocked_count),
    comments: Number(data.comments_count),
    tags: data.tags ?? [],
  };

  if (!!userId) {
    return {
      ...base,
      bookmarked: data.gossip_bookmarks?.some((b) => b.user_id === userId) ?? false,
      userFired:
        data.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "fire") ?? false,
      userShocked:
        data.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "shocked") ??
        false,
      is_my_gossip: !!userId && data.user_id === userId,
      owners_id: data.user_id, // for ownership checks on frontend (edit/delete buttons)
    };
  }

  return base;
}
async function fetchGossips(userId, category = null) {
  let query = supabase
    .from("gossips")
    .select(
      `
      *,
      owners_details:profiles (
        id,
        username,
        avatar_url,
        display_name,
        name
      ),
      gossip_reactions (user_id, reaction),
      gossip_bookmarks (user_id),
      gossip_comments(count)
      `
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((g) => {
    const base = {
      id: g.id,
      headline: g.headline,
      excerpt: g.excerpt,
      source: g.source,
      timeAgo: timeAgo(g.created_at),
      category: g.category,
      verified: g.verified,
      image: g.image_url ?? undefined,

      fire: Number(g.fire_count),
      shocked: Number(g.shocked_count),

      comments: g.gossip_comments?.[0]?.count || 0,

      tags: g.tags ?? [],

      // ✅ owner profile
      profile: g.owners_details
        ? {
            id: g.owners_details.id,
            username: g.owners_details.username,
            dispaly_name: g.owners_details.display_name,
            avatar: g.owners_details.avatar_url,
            full_name: g.owners_details.full_name,
          }
        : null,
    };

    // ✅ logged in user
    if (!!userId) {
      return {
        ...base,

        bookmarked: g.gossip_bookmarks?.some((b) => b.user_id === userId) ?? false,

        userFired:
          g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "fire") ?? false,

        userShocked:
          g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "shocked") ??
          false,

        is_my_gossip: g.user_id === userId,

        owners_id: g.user_id,
      };
    }

    return base;
  });
}

// ─── Sidebar: Breaking Now ─────────────────────────────────────────────────────

async function fetchBreakingNow() {
  const { data, error } = await supabase
    .from("gossips")
    .select("id, headline, created_at")
    .eq("category", "breaking")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    headline: r.headline,
    timeAgo: timeAgo(r.created_at),
  }));
}

// ─── Sidebar: Trending Tags ────────────────────────────────────────────────────

async function fetchTrendingTags(limit = 7) {
  const { data, error } = await supabase.from("gossips").select("tags").eq("is_deleted", false);

  if (error) throw error;

  const tagCount = {};
  (data || []).forEach((g) => {
    (g.tags || []).forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, frequency]) => ({
      tag: `#${tag}`,
      frequency,
    }));
}

// ─── Sidebar: Bookmarked ───────────────────────────────────────────────────────

async function fetchBookmarked(userId) {
  const { data, error } = await supabase
    .from("gossips")
    .select(
      `
      *,
      gossip_reactions (user_id, reaction),
      gossip_bookmarks!inner (user_id, created_at)
    `
    )
    .eq("gossip_bookmarks.user_id", userId)
    .eq("is_deleted", false)
    .order("created_at", {
      ascending: false,
      referencedTable: "gossip_bookmarks",
    });

  if (error) throw error;

  return (data || []).map((g) => ({
    id: g.id,
    headline: g.headline,
    excerpt: g.excerpt,
    source: g.source,
    timeAgo: timeAgo(g.created_at),
    category: g.category,
    verified: g.verified,
    image: g.image_url ?? undefined,
    fire: Number(g.fire_count),
    shocked: Number(g.shocked_count),
    comments: Number(g.comments_count),
    tags: g.tags ?? [],
    bookmarked: true,
    userFired:
      g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "fire") ?? false,
    userShocked:
      g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "shocked") ?? false,
  }));
}

// ─── Create Gossip ─────────────────────────────────────────────────────────────

// async function insertGossip({ headline, excerpt, source, category, verified, image_url, tags }) {
//   const { data, error } = await supabase
//     .from("gossips")
//     .insert({
//       headline:  headline.trim(),
//       excerpt:   excerpt.trim(),
//       source:    source    ?? "via Filmy Frolic",
//       category,
//       verified:  verified  ?? false,
//       image_url: image_url ?? null,
//       tags:      tags      ?? [],
//     })
//     .select()
//     .single();

//   if (error) throw error;

//   return {
//     id:          data.id,
//     headline:    data.headline,
//     excerpt:     data.excerpt,
//     source:      data.source,
//     timeAgo:     timeAgo(data.created_at),
//     category:    data.category,
//     verified:    data.verified,
//     image:       data.image_url ?? undefined,
//     fire:        0,
//     shocked:     0,
//     comments:    0,
//     tags:        data.tags ?? [],
//     bookmarked:  false,
//     userFired:   false,
//     userShocked: false,
//   };
// }

async function insertGossip(payload, userId, file = null) {
  let finalImageUrl = payload.image_url || payload.image || null;

  // 1. If a file is provided, upload it to Supabase Storage first
  // In insertGossip, replace the upload block with this:
  if (file) {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("gossip-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    // ADD THIS: log the full error so you can see what's happening
    if (uploadError) {
      console.error("[Storage Upload Error]", JSON.stringify(uploadError));
      throw new Error(`Storage Upload Error: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("gossip-images").getPublicUrl(filePath);

    finalImageUrl = data.publicUrl;
  }

  // 3. Insert the metadata (and the new URL) into the Database
  const { data: gossip, error: dbError } = await supabase
    .from("gossips")
    .insert({
      headline: payload.headline,
      excerpt: payload.excerpt,
      category: payload.category,
      image_url: finalImageUrl,
      tags: Array.isArray(payload.tags) ? payload.tags : JSON.parse(payload.tags || "[]"),
      user_id: userId,
      source: payload.source || "Filmy Frolic",
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return gossip;
}

// ─── Reactions (Fire / Shocked) ────────────────────────────────────────────────

async function toggleReaction(gossipId, userId, reaction) {
  // 1. Check if this specific reaction exists
  const { data: existing, error: fetchError } = await supabase
    .from("gossip_reactions")
    .select("id")
    .eq("gossip_id", gossipId)
    .eq("user_id", userId)
    .eq("reaction", reaction)
    .maybeSingle();

  if (fetchError) throw fetchError;

  let action = "";

  // ───────────────
  // REMOVE (toggle OFF)
  // ───────────────
  if (existing) {
    await supabase.from("gossip_reactions").delete().eq("id", existing.id);

    await supabase.rpc("decrement_gossip_reaction", {
      p_gossip_id: gossipId,
      p_column: reaction === "fire" ? "fire_count" : "shocked_count",
    });

    action = "removed";
  }

  // ───────────────
  // ADD (toggle ON)
  // ───────────────
  else {
    await supabase.from("gossip_reactions").insert({
      gossip_id: gossipId,
      user_id: userId,
      reaction,
    });

    await supabase.rpc("increment_gossip_reaction", {
      p_gossip_id: gossipId,
      p_column: reaction === "fire" ? "fire_count" : "shocked_count",
    });

    action = "added";
  }

  // ✅ fetch updated counts
  const { data: updated } = await supabase
    .from("gossips")
    .select("fire_count, shocked_count")
    .eq("id", gossipId)
    .single();

  // ✅ check both reactions independently
  const { data: reactions } = await supabase
    .from("gossip_reactions")
    .select("reaction")
    .eq("gossip_id", gossipId)
    .eq("user_id", userId);

  return {
    action,
    fire: Number(updated.fire_count),
    shocked: Number(updated.shocked_count),
    userFired: reactions?.some((r) => r.reaction === "fire") || false,
    userShocked: reactions?.some((r) => r.reaction === "shocked") || false,
  };
}

// ─── Bookmark Toggle ───────────────────────────────────────────────────────────

async function toggleBookmark(gossipId, userId) {
  const { data: existing } = await supabase
    .from("gossip_bookmarks")
    .select("id")
    .eq("gossip_id", gossipId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("gossip_bookmarks").delete().eq("id", existing.id);
    if (error) throw error;

    return { bookmarked: false }; // ✅ fixed
  } else {
    const { error } = await supabase
      .from("gossip_bookmarks")
      .insert({ gossip_id: gossipId, user_id: userId });
    if (error) throw error;

    return { bookmarked: true };
  }
}
// ─── Gossip Comments ─────────────────────────────────────────

async function addComment(gossipId, userId, content, parentId = null) {
  if (!content || !content.trim()) {
    throw new Error("Comment cannot be empty");
  }

  const { data, error } = await supabase
    .from("gossip_comments")
    .insert({
      gossip_id: gossipId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId, // ✅ NEW
    })
    .select()
    .single();

  if (error) throw error;

  // increment only for top-level OR all (your choice)
  await supabase.rpc("increment_gossip_comment_count", {
    p_gossip_id: gossipId,
  });

  return data;
}

async function getComments(gossipId, userId = null) {
  const { data, error } = await supabase
    .from("gossip_comments")
    .select(
      `
      id,
      content,
      created_at,
      user_id,
      parent_id,
      profiles (username,display_name,name, avatar_url)
    `
    )
    .eq("gossip_id", gossipId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // 🔹 separate comments & replies
  const comments = [];
  const map = {};

  (data || []).forEach((c) => {
    const formatted = {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      username: c.profiles?.username,
      avatar: c.profiles?.avatar_url,
      is_my_comment: c.user_id === userId,
      replies: [],
    };

    map[c.id] = formatted;

    if (!c.parent_id) {
      comments.push(formatted); // main comment
    }
  });

  // 🔹 attach replies
  (data || []).forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.id]);
    }
  });

  // 🔹 count
  const { data: gossip } = await supabase
    .from("gossips")
    .select("comments_count")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .single();

  return {
    count: Number(gossip.comments_count),
    comments,
  };
}
// ─── Delete Comment ─────────────────────────────────────────

// async function deleteComment(commentId, userId) {
//   // 1. Check if comment exists & belongs to user
//   const { data: existing, error: fetchError } = await supabase
//     .from("gossip_comments")
//     .select("id, gossip_id, user_id")
//     .eq("id", commentId)
//     .single();

//   if (fetchError || !existing) {
//     throw new Error("Comment not found");
//   }

//   // 2. Authorization check (VERY IMPORTANT)
//   if (existing.user_id !== userId) {
//     throw new Error("Unauthorized to delete this comment");
//   }

//   // 3. Delete comment
//   const { error: deleteError } = await supabase
//     .from("gossip_comments")
//     .delete()
//     .eq("id", commentId);

//   if (deleteError) throw deleteError;

//   // 4. Decrement comment count
//   await supabase.rpc("decrement_gossip_comment_count", {
//     p_gossip_id: existing.gossip_id,
//   });

//   return { message: "Comment deleted successfully" };
// }
async function deleteComment(commentId, userId) {
  const { error } = await supabase.rpc("delete_comment_safe", {
    p_comment_id: commentId,
    p_user_id: userId,
  });

  if (error) throw error;

  return { message: "Comment deleted successfully" };
}
// ─── Edit Comment ─────────────────────────────────────────
async function editComment(commentId, userId, content) {
  if (!content || !content.trim()) {
    throw new Error("Content cannot be empty");
  }

  const { data: existing } = await supabase
    .from("gossip_comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (!existing) throw new Error("Comment not found");

  if (existing.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("gossip_comments")
    .update({ content: content.trim() })
    .eq("id", commentId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
async function deleteGossip(gossipId, userId) {
  const { data: existing } = await supabase
    .from("gossips")
    .select("id, user_id")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (!existing) {
    throw new Error("Gossip not found");
  }

  if (existing.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("gossips")
    .update({
      is_deleted: true,
    })
    .eq("id", gossipId);

  if (error) throw error;

  return {
    message: "Gossip deleted successfully",
  };
}

async function fetchMyGossips(userId) {
  if (!userId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("gossips")
    .select(
      `
      *,
      gossip_reactions (user_id, reaction),
      gossip_bookmarks (user_id)
    `
    )
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((g) => ({
    id: g.id,
    headline: g.headline,
    excerpt: g.excerpt,
    source: g.source,
    timeAgo: timeAgo(g.created_at),
    category: g.category,
    verified: g.verified,
    image: g.image_url ?? undefined,
    fire: Number(g.fire_count),
    shocked: Number(g.shocked_count),
    comments: Number(g.comments_count),
    tags: g.tags ?? [],

    // ✅ always true (since it's user's own gossip)
    is_mine: true,

    // ✅ personalization
    bookmarked: g.gossip_bookmarks?.some((b) => b.user_id === userId) ?? false,

    userFired:
      g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "fire") ?? false,

    userShocked:
      g.gossip_reactions?.some((r) => r.user_id === userId && r.reaction === "shocked") ?? false,
  }));
}
async function editGossip(gossipId, userId, payload, file = null) {
  // 1. Fetch existing gossip
  const { data: existing, error: fetchError } = await supabase
    .from("gossips")
    .select("*")
    .eq("id", gossipId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existing) {
    throw new Error("Gossip not found");
  }

  // 2. Ownership check
  if (existing.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  let finalImageUrl = existing.image_url;

  // 3. Handle image upload
  if (file) {
    // delete old image
    if (existing.image_url) {
      try {
        const oldPath = existing.image_url.split("/gossip-images/")[1];

        if (oldPath) {
          await supabase.storage.from("gossip-images").remove([oldPath]);
        }
      } catch (err) {
        console.warn("Old image delete failed:", err.message);
      }
    }

    // upload new image
    const fileExt = file.originalname.split(".").pop();

    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;

    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gossip-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("gossip-images").getPublicUrl(filePath);

    finalImageUrl = data.publicUrl;
  }

  // 4. Prepare update payload
  const updateData = {
    headline: payload.headline?.trim() ?? existing.headline,
    excerpt: payload.excerpt?.trim() ?? existing.excerpt,
    category: payload.category ?? existing.category,
    tags: Array.isArray(payload.tags)
      ? payload.tags
      : payload.tags
        ? JSON.parse(payload.tags)
        : existing.tags,

    image_url: finalImageUrl,

    source: payload.source ?? existing.source,
  };

  // 5. Update gossip
  const { data: updated, error: updateError } = await supabase
    .from("gossips")
    .update(updateData)
    .eq("id", gossipId)
    .select()
    .maybeSingle();

  if (updateError) throw updateError;

  return updated;
}
module.exports = {
  fetchGossips,
  fetchBreakingNow,
  fetchTrendingTags,
  fetchBookmarked,
  insertGossip,
  toggleReaction,
  toggleBookmark,
  addComment,
  getComments,
  deleteComment,
  editComment,
  fetchGossipById,
  deleteGossip,
  fetchMyGossips,
  editGossip,
};

// ═══════════════════════════════════════════════════════════════════════════
// admin.social.models.js
// ═══════════════════════════════════════════════════════════════════════════

const { supabase } = require("../../../configs/supabase");

// ══════════════════════
// GET ALL COMMUNITIES
// ══════════════════════
exports.getAllCommunities = async ({ search, page, limit }) => {
  // PAGINATION
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // BASE QUERY
  let query = supabase.from("communities").select(
    `
      id,
      name,
      description,
      banner_url,
      avatar_emoji,
      avatar_gradient,
      genres,
      category,
      is_trending,
      verified,
      status,
      created_at,
      created_by,

      profiles:created_by (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
      `,
    { count: "exact" }
  );

  // SEARCH
  if (search?.trim()) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // ORDER + PAGINATION
  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  // EXECUTE
  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // MAP DATA
  const mappedCommunities = await Promise.all(
    (data || []).map(async (community) => {
      // MEMBERS COUNT
      const { count: membersCount } = await supabase
        .from("community_members")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("community_id", community.id);

      // POSTS COUNT
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("community_id", community.id);

      return {
        id: community.id,

        name: community.name,

        description: community.description,

        banner_url: community.banner_url,

        avatar_emoji: community.avatar_emoji,

        avatar_gradient: community.avatar_gradient,

        verified: community.verified || false,

        topic: community.category,

        members_count: membersCount || 0,

        posts_count: postsCount || 0,

        moderator: community.profiles || null,

        status: community.status ? "active" : "suspended",

        created_at: community.created_at,
      };
    })
  );

  // RESPONSE
  return {
    total: count || 0,

    page,
    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedCommunities,
  };
};

// ══════════════════════
// TOGGLE VERIFY COMMUNITY
// ══════════════════════
exports.toggleVerifyCommunity = async (communityId) => {
  // FIND COMMUNITY
  const { data: existingCommunity, error: findError } = await supabase
    .from("communities")
    .select(
      `
      id,
      name,
      verified
    `
    )
    .eq("id", communityId)
    .single();

  if (findError || !existingCommunity) {
    throw new Error("Community not found");
  }

  // NEW VALUE
  const newVerifiedStatus = !existingCommunity.verified;

  // UPDATE ONLY
  const { error: updateError } = await supabase
    .from("communities")
    .update({
      verified: newVerifiedStatus,
    })
    .eq("id", communityId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // RETURN MANUAL RESPONSE
  return {
    id: existingCommunity.id,
    name: existingCommunity.name,
    verified: newVerifiedStatus,
  };
};

// ══════════════════════
// TOGGLE SUSPEND COMMUNITY
// ══════════════════════
exports.toggleSuspendCommunity = async (communityId) => {
  // FIND COMMUNITY
  const { data: existingCommunity, error: findError } = await supabase
    .from("communities")
    .select(
      `
      id,
      name,
      status
    `
    )
    .eq("id", communityId)
    .single();

  if (findError || !existingCommunity) {
    throw new Error("Community not found");
  }

  // TOGGLE
  const newStatus = !existingCommunity.status;

  // UPDATE
  const { error: updateError } = await supabase
    .from("communities")
    .update({
      status: newStatus,
    })
    .eq("id", communityId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // RETURN
  return {
    id: existingCommunity.id,
    name: existingCommunity.name,
    status: newStatus,
  };
};

// ══════════════════════
// GET ALL FEEDS
// ══════════════════════
exports.getAllFeeds = async ({ search, page, limit }) => {
  // PAGINATION
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // BASE QUERY
  let query = supabase
    .from("feeds")
    .select(
      `
      id,
      content,
      movie_tag,
      reaction_counts,
      saved_by,
      created_at,
      updated_at,
      deleted_at,

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
    .is("deleted_at", null);

  // SEARCH
  if (search?.trim()) {
    query = query.ilike("content", `%${search}%`);
  }

  // ORDER
  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  // EXECUTE
  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // MAP FEEDS
  const mappedFeeds = await Promise.all(
    (data || []).map(async (feed) => {
      // COMMENTS COUNT
      const { count: commentsCount } = await supabase
        .from("feeds_comments")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("feed_id", feed.id);

      // REPORTS COUNT (ONLY FEED POSTS)
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("module_type", "feed")
        .eq("target_id", feed.id);

      // REACTIONS
      const reactions = feed.reaction_counts || {};

      const totalReactions = Object.values(reactions).reduce((sum, value) => sum + value, 0);

      return {
        id: feed.id,

        content: feed.content,

        movie_tag: feed.movie_tag,

        created_at: feed.created_at,

        updated_at: feed.updated_at,

        author: feed.profiles || null,

        comments_count: commentsCount || 0,

        reactions_count: totalReactions || 0,

        reports_count: reportsCount || 0,

        saved_count: feed.saved_by?.length || 0,
      };
    })
  );

  // RESPONSE
  return {
    total: count || 0,

    page,
    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedFeeds,
  };
};

// ══════════════════════
// REMOVE FEED
// SOFT DELETE
// ══════════════════════
exports.removeFeed = async (feedId) => {
  // CHECK FEED
  const { data: existingFeed, error: fetchError } = await supabase
    .from("feeds")
    .select(
      `
      id,
      content,
      deleted_at
    `
    )
    .eq("id", feedId)
    .maybeSingle();
  if (!existingFeed) {
    throw new Error("Feed not found");
  }
  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // NOT FOUND
  if (!existingFeed) {
    throw new Error("Feed not found");
  }

  // ALREADY DELETED
  if (existingFeed.deleted_at) {
    throw new Error("Feed already removed");
  }

  // UPDATE
  const { data, error } = await supabase
    .from("feeds")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", feedId)
    .select(
      `
      id,
      content,
      deleted_at
    `
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// GET ALL ROOMS
// ══════════════════════
exports.getAllRooms = async ({ search, status, page, limit }) => {
  // PAGINATION
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // BASE QUERY
  let query = supabase.from("rooms").select(
    `
      id,
      title,
      subtitle,
      room_type,
      media_title,
      max_participants,
      privacy,
      scheduled_time,
      status,
      image_url,
      created_at,
      invite_code,
      featured,

      profiles:owner_id (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
      `,
    { count: "exact" }
  );

  // SEARCH
  if (search?.trim()) {
    query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);
  }

  // FILTER
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // ORDER
  query = query
    .order("featured", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  // EXECUTE
  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // MAP ROOMS
  const mappedRooms = await Promise.all(
    (data || []).map(async (room) => {
      // PARTICIPANTS COUNT
      const { count: participantsCount } = await supabase
        .from("room_participate")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("room_id", room.id);

      return {
        id: room.id,

        title: room.title,

        subtitle: room.subtitle,

        room_type: room.room_type,

        media_title: room.media_title,

        max_participants: room.max_participants,

        privacy: room.privacy,

        scheduled_time: room.scheduled_time,

        status: room.status,

        image_url: room.image_url,

        created_at: room.created_at,

        invite_code: room.invite_code,

        participants_count: participantsCount || 0,

        featured: room.featured || false,

        owner: room.profiles || null,
      };
    })
  );

  // RESPONSE
  return {
    total: count || 0,

    page,
    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedRooms,
  };
};

// ══════════════════════
// CLOSE ROOM
// ══════════════════════
exports.closeRoom = async (roomId) => {
  // CHECK ROOM
  const { data: existingRoom, error: fetchError } = await supabase
    .from("rooms")
    .select(
      `
      id,
      title,
      status
    `
    )
    .eq("id", roomId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  // NOT FOUND
  if (!existingRoom) {
    throw new Error("Room not found");
  }

  // ALREADY ENDED
  if (existingRoom.status === "ended") {
    throw new Error("Room already ended");
  }

  // UPDATE
  const { data, error } = await supabase
    .from("rooms")
    .update({
      status: "ended",
    })
    .eq("id", roomId)
    .select(
      `
      id,
      title,
      status
    `
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// TOGGLE FEATURED ROOM
// ══════════════════════
exports.toggleFeaturedRoom = async (roomId) => {
  // FIND ROOM
  const { data: existingRoom, error: findError } = await supabase
    .from("rooms")
    .select(
      `
      id,
      title,
      featured
    `
    )
    .eq("id", roomId)
    .single();

  if (findError || !existingRoom) {
    throw new Error("Room not found");
  }

  // TOGGLE
  const newFeaturedStatus = !existingRoom.featured;

  // UPDATE
  const { error: updateError } = await supabase
    .from("rooms")
    .update({
      featured: newFeaturedStatus,
    })
    .eq("id", roomId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // RETURN
  return {
    id: existingRoom.id,
    title: existingRoom.title,
    featured: newFeaturedStatus,
  };
};

// ══════════════════════
// GET FEED DETAILS
// ══════════════════════
exports.getFeedDetails = async (feedId) => {
  // GET FEED
  const { data: feed, error } = await supabase
    .from("feeds")
    .select(
      `
      id,
      content,
      movie_tag,
      reaction_counts,
      reactions_data,
      saved_by,
      created_at,
      updated_at,
      deleted_at,

      profiles:user_id (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("id", feedId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  // NOT FOUND
  if (!feed) {
    throw new Error("Feed not found");
  }

  // COMMENTS
  const { data: comments, error: commentsError } = await supabase
    .from("feeds_comments")
    .select(
      `
      id,
      comment_text,
      created_at,
      parent_id,

      profiles:user_id (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("feed_id", feedId)
    .order("created_at", {
      ascending: false,
    });

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  // REACTIONS
  const reactions = feed.reaction_counts || {};

  const totalReactions = Object.values(reactions).reduce((sum, value) => sum + value, 0);

  return {
    id: feed.id,

    content: feed.content,

    movie_tag: feed.movie_tag,

    created_at: feed.created_at,

    updated_at: feed.updated_at,

    author: feed.profiles || null,

    reactions: feed.reaction_counts || {},

    reactions_data: feed.reactions_data || {},

    total_reactions: totalReactions || 0,

    saved_count: feed.saved_by?.length || 0,

    comments_count: comments?.length || 0,

    comments: comments || [],
  };
};

const { supabase } = require("../../configs/supabase");

// ── Communities ───────────────────────────────────────────────────────────────

exports.fetchAllCommunities = () =>
  supabase
    .from("communities")
    .select(
      `
      id, name, description, banner_url, created_by, created_at,
      avatar_emoji, avatar_gradient, genres, category, is_trending, privacy,
      members_count:community_members(count),
      community_members!left(user_id)
    `
    )
    .order("created_at", { ascending: false });

exports.findCommunityByName = (name) =>
  supabase.from("communities").select("id").ilike("name", name).maybeSingle();

exports.createCommunity = (payload) =>
  supabase.from("communities").insert([payload]).select().single();

exports.addCommunityMember = (communityId, userId, role = "admin") =>
  supabase
    .from("community_members")
    .upsert([{ community_id: communityId, user_id: userId, role }], {
      onConflict: ["community_id", "user_id"],
    });

// Returns the deleted row so the controller can detect unauthorised attempts
exports.deleteCommunity = (communityId, userId) =>
  supabase.from("communities").delete().match({ id: communityId, created_by: userId }).select("id");

// ── Posts ─────────────────────────────────────────────────────────────────────

exports.getPostsByCommunity = (communityId) =>
  supabase
    .from("posts")
    .select(
      `
      id, user_id, content, media_url, created_at, is_spoiler, attached_movie, share_count,
      profiles!posts_user_id_fkey (id, username, display_name, avatar_url, gradient, initials),
      comments (count)
    `
    )
    .eq("community_id", communityId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

exports.getReactionsByPostIds = (postIds) =>
  supabase.from("reactions").select("post_id, user_id, emoji").in("post_id", postIds);

exports.createPost = (payload) => supabase.from("posts").insert([payload]).select().maybeSingle();

// Scoped soft-delete — must match community_id too so posts can't be deleted
// across communities by knowing only the postId + userId.
exports.deletePost = (postId, userId, communityId) =>
  supabase
    .from("posts")
    .update({ is_deleted: true })
    .match({ id: postId, user_id: userId, community_id: communityId });

// Existence check + owner info used by reactToPost
exports.getPostById = (postId) =>
  supabase.from("posts").select("id, user_id").eq("id", postId).maybeSingle();

// ── Reactions ─────────────────────────────────────────────────────────────────

exports.findReaction = (postId, userId, emoji) =>
  supabase
    .from("reactions")
    .select("id")
    .match({ post_id: postId, user_id: userId, emoji })
    .maybeSingle();

exports.addReaction = (payload) => supabase.from("reactions").insert([payload]);

exports.deleteReaction = (id) => supabase.from("reactions").delete().eq("id", id);

// ── Members ───────────────────────────────────────────────────────────────────

exports.getMembersByCommunity = (communityId) =>
  supabase
    .from("community_members")
    .select(
      `
      role, joined_at, user_id,
      profiles!community_members_user_id_fkey (
        id, username, display_name, avatar_url, gradient, initials
      )
    `
    )
    .eq("community_id", communityId);

exports.joinCommunity = (communityId, userId) =>
  supabase
    .from("community_members")
    .upsert([{ community_id: communityId, user_id: userId, role: "member" }], {
      onConflict: ["community_id", "user_id"],
    });

exports.leaveCommunity = (communityId, userId) =>
  supabase.from("community_members").delete().match({ community_id: communityId, user_id: userId });

// Check if a user is already a member of a community
exports.isMember = (communityId, userId) =>
  supabase
    .from("community_members")
    .select("id, role")
    .match({ community_id: communityId, user_id: userId })
    .maybeSingle();

// ── Join Requests (for private communities) ───────────────────────────────────

exports.createJoinRequest = (communityId, userId) =>
  supabase
    .from("community_join_requests")
    .upsert([{ community_id: communityId, user_id: userId, status: "pending" }], {
      onConflict: ["community_id", "user_id"],
    })
    .select()
    .maybeSingle();

exports.getJoinRequest = (communityId, userId) =>
  supabase
    .from("community_join_requests")
    .select("id, status")
    .match({ community_id: communityId, user_id: userId })
    .maybeSingle();

exports.getPendingJoinRequests = (communityId) =>
  supabase
    .from("community_join_requests")
    .select(
      `
      id, status, created_at, user_id,
      profiles!community_join_requests_user_id_fkey (
        id, username, display_name, avatar_url, gradient, initials
      )
    `
    )
    .eq("community_id", communityId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

exports.updateJoinRequest = (communityId, userId, status) =>
  supabase
    .from("community_join_requests")
    .update({ status })
    .match({ community_id: communityId, user_id: userId });

// ── Invites (for invite-only communities) ─────────────────────────────────────

exports.getInvite = (communityId, userId) =>
  supabase
    .from("community_invites")
    .select("id, status")
    .match({ community_id: communityId, user_id: userId })
    .maybeSingle();

exports.createInvite = (communityId, userId, invitedBy) =>
  supabase
    .from("community_invites")
    .upsert(
      [{ community_id: communityId, user_id: userId, invited_by: invitedBy, status: "pending" }],
      { onConflict: ["community_id", "user_id"] }
    )
    .select()
    .maybeSingle();

exports.acceptInvite = (communityId, userId) =>
  supabase
    .from("community_invites")
    .update({ status: "accepted" })
    .match({ community_id: communityId, user_id: userId });

// ── Events ────────────────────────────────────────────────────────────────────

exports.getEventsByCommunity = (communityId) =>
  supabase
    .from("events")
    .select("*")
    .eq("community_id", communityId)
    .order("event_date", { ascending: true });

// ── User activity ─────────────────────────────────────────────────────────────

exports.getUserCommunitiesCount = (userId) =>
  supabase
    .from("community_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

exports.getUserPostsCount = (userId) =>
  supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId);

exports.getUserPostIds = (userId) => supabase.from("posts").select("id").eq("user_id", userId);

exports.getReactionsCountByPostIds = (postIds) =>
  supabase.from("reactions").select("*", { count: "exact", head: true }).in("post_id", postIds);

// ── Trending topics ───────────────────────────────────────────────────────────

exports.getPostsContentByCommunity = (communityId) =>
  supabase
    .from("posts")
    .select("content")
    .eq("community_id", communityId)
    .not("content", "is", null);

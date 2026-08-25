const { supabase, supabaseAdmin } = require("../../configs/supabase");
const NotificationService = require("../../services/notification.service");

const followUser = async (followerId, followingId) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("follow_permission")
    .eq("id", followingId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);

  if (!profile) {
    const err = new Error("User not found");
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  const permission = profile.follow_permission ?? "everyone";

  if (permission === "no_one") {
    const err = new Error("This user does not allow new followers");
    err.code = "FOLLOW_NOT_ALLOWED";
    throw err;
  }

  if (permission === "friends_of_friends") {
    const hasMutual = await hasMutualFollowing(followerId, followingId);
    if (!hasMutual) {
      const err = new Error("You must share a mutual connection to follow this user");
      err.code = "FOLLOW_NOT_ALLOWED";
      throw err;
    }
  }

  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const dupErr = new Error("Already following this user");
      dupErr.code = "ALREADY_FOLLOWING";
      throw dupErr;
    }
    throw new Error(error.message);
  }

  // Best-effort notification — must not break the follow flow
  try {
    const actorName = await NotificationService.getActorDisplayName(followerId);

    await NotificationService.createNotification({
      userId: followingId,
      actorId: followerId,
      title: "New Follower",
      message: `${actorName} started following you`,
      type: "follow",
      entityType: "profile",
      entityId: followerId,
      actionUrl: `/profile/${followerId}`,
      groupKey: `follow:${followingId}`,
      icon: "UserPlus",
      accent: "#3b82f6",
    });
  } catch (notifErr) {
    console.error("[follow] notification error:", notifErr.message);
  }

  return data;
};

const hasMutualFollowing = async (requesterId, targetId) => {
  const { data, error } = await supabase.rpc("has_mutual_following", {
    requester_id: requesterId,
    target_id: targetId,
  });

  if (error) throw new Error(error.message);
  return !!data;
};

const unfollowUser = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .select();

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    const err = new Error("You are not following this user");
    err.code = "NOT_FOLLOWING";
    throw err;
  }

  return true;
};

const getFollowers = async (userId) => {
  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      follower_id,
      created_at,
      profiles!follows_follower_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        avatar_color,
        avatar_preset,
        gradient,
        initials
      )
    `
    )
    .eq("following_id", userId);

  if (error) throw new Error(error.message);
  return data;
};

const getFollowing = async (userId) => {
  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      following_id,
      created_at,
      profiles!follows_following_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        avatar_color,
        avatar_preset,
        gradient,
        initials
      )
    `
    )
    .eq("follower_id", userId);

  if (error) throw new Error(error.message);
  return data;
};

const getCounts = async (userId) => {
  const [{ count: followersCount, error: err1 }, { count: followingCount, error: err2 }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

  if (err1) throw new Error(err1.message);
  if (err2) throw new Error(err2.message);

  return { followers: followersCount, following: followingCount };
};

const isFollowing = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return !!data;
};

// REMOVED: Follow Permission feature has been removed from the application.
// The followUser function above still reads follow_permission from the DB
// for enforcement, but the user-facing settings APIs are disabled.

// const updateFollowPermission = async (userId, permission) => {
//   const { data, error } = await supabase
//     .from('profiles')
//     .update({ follow_permission: permission })
//     .eq('id', userId)
//     .select('id, follow_permission')
//     .maybeSingle();
//
//   if (error) throw new Error(error.message);
//   return data;
// };

// const getFollowPermission = async (userId) => {
//   const { data, error } = await supabase
//     .from('profiles')
//     .select('follow_permission')
//     .eq('id', userId)
//     .maybeSingle();
//
//   if (error) throw new Error(error.message);
//   return data?.follow_permission ?? 'everyone';
// };

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getCounts,
  isFollowing,
  // REMOVED: Follow Permission feature removed
  // updateFollowPermission,
  // getFollowPermission,
};

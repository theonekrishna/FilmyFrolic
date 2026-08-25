const { supabase } = require("../../configs/supabase");
const model = require("./communities.model");
const NotificationService = require("../../services/notification.service");

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Communities ───────────────────────────────────────────────────────────────

exports.fetchAllCommunities = async (req, res) => {
  try {
    const userId = req.user?.id || req.query?.userId || null;

    const { data, error } = await model.fetchAllCommunities();
    if (error) throw error;

    const formatted = data.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      banner_url: c.banner_url || "",
      created_by: c.created_by,
      created_at: c.created_at,
      avatar_emoji: c.avatar_emoji || "🎬",
      avatar_gradient: c.avatar_gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
      genres: c.genres || [],
      category: c.category || "General",
      is_trending: c.is_trending || false,
      privacy: c.privacy || "public",
      members_count: [{ count: c.members_count?.[0]?.count ?? 0 }],
      is_joined: userId
        ? c.community_members?.some((m) => String(m.user_id) === String(userId))
        : false,
      is_creator: userId ? String(c.created_by) === String(userId) : false,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCommunity = async (req, res) => {
  try {
    const created_by = req.user.id;

    const { name, description, avatar_emoji, avatar_gradient, category, genres, privacy } =
      req.body;

    let banner_url = req.body.banner_url || "";

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const filePath = `banners/${created_by}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("community-banners")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("community-banners").getPublicUrl(filePath);

      banner_url = urlData.publicUrl;
    }

    // Reject duplicate community names (case-insensitive)
    const { data: existing } = await model.findCommunityByName(name);
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "A community with this name already exists" });

    const { data, error } = await model.createCommunity({
      name,
      description,
      banner_url,
      avatar_emoji,
      avatar_gradient,
      category,
      genres,
      created_by,
      privacy: privacy || "public",
    });
    if (error) throw error;

    await model.addCommunityMember(data.id, created_by, "admin");

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isUUID(id))
      return res.status(400).json({ success: false, message: "Invalid community UUID" });

    const { data, error } = await model.deleteCommunity(id, userId);
    if (error) throw error;

    if (!data || data.length === 0)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized or community not found" });

    res.status(200).json({ success: true, message: "Community deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Posts ─────────────────────────────────────────────────────────────────────

exports.getCommunityPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query?.userId || null;

    if (!isUUID(id)) return res.status(200).json({ success: true, data: [] });

    // ── Privacy gate ──────────────────────────────────────────────────────────
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("privacy, created_by")
      .eq("id", id)
      .maybeSingle();

    if (communityError) throw communityError;

    const privacy = community?.privacy || "public";

    if (privacy !== "public") {
      if (!userId)
        return res.status(401).json({
          success: false,
          message: "Please login to view posts in this community",
        });

      const { data: membership } = await model.isMember(id, userId);
      if (!membership)
        return res.status(403).json({
          success: false,
          message: "You must be a member to view posts in this community",
        });
    }
    // ── End privacy gate ──────────────────────────────────────────────────────

    const { data: postsData, error: postsError } = await model.getPostsByCommunity(id);
    if (postsError) throw postsError;

    const postIds = postsData.map((p) => p.id);
    let reacts = [];

    if (postIds.length) {
      const { data, error } = await model.getReactionsByPostIds(postIds);
      if (error) throw error;
      reacts = data;
    }

    const formatted = postsData.map((post) => {
      const author = post.profiles || {};
      const postReacts = reacts.filter((r) => String(r.post_id) === String(post.id));
      const reactions = ["👍", "❤️", "😂", "😱", "🔥"].map((emoji) => ({
        emoji,
        count: postReacts.filter((r) => r.emoji === emoji).length,
        reacted: isUUID(userId)
          ? postReacts.some((r) => r.emoji === emoji && String(r.user_id) === String(userId))
          : false,
      }));

      return {
        id: post.id,
        created_by: post.user_id,
        is_owner: isUUID(userId) ? String(post.user_id) === String(userId) : false,
        user: author.display_name || author.username || "Unknown User",
        initials: author.initials || author.name?.substring(0, 2).toUpperCase() || "UU",
        gradient: author.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
        avatar_url: author.avatar_url || null,
        timeAgo: getTimeAgo(post.created_at),
        content: post.content,
        attachedMovie: post.attached_movie || null,
        images: post.media_url ? [post.media_url] : [],
        reactions,
        commentCount: post.comments?.[0]?.count || 0,
        shareCount: post.share_count || 0,
        isSpoiler: post.is_spoiler || false,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user.id;
    const { content, mediaUrl, isSpoiler, attachedMovie } = req.body;

    if (!isUUID(communityId))
      return res.status(400).json({ success: false, message: "Invalid community UUID" });

    // Only members can post (enforced for all privacy types)
    const { data: membership } = await model.isMember(communityId, userId);
    if (!membership)
      return res.status(403).json({
        success: false,
        message: "You must be a member to post in this community",
      });

    const { data, error } = await model.createPost({
      community_id: communityId,
      user_id: userId,
      content,
      media_url: mediaUrl || null,
      is_spoiler: isSpoiler || false,
      attached_movie: attachedMovie || null,
    });
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id: communityId, postId } = req.params;
    const userId = req.user.id;

    if (!isUUID(postId) || !isUUID(communityId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    const { error } = await model.deletePost(postId, userId, communityId);
    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Reactions ─────────────────────────────────────────────────────────────────

exports.reactToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { emoji } = req.body;

    if (!isUUID(postId))
      return res.status(400).json({ success: false, message: "Invalid post UUID" });

    const { data: post, error: postError } = await model.getPostById(postId);
    if (postError) throw postError;
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const { data: existing, error: findError } = await model.findReaction(postId, userId, emoji);
    if (findError) throw findError;

    if (existing) {
      const { error } = await model.deleteReaction(existing.id);
      if (error) throw error;
      return res.status(200).json({ success: true, reacted: false });
    }

    const { error } = await model.addReaction({ post_id: postId, user_id: userId, emoji });
    if (error) throw error;

    try {
      if (post.user_id && post.user_id !== userId) {
        const actorName = await NotificationService.getActorDisplayName(userId);
        await NotificationService.createNotification({
          userId: post.user_id,
          actorId: userId,
          title: "New Reaction",
          message: `${actorName} reacted ${emoji} to your post`,
          type: "post_reaction",
          entityType: "post",
          entityId: postId,
          actionUrl: `/communities/${req.params.id || ""}/posts`,
          groupKey: `reaction:post:${postId}`,
          icon: "Heart",
          accent: "#ef4444",
          metadata: { emoji },
        });
      }
    } catch (notifErr) {
      console.error("[communities.reactToPost] notification error:", notifErr.message);
    }

    res.status(200).json({ success: true, reacted: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Members ───────────────────────────────────────────────────────────────────

exports.getCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isUUID(id)) return res.status(200).json({ success: true, data: [], isJoined: false });

    const { data, error } = await model.getMembersByCommunity(id);
    if (error) throw error;

    const isJoined = userId ? data.some((m) => String(m.user_id) === String(userId)) : false;

    const formatted = data.map((m) => ({
      id: m.profiles?.id,
      username: m.profiles?.username || "Unknown",
      name: m.profiles?.display_name || "Unknown",
      avatarUrl: m.profiles?.avatar_url || null,
      initials: m.profiles?.initials || "UU",
      role: m.role,
      gradient: m.profiles?.gradient || "linear-gradient(135deg, #e91e8c, #9b59b6)",
      joined: getTimeAgo(m.joined_at),
    }));

    res.status(200).json({ success: true, data: formatted, isJoined });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user?.id;

    if (!isUUID(communityId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    // ── Fetch community privacy setting ───────────────────────────────────────
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("created_by, name, privacy")
      .eq("id", communityId)
      .maybeSingle();

    if (communityError) throw communityError;
    if (!community) return res.status(404).json({ success: false, message: "Community not found" });

    // Prevent creator from re-joining (they're already admin)
    if (String(community.created_by) === String(userId))
      return res
        .status(400)
        .json({ success: false, message: "You are the creator of this community" });

    const privacy = community.privacy || "public";

    // ── INVITE ONLY: block unless a valid accepted invite exists ──────────────
    if (privacy === "invite_only") {
      const { data: invite } = await model.getInvite(communityId, userId);
      if (!invite || invite.status !== "accepted")
        return res.status(403).json({
          success: false,
          message: "This community is invite-only. You need an invitation to join.",
        });

      // Invite is valid — proceed to direct join (falls through to public join below)
    }

    // ── PRIVATE: create a join request instead of directly joining ─────────────
    if (privacy === "private") {
      // Check if request already exists
      const { data: existing } = await model.getJoinRequest(communityId, userId);
      if (existing) {
        if (existing.status === "pending")
          return res.status(200).json({
            success: true,
            pending: true,
            message: "Your join request is already pending approval",
          });
        if (existing.status === "approved")
          return res.status(400).json({ success: false, message: "You are already a member" });
        // If rejected, allow re-request by falling through
      }

      const { error: reqError } = await model.createJoinRequest(communityId, userId);
      if (reqError) throw reqError;

      // Notify the creator about the join request
      try {
        const actorName = await NotificationService.getActorDisplayName(userId);
        await NotificationService.createNotification({
          userId: community.created_by,
          actorId: userId,
          title: "Join Request",
          message: `${actorName} requested to join ${community.name}`,
          type: "join_request",
          entityType: "community",
          entityId: communityId,
          actionUrl: `/communities/${communityId}/members`,
          groupKey: `join_request:community:${communityId}`,
          icon: "UserPlus",
          accent: "#f59e0b",
        });
      } catch (notifErr) {
        console.error("[communities.joinCommunity] notification error:", notifErr.message);
      }

      return res.status(200).json({
        success: true,
        pending: true,
        message: "Join request sent. Waiting for admin approval.",
      });
    }

    // ── PUBLIC (or invite_only with valid invite): direct join ─────────────────
    const { error } = await model.joinCommunity(communityId, userId);
    if (error) throw error;

    try {
      const actorName = await NotificationService.getActorDisplayName(userId);
      await NotificationService.createNotification({
        userId: community.created_by,
        actorId: userId,
        title: "New Member",
        message: `${actorName} joined ${community.name}`,
        type: "community_join",
        entityType: "community",
        entityId: communityId,
        actionUrl: `/communities/${communityId}`,
        groupKey: `join:community:${communityId}`,
        icon: "Users",
        accent: "#6366f1",
      });
    } catch (notifErr) {
      console.error("[communities.joinCommunity] notification error:", notifErr.message);
    }

    res.status(200).json({ success: true, pending: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.leaveCommunity = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user?.id;

    if (!isUUID(communityId) || !isUUID(userId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    const { error } = await model.leaveCommunity(communityId, userId);
    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Join Request Management (for private community admins) ────────────────────

exports.getJoinRequests = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user.id;

    if (!isUUID(communityId))
      return res.status(400).json({ success: false, message: "Invalid community UUID" });

    // Only admin/creator can see requests
    const { data: membership } = await model.isMember(communityId, userId);
    if (!membership || membership.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { data, error } = await model.getPendingJoinRequests(communityId);
    if (error) throw error;

    const formatted = (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      status: r.status,
      requestedAt: getTimeAgo(r.created_at),
      user: {
        id: r.profiles?.id,
        username: r.profiles?.username || "Unknown",
        name: r.profiles?.display_name || "Unknown",
        avatarUrl: r.profiles?.avatar_url || null,
        initials: r.profiles?.initials || "UU",
        gradient: r.profiles?.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
      },
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.handleJoinRequest = async (req, res) => {
  try {
    const { id: communityId, requestUserId } = req.params;
    const adminId = req.user.id;
    const { action } = req.body; // 'approve' | 'reject'

    if (!isUUID(communityId) || !isUUID(requestUserId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    if (!["approve", "reject"].includes(action))
      return res
        .status(400)
        .json({ success: false, message: "action must be 'approve' or 'reject'" });

    // Only admin role (which maps to creator in your schema) can handle requests
    const { data: membership } = await model.isMember(communityId, adminId);
    if (!membership || membership.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    // Verify the request exists and is pending
    const { data: joinRequest } = await model.getJoinRequest(communityId, requestUserId);
    if (!joinRequest)
      return res.status(404).json({ success: false, message: "Join request not found" });
    if (joinRequest.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: `Request already ${joinRequest.status}` });

    if (action === "approve") {
      // Add user as member first
      const { error: joinError } = await model.joinCommunity(communityId, requestUserId);
      if (joinError) throw joinError;

      // Then update the request status
      const { error: updateError } = await model.updateJoinRequest(
        communityId,
        requestUserId,
        "approved"
      );
      if (updateError) throw updateError;

      // Notify the user that they were approved
      try {
        const { data: community } = await supabase
          .from("communities")
          .select("name")
          .eq("id", communityId)
          .maybeSingle();

        const adminName = await NotificationService.getActorDisplayName(adminId);
        await NotificationService.createNotification({
          userId: requestUserId,
          actorId: adminId,
          title: "Join Request Approved",
          message: `Your request to join ${community?.name || "the community"} has been approved!`,
          type: "join_approved",
          entityType: "community",
          entityId: communityId,
          actionUrl: `/communities/${communityId}`,
          groupKey: `join_approved:community:${communityId}:${requestUserId}`,
          icon: "CheckCircle",
          accent: "#22c55e",
        });
      } catch (notifErr) {
        console.error("[communities.handleJoinRequest] notification error:", notifErr.message);
      }
    } else {
      const { error: updateError } = await model.updateJoinRequest(
        communityId,
        requestUserId,
        "rejected"
      );
      if (updateError) throw updateError;

      // Notify the user about rejection
      try {
        const { data: community } = await supabase
          .from("communities")
          .select("name")
          .eq("id", communityId)
          .maybeSingle();

        await NotificationService.createNotification({
          userId: requestUserId,
          actorId: adminId,
          title: "Join Request Rejected",
          message: `Your request to join ${community?.name || "the community"} was not approved`,
          type: "join_rejected",
          entityType: "community",
          entityId: communityId,
          actionUrl: `/communities`,
          groupKey: `join_rejected:community:${communityId}:${requestUserId}`,
          icon: "XCircle",
          accent: "#ef4444",
        });
      } catch (notifErr) {
        console.error("[communities.handleJoinRequest] notification error:", notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message:
        action === "approve" ? "User approved and added to community" : "Join request rejected",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Invites (for invite-only communities) ─────────────────────────────────────

exports.inviteUser = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const adminId = req.user.id;
    const { userId: targetUserId } = req.body;

    if (!isUUID(communityId) || !isUUID(targetUserId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    // Only admin can invite
    const { data: membership } = await model.isMember(communityId, adminId);
    if (!membership || membership.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { data: community } = await supabase
      .from("communities")
      .select("name, privacy")
      .eq("id", communityId)
      .maybeSingle();

    if (community?.privacy !== "invite_only")
      return res.status(400).json({ success: false, message: "Community is not invite-only" });

    // Check if already a member
    const { data: existing } = await model.isMember(communityId, targetUserId);
    if (existing)
      return res.status(400).json({ success: false, message: "User is already a member" });

    const { error } = await model.createInvite(communityId, targetUserId, adminId);
    if (error) throw error;

    // Notify the invited user
    try {
      const adminName = await NotificationService.getActorDisplayName(adminId);
      await NotificationService.createNotification({
        userId: targetUserId,
        actorId: adminId,
        title: "Community Invite",
        message: `${adminName} invited you to join ${community.name}`,
        type: "community_invite",
        entityType: "community",
        entityId: communityId,
        actionUrl: `/communities/${communityId}`,
        groupKey: `invite:community:${communityId}:${targetUserId}`,
        icon: "Mail",
        accent: "#8b5cf6",
      });
    } catch (notifErr) {
      console.error("[communities.inviteUser] notification error:", notifErr.message);
    }

    res.status(200).json({ success: true, message: "Invite sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptInvite = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    const userId = req.user.id;

    if (!isUUID(communityId))
      return res.status(400).json({ success: false, message: "Invalid UUID" });

    const { data: invite } = await model.getInvite(communityId, userId);
    if (!invite)
      return res
        .status(404)
        .json({ success: false, message: "No invite found for this community" });
    if (invite.status === "revoked")
      return res.status(403).json({ success: false, message: "This invite has been revoked" });
    if (invite.status === "accepted")
      return res.status(400).json({ success: false, message: "Invite already accepted" });

    // Mark invite as accepted
    const { error: acceptError } = await model.acceptInvite(communityId, userId);
    if (acceptError) throw acceptError;

    // Now join the community
    const { error: joinError } = await model.joinCommunity(communityId, userId);
    if (joinError) throw joinError;

    res.status(200).json({ success: true, message: "Invite accepted, you are now a member" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Events ────────────────────────────────────────────────────────────────────

exports.getCommunityEvents = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(200).json({ success: true, data: [] });

    const { data, error } = await model.getEventsByCommunity(id);
    if (error) throw error;

    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── User activity ─────────────────────────────────────────────────────────────

exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user?.id || req.query?.userId;
    if (!isUUID(userId)) return res.status(400).json({ success: false, message: "Invalid UUID" });

    const [{ count: communitiesJoined }, { count: postsCount }, { data: userPosts }] =
      await Promise.all([
        model.getUserCommunitiesCount(userId),
        model.getUserPostsCount(userId),
        model.getUserPostIds(userId),
      ]);

    let upvotesEarned = 0;
    if (userPosts?.length) {
      const postIds = userPosts.map((p) => p.id);
      const { count } = await model.getReactionsCountByPostIds(postIds);
      upvotesEarned = count || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        communitiesJoined: communitiesJoined || 0,
        postsCount: postsCount || 0,
        upvotesEarned,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Trending topics ───────────────────────────────────────────────────────────

exports.getTrendingTopics = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUUID(id)) return res.status(200).json({ success: true, data: [] });

    const { data: posts, error } = await model.getPostsContentByCommunity(id);
    if (error) throw error;

    const hashtagCounts = {};
    (posts || []).forEach((post) => {
      const tags = post.content.match(/#\w+/g) || [];
      tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
      });
    });

    const sorted = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    res.status(200).json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

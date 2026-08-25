const roomService = require("./room.service");
const agoraService = require("./agora.service");
const { supabase } = require("../../configs/supabase");
const NotificationService = require("../../services/notification.service");

/**
 * 1. CREATE ROOM
 * Allows creating any room type (Watch Party, etc.), but auto-configures
 * hardware state for video_call vs audio_room.
 */
const createRoom = async (req, res) => {
  try {
    const owner_id = req.user.id;

    const {
      title,
      subtitle,
      room_type = "audio_room",
      media_title,
      max_participants,
      privacy,
      scheduled_time,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    // Upload image if provided
    let image_url = null;
    if (req.file) {
      image_url = await roomService.uploadImageToSupabase(req.file);
    }

    // Normalize privacy
    let safePrivacy = (privacy || "public").toLowerCase().trim();

    if (safePrivacy.includes("friend")) {
      safePrivacy = "friends_and_followers";
    } else if (safePrivacy.includes("private") || safePrivacy.includes("invite")) {
      safePrivacy = "invite_only";
    } else {
      safePrivacy = "public";
    }

    const room = await roomService.createRoom({
      title: title.trim(),
      subtitle: subtitle || null,
      media_title: media_title || null,
      owner_id,
      image_url,
      room_type,
      max_participants: Number(max_participants) || 50,
      privacy: safePrivacy,
      scheduled_time: scheduled_time || null,
    });

    // Host participation
    const agoraUid = Math.floor(Math.random() * 1000000) + 1;

    const participation = await roomService.upsertParticipation({
      room_id: room.id,
      user_id: owner_id,
      agora_uid: agoraUid,
      role: "host",
      is_mic_on: true,
      is_video_on: room.room_type === "video_room",
    });

    const agoraToken = agoraService.generateToken(room.id, agoraUid, ["host"], room.room_type);

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        room,
        participation,
        agora_token: agoraToken,
        agora_uid: agoraUid,
        agora_app_id: process.env.AGORA_APP_ID,
        room_type: room.room_type,
      },
    });
  } catch (error) {
    console.error("Create Room Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create room",
    });
  }
};

/**
 * 2. JOIN ROOM (The Gatekeeper)
 * Blocks entry to non-joinable rooms with "Coming Soon"
 */
const joinRoom = async (req, res) => {
  try {
    const { room_id, invite_code } = req.body;
    const user_id = req.user.id;

    // Get room
    const room = await roomService.getRoomById(room_id, user_id);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // Check existing participation
    const existingParticipation = await roomService.getParticipation(room_id, user_id);

    // ============================================================
    // 1. ROOM STATUS CHECK
    // ============================================================

    // Room permanently ended
    if (room.status === "ended") {
      return res.status(403).json({
        success: false,
        message: "This session has ended and is no longer accessible. 🚫",
      });
    }

    // Room temporarily stopped
    if (room.status === "stopped") {
      const currentRole =
        existingParticipation?.role || (room.owner_id === user_id ? "host" : "listener");

      // Only host/co-host can resume
      if (["host", "co-host"].includes(currentRole)) {
        await roomService.resumeRoom(room_id);

        // Keep local room object in sync
        room.status = "live";
      } else {
        return res.status(403).json({
          success: false,
          error: "The host has paused this room. Please wait for the session to resume.",
        });
      }
    }

    // ============================================================
    // 2. ROOM TYPE CHECK
    // ============================================================

    const supportedJoinTypes = ["video_room", "audio_room", "voice_room"];

    if (!supportedJoinTypes.includes(room.room_type)) {
      return res.status(200).json({
        success: false,
        message: "This room type is coming soon! 🚀",
      });
    }

    // ============================================================
    // 3. PRIVACY CHECK
    // ============================================================

    if (room.owner_id !== user_id) {
      // Invite Only Room
      if (room.privacy === "invite_only") {
        if (!invite_code || room.invite_code !== invite_code) {
          return res.status(403).json({
            success: false,
            error: "Invalid or missing invite code.",
          });
        }
      }

      // Followers Only Room
      if (room.privacy === "friends_and_followers") {
        const isEligible = await roomService.checkUserCanJoinFollowersRoom(room.owner_id, user_id);

        if (!isEligible) {
          return res.status(403).json({
            success: false,
            error: "Access restricted to followers only.",
          });
        }
      }
    }

    // ============================================================
    // 4. ASSIGN ROLE
    // ============================================================

    let assignedRole =
      room.owner_id === user_id ? "host" : existingParticipation?.role || "listener";

    if (Array.isArray(assignedRole)) {
      assignedRole = assignedRole[0];
    }

    // ============================================================
    // 5. AGORA UID
    // ============================================================

    const agoraUid = existingParticipation?.agora_uid
      ? existingParticipation.agora_uid
      : Math.floor(Math.random() * 1000000) + 1;

    // ============================================================
    // 6. UPSERT PARTICIPATION
    // ============================================================

    const participation = await roomService.upsertParticipation({
      room_id,
      user_id,
      agora_uid: agoraUid,
      role: assignedRole,
      is_mic_on: assignedRole === "host",
      is_video_on: false,
    });

    // ============================================================
    // 7. GENERATE AGORA TOKEN
    // ============================================================

    const agoraToken = agoraService.generateToken(
      room_id,
      agoraUid,
      [assignedRole],
      room.room_type
    );

    // ============================================================
    // 8. NOTIFICATION: room join
    // ============================================================
    try {
      if (room.owner_id && room.owner_id !== user_id && assignedRole !== "host") {
        const actorName = await NotificationService.getActorDisplayName(user_id);
        await NotificationService.createNotification({
          userId: room.owner_id,
          actorId: user_id,
          title: "Someone Joined",
          message: `${actorName} joined your room "${room.title}"`,
          type: "room_join",
          entityType: "room",
          entityId: room_id,
          actionUrl: `/rooms/${room_id}`,
          groupKey: `join:room:${room_id}`,
          icon: "Radio",
          accent: "#8b5cf6",
        });
      }
    } catch (notifErr) {
      console.error("[room.joinRoom] notification error:", notifErr.message);
    }

    // ============================================================
    // 9. RESPONSE
    // ============================================================

    return res.status(200).json({
      success: true,
      message: "Joined successfully",
      data: {
        room,
        participation,
        agora_token: agoraToken,
        agora_uid: agoraUid,
        agora_app_id: process.env.AGORA_APP_ID,
        room_type: room.room_type,
      },
    });
  } catch (error) {
    console.error("Join Room Error:", error);

    // ── Notification: room join (fire-and-forget, placed before error return) ──
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to join room",
    });
  }
};

/**
 * 2.5. GET NEW AGORA TOKEN
 */
const getAgoraToken = async (req, res) => {
  try {
    const { room_id } = req.params;
    const user_id = req.user.id;

    const room = await roomService.getRoomById(room_id, user_id);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const participation = await roomService.getParticipation(room_id, user_id);
    if (!participation) return res.status(403).json({ error: "Not in room" });

    const token = agoraService.generateToken(
      room.id,
      participation.agora_uid,
      [participation.role],
      room.room_type
    );

    res.status(200).json({
      message: "Token retrieved successfully",
      data: {
        agora_token: token,
        agora_uid: participation.agora_uid,
        role: participation.role,
        room_type: room.room_type,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 3. DISCOVERY ROUTES
 */
const getAllRooms = async (req, res) => {
  try {
    let userId = req.user?.id || null;

    // Optional: try to get userId from token if not provided by middleware
    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const { data } = await supabase.auth.getUser(token);
      userId = data?.user?.id || null;
    }

    const rooms = await roomService.getAllRooms(userId);

    const sanitizedData = rooms.map((r) => {
      // If I'm not the host, I can't see the invite code
      if (r.owner_id !== userId) {
        delete r.invite_code;
      }
      return r;
    });

    res.status(200).json({
      message: "Rooms fetched successfully",
      count: sanitizedData.length,
      data: sanitizedData, // Now includes host_joined: true/false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoomById = async (req, res) => {
  try {
    const userId = req.user?.id; // May be undefined if user isn't logged in yet
    const data = await roomService.getRoomById(req.params.id, userId);

    if (!data) {
      return res.status(404).json({ error: "Room not found" });
    }

    // --- INVITE LINK & PRIVACY LOGIC ---

    // If it's a private/invite-only room
    if (data.privacy === "invite_only") {
      // 1. If requester is NOT the host, we HIDE the real invite_code
      if (data.owner_id !== userId) {
        delete data.invite_code;

        // Note: We still return the Room Title and Owner Details.
        // This allows the frontend to show: "You've been invited to [Host's] Room: [Title]"
        // But they can't "Join" unless they provide the correct code in the join request.
      }
    }

    res.status(200).json({
      message: "Room details fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoomInviteLink = async (req, res) => {
  try {
    const data = await roomService.getRoomById(req.params.room_id, req.user.id);
    if (!data) return res.status(404).json({ error: "Room not found" });

    if (!data.is_host) {
      return res.status(403).json({ error: "Only the room host can access the invite link" });
    }

    res.status(200).json({
      message: "Invite link fetched successfully",
      data: {
        invite_link: data.invite_link,
        invite_code: data.invite_code,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 4. PARTICIPANT LIST
 */
const getRoomUsersDetails = async (req, res) => {
  try {
    const participants = await roomService.getRoomUsersDetails(req.params.room_id);
    res.status(200).json({
      message: "Participants fetched successfully",
      count: participants.length,
      agora_app_id: process.env.AGORA_APP_ID,
      data: participants,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 5. MEDIA CONTROL
 */
const toggleMedia = async (req, res) => {
  try {
    const { room_id, is_mic_on, is_video_on } = req.body;
    const user_id = req.user.id;

    const participation = await roomService.getParticipation(room_id, user_id);
    if (!participation) return res.status(403).json({ error: "Not in room" });

    // Logical Gate: Must be one of these three strings
    const allowedToShare = ["host", "co-host", "speaker"].includes(participation.role);

    if (!allowedToShare && (is_mic_on || is_video_on)) {
      return res.status(403).json({
        error: "Permission Denied. Listeners cannot share media. Request to be a speaker first.",
      });
    }

    const data = await roomService.updateMediaMetadata(room_id, user_id, {
      is_mic_on,
      is_video_on,
    });
    res.status(200).json({ message: "Media status updated", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const raiseHand = async (req, res) => {
  try {
    const { room_id, is_hand_raised } = req.body;
    const user_id = req.user.id;

    const data = await roomService.updateHandRaiseState(room_id, user_id, is_hand_raised);

    // ── Notification: hand raised ───────────────────────────────
    if (is_hand_raised) {
      try {
        const room = await roomService.getRoomById(room_id, user_id);
        if (room?.owner_id && room.owner_id !== user_id) {
          const actorName = await NotificationService.getActorDisplayName(user_id);
          await NotificationService.createNotification({
            userId: room.owner_id,
            actorId: user_id,
            title: "Hand Raised",
            message: `${actorName} raised their hand in "${room.title}"`,
            type: "room_hand_raised",
            entityType: "room",
            entityId: room_id,
            actionUrl: `/rooms/${room_id}`,
            groupKey: `hand:room:${room_id}:${user_id}`,
            icon: "Hand",
            accent: "#eab308",
          });
        }
      } catch (notifErr) {
        console.error("[room.raiseHand] notification error:", notifErr.message);
      }
    }

    res.status(200).json({
      message: is_hand_raised ? "Hand raised" : "Hand lowered",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 6. PARTICIPANT ACTIONS
 */
const exitRoom = async (req, res) => {
  try {
    const { room_id } = req.body;
    const authToken = req.headers.authorization;
    await roomService.removeParticipation(room_id, req.user.id, authToken);
    res.status(200).json({ message: "You have left the room" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 7. HOST CONTROLS
 */

const muteAllParticipants = async (req, res) => {
  try {
    const { room_id } = req.body;
    if (!(await roomService.isHost(room_id, req.user.id)))
      return res.status(403).json({ error: "Unauthorized" });
    await roomService.muteAllInRoom(room_id, req.user.id);
    res.status(200).json({ message: "Everyone muted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const kickParticipant = async (req, res) => {
  try {
    const { room_id, target_user_id } = req.body;
    if (!(await roomService.isHost(room_id, req.user.id)))
      return res.status(403).json({ error: "Unauthorized" });
    await roomService.removeParticipation(room_id, target_user_id);
    res.status(200).json({ message: "Participant kicked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { room_id, target_user_id, new_role } = req.body;

    const requester = await roomService.getParticipation(room_id, req.user.id);
    if (!["host", "co-host"].includes(requester?.role)) {
      return res.status(403).json({ error: "Unauthorized. Management permissions required." });
    }

    // Protection: Co-host cannot create a new Host
    if (requester.role === "co-host" && new_role === "host") {
      return res.status(403).json({ error: "Only the primary Host can appoint other Hosts." });
    }

    // const data = await roomService.updateParticipantRole(room_id, target_user_id, new_role);

    const safeRole = Array.isArray(new_role) ? new_role[0] : new_role;

    const allowedRoles = ["host", "co-host", "speaker", "listener"];

    if (!allowedRoles.includes(safeRole)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    const data = await roomService.updateParticipantRole(room_id, target_user_id, safeRole);

    // ── Notification: role changed ───────────────────────────────
    try {
      const actorName = await NotificationService.getActorDisplayName(req.user.id);
      await NotificationService.createNotification({
        userId: target_user_id,
        actorId: req.user.id,
        title: "Role Updated",
        message: `${actorName} changed your role to ${safeRole}`,
        type: "room_role_changed",
        entityType: "room",
        entityId: room_id,
        actionUrl: `/rooms/${room_id}`,
        groupKey: `role:room:${room_id}:${target_user_id}`,
        icon: "Shield",
        accent: "#6366f1",
        priority: "high",
        metadata: { newRole: safeRole },
      });
    } catch (notifErr) {
      console.error("[room.updateUserRole] notification error:", notifErr.message);
    }

    res.status(200).json({ message: `User role updated to ${new_role}`, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleMuteUser = async (req, res) => {
  try {
    const { room_id, target_user_id, is_mic_on } = req.body;
    if (!(await roomService.isHost(room_id, req.user.id)))
      return res.status(403).json({ error: "Unauthorized" });
    const data = await roomService.updateMediaMetadata(room_id, target_user_id, {
      is_mic_on,
    });
    res.status(200).json({ message: "Mute status updated", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const debugKeyRole = (req, res) => {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return res.status(500).json({ error: "Key not found" });
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString());
    res.json({ message: "Key decoded successfully", role: payload.role });
  } catch (e) {
    res.json({ error: "Could not decode key", details: e.message });
  }
};
// room.controller.js
const stopRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const user_id = req.user.id;

    const room = await roomService.getRoomById(room_id, user_id);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.owner_id !== user_id) {
      return res.status(403).json({
        error: "Only the room owner can end this room",
      });
    }

    await roomService.stopRoom(room_id, "ended");
    res.status(200).json({ message: "Room ended successfully. Session locked. 🔒" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resumeRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    if (!(await roomService.isHost(room_id, req.user.id))) {
      return res.status(403).json({ error: "Only host can resume this room" });
    }

    const room = await roomService.resumeRoom(room_id);
    res.status(200).json({
      message: "Room is now live again! 🚀",
      data: room,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const user_id = req.user.id;

    const rooms = await roomService.getMyRooms(user_id);

    res.status(200).json({
      message: "My rooms fetched successfully",
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomInviteLink,
  joinRoom,
  getRoomUsersDetails,
  exitRoom,
  kickParticipant,
  muteAllParticipants,
  stopRoom,
  updateUserRole,
  toggleMuteUser,
  toggleMedia,
  raiseHand,
  getAgoraToken,
  debugKeyRole,
  resumeRoom,
  getMyRooms,
};

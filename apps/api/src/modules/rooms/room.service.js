const { supabaseAdmin: supabase } = require("../../configs/supabase.js");
const { createClient } = require("@supabase/supabase-js");
const { log } = require("console");
const crypto = require("crypto");

const getClient = (authToken) => {
  if (!authToken) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return supabase;

  return createClient(url, key, {
    global: { headers: { Authorization: authToken } },
  });
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Utility: Generates a shareable URL for the room
 */
const buildInviteLink = (roomId, inviteCode = null) => {
  const base = `${FRONTEND_URL}/social/rooms/${roomId}`;
  return inviteCode ? `${base}?code=${inviteCode}` : base;
};

module.exports = {
  /**
   * Uploads room cover image to Supabase Storage
   */
  uploadImageToSupabase: async (file) => {
    if (!file) return null;
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = `room-covers/${fileName}`;

    const { error } = await supabase.storage
      .from("room-images")
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(filePath);

    return urlData.publicUrl;
  },

  /**
   * Creates a new room and determines status based on scheduling
   */
  createRoom: async (roomData) => {
    const isScheduled = roomData.scheduled_time && new Date(roomData.scheduled_time) > new Date();

    const payload = {
      ...roomData,
      status: isScheduled ? "draft" : "live",
    };

    if (payload.privacy === "invite_only") {
      payload.invite_code = crypto.randomBytes(3).toString("hex").toUpperCase();
    }

    const { data, error } = await supabase.from("rooms").insert(payload).select().single();

    if (error) throw error;

    return {
      ...data,
      invite_link: buildInviteLink(data.id, data.invite_code),
    };
  },

  /**
   * Fetches single room details and checks if requester is host
   */
  getRoomById: async (id, userId) => {
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `
        *,
        owner: profiles (
          *
        )
      `
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    // Logic to flip draft to live if time has passed
    if (
      data.status === "draft" &&
      data.scheduled_time &&
      new Date(data.scheduled_time) <= new Date()
    ) {
      data.status = "live";
      // Background update (don't await to keep response fast)
      supabase.from("rooms").update({ status: "live" }).eq("id", data.id).then();
    }

    return {
      ...data,
      owner_details: data.owner,
      is_host: data.owner_id === userId,
      is_my_room: data.owner_id === userId,
      // Only include the invite link in the response if the requester is the host
      invite_link: data.owner_id === userId ? buildInviteLink(data.id, data.invite_code) : null,
    };
  },

  /**
   * Fetches all rooms with participant counts
   */

  /**
   * Fetches all rooms with participant counts + joined member previews
   */
  getAllRooms: async (userId) => {
    let query = supabase
      .from("rooms")
      .select(
        `
      *,

      owner:profiles!room_owner_id_fkey (
        id,
        name,
        username,
        display_name,
        avatar_url,
        avatar_color
      ),

      room_participate (
        user_id,
        role,
        agora_uid,
        is_mic_on,
        is_video_on,
        is_hand_raised,

        participant_profile:profiles!room_participate_user_id_fkey (
          id,
          name,
          username,
          display_name,
          avatar_url,
          avatar_color
        )
      )
    `
      )
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    // Privacy Gatekeeper
    if (userId) {
      query = query.or(`privacy.neq.invite_only,owner_id.eq.${userId}`);
    } else {
      query = query.neq("privacy", "invite_only");
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((r) => {
      // AUTO LIVE FOR SCHEDULED ROOM
      if (r.status === "draft" && r.scheduled_time && new Date(r.scheduled_time) <= new Date()) {
        r.status = "live";

        supabase
          .from("rooms")
          .update({ status: "live" })
          .eq("id", r.id)
          .then(({ error }) => {
            if (error) {
              console.error("Auto-live update failed:", error);
            }
          });
      }

      // PARTICIPANTS
      const participants = (r.room_participate || [])
        // REMOVE OWNER FROM PARTICIPANTS
        .filter((p) => p.user_id !== r.owner_id)

        .map((p) => ({
          user_id: p.user_id,
          role: p.role,
          agora_uid: p.agora_uid,

          is_mic_on: p.is_mic_on,
          is_video_on: p.is_video_on,
          is_hand_raised: p.is_hand_raised,

          name: p.participant_profile?.name || null,
          username: p.participant_profile?.username || null,
          display_name: p.participant_profile?.display_name || null,

          avatar_url: p.participant_profile?.avatar_url || null,
          avatar_color: p.participant_profile?.avatar_color || null,
        }));

      return {
        ...r,

        // OWNER
        owner_details: r.owner,

        // PARTICIPANT STATS
        participant_count: participants.length + 1,

        // LIVE JOINED MEMBERS
        participants,

        // INVITE LINK ONLY FOR HOST
        invite_link: r.owner_id === userId ? buildInviteLink(r.id, r.invite_code) : null,

        // CLEANUP
        owner: undefined,
        room_participate: undefined,

        // FLAGS
        is_my_room: r.owner_id === userId,
      };
    });
  },
  /**
   * Stops a room.
   * 'stopped' = temporary pause (can be resumed).
   * 'ended' = permanent close.
   */
  stopRoom: async (room_id, status = "ended") => {
    // 1. Kick all participants out of the participation table
    const { error: deleteError } = await supabase
      .from("room_participate")
      .delete()
      .eq("room_id", room_id);

    if (deleteError) throw deleteError;

    // 2. Update the room status
    const { error: statusError } = await supabase
      .from("rooms")
      .update({ status })
      .eq("id", room_id);

    if (statusError) throw statusError;
  },
  /**
   * Checks if a user is a friend or follower of the host
   */

  checkUserCanJoinFollowersRoom: async (host_id, user_id) => {
    try {
      // Owner can always join
      if (host_id === user_id) {
        return true;
      }

      // Check follow relationship
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user_id)
        .eq("following_id", host_id)
        .maybeSingle();
      if (error) {
        console.error("Follow check error:", error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error("Follower validation failed:", err);
      return false;
    }
  },

  /**
   * Fetches participation record for a user in a room
   */
  getParticipation: async (room_id, user_id) => {
    const { data, error } = await supabase
      .from("room_participate")
      .select("*")
      .match({ room_id, user_id })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  getMyRooms: async (user_id) => {
    // 1. Rooms owned by the user
    const { data: ownedRooms, error: ownedError } = await supabase
      .from("rooms")
      .select(
        `
      *,

      owner:profiles!room_owner_id_fkey (
        id,
        name,
        username,
        display_name,
        avatar_url,
        avatar_color
      ),

      room_participate (
        user_id,
        role,
        agora_uid,
        is_mic_on,
        is_video_on,
        is_hand_raised,

        participant_profile:profiles!room_participate_user_id_fkey (
          id,
          name,
          username,
          display_name,
          avatar_url,
          avatar_color
        )
      )
    `
      )
      .eq("owner_id", user_id);

    if (ownedError) throw ownedError;

    // 2. Rooms where user participated
    const { data: participatedRooms, error: partError } = await supabase
      .from("room_participate")
      .select(
        `
      room_id,

      rooms (
        *,

        owner:profiles!room_owner_id_fkey (
          id,
          name,
          username,
          display_name,
          avatar_url,
          avatar_color
        ),

        room_participate (
          user_id,
          role,
          agora_uid,
          is_mic_on,
          is_video_on,
          is_hand_raised,

          participant_profile:profiles!room_participate_user_id_fkey (
            id,
            name,
            username,
            display_name,
            avatar_url,
            avatar_color
          )
        )
      )
    `
      )
      .eq("user_id", user_id);

    if (partError) throw partError;

    // Extract room objects
    const joinedRooms = (participatedRooms || []).map((p) => p.rooms).filter(Boolean);

    // Merge and remove duplicates
    const allRoomsMap = new Map();

    [...ownedRooms, ...joinedRooms].forEach((room) => {
      if (!room) return;

      const participants = (room.room_participate || [])
        .filter((p) => p.user_id !== room.owner_id)
        .map((p) => ({
          user_id: p.user_id,
          role: p.role,
          agora_uid: p.agora_uid,

          is_mic_on: p.is_mic_on,
          is_video_on: p.is_video_on,
          is_hand_raised: p.is_hand_raised,

          name: p.participant_profile?.name || null,
          username: p.participant_profile?.username || null,
          display_name: p.participant_profile?.display_name || null,

          avatar_url: p.participant_profile?.avatar_url || null,
          avatar_color: p.participant_profile?.avatar_color || null,
        }));

      allRoomsMap.set(room.id, {
        ...room,

        // Owner Details
        owner_details: room.owner,

        // Participants
        participant_count: participants.length + 1,
        participants,

        // Invite Link (only owner)
        invite_link: room.owner_id === user_id ? buildInviteLink(room.id, room.invite_code) : null,

        // Flags
        is_my_room: room.owner_id === user_id,

        // Cleanup
        owner: undefined,
        room_participate: undefined,
      });
    });

    const finalRooms = Array.from(allRoomsMap.values());

    // Sort newest first
    finalRooms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return finalRooms;
  },
  /**
   * Joins a user to a room or updates their current role
   */
  upsertParticipation: async (pData) => {
    // Manually check if user is in room to avoid missing unique constraint errors on upsert
    // 🔥 normalize role BEFORE DB
    if (Array.isArray(pData.role)) {
      pData.role = pData.role[0];
    }

    const allowedRoles = ["host", "co-host", "speaker", "listener"];

    if (!allowedRoles.includes(pData.role)) {
      throw new Error(`Invalid role: ${pData.role}`);
    }
    const { data: existing } = await supabase
      .from("room_participate")
      .select("id")
      .match({ room_id: pData.room_id, user_id: pData.user_id })
      .limit(1);

    let result;
    if (existing && existing.length > 0) {
      result = await supabase
        .from("room_participate")
        .update(pData)
        .eq("id", existing[0].id)
        .select();
    } else {
      result = await supabase.from("room_participate").insert([pData]).select();
    }

    if (result.error) throw result.error;
    return result.data[0];
  },

  /**
   * Returns all participants in a room with their hardware state and host flag
   */
  getRoomUsersDetails: async (room_id) => {
    const { data: roomData } = await supabase
      .from("rooms")
      .select("owner_id")
      .eq("id", room_id)
      .single();

    const { data, error } = await supabase
      .from("room_participate")
      .select(`*, profiles (*)`)
      .eq("room_id", room_id);

    if (error) throw error;

    return data.map((item) => ({
      ...item.profiles,
      user_id: item.user_id,
      agora_uid: item.agora_uid,
      role: item.role,
      is_host: item.user_id === roomData?.owner_id || item.role === "host",

      // ✅ MEDIA
      is_mic_on: item.is_mic_on,
      is_video_on: item.is_video_on,

      // ✅ ADD THIS (IMPORTANT)
      is_hand_raised: item.is_hand_raised || false,

      display_name: item.profiles?.display_name || item.profiles?.name,
    }));
  },

  /**
   * Updates the UI state for others (e.g., showing a "Mic Off" icon)
   */
  updateParticipantRole: async (room_id, user_id, role) => {
    const targetRole = Array.isArray(role) ? role[0] : role;

    const { data, error } = await supabase
      .from("room_participate")
      .update({ role: targetRole })
      .match({ room_id, user_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates hand raise state
   */
  updateHandRaiseState: async (room_id, user_id, is_hand_raised) => {
    const { data, error } = await supabase
      .from("room_participate")
      .update({ is_hand_raised })
      .match({ room_id, user_id })
      .select();

    if (error) throw error;
    return data[0];
  },

  /**
   * Removes a user's participation from a room
   */
  removeParticipation: async (room_id, user_id) => {
    const { error } = await supabase.from("room_participate").delete().match({ room_id, user_id });

    if (error) throw error;
  },

  /**
   * Deletes a room entirely
   */
  deleteRoom: async (room_id) => {
    // Delete participants first to avoid FK constraint error if CASCADE is missing
    await supabase.from("room_participate").delete().eq("room_id", room_id);

    const { error } = await supabase.from("rooms").delete().eq("id", room_id);

    if (error) throw error;
  },

  /**
   * Checks if a user is the owner (host) of the room or a co-host
   */
  isHost: async (room_id, user_id) => {
    // 1. Check if user is the database owner of the room
    const { data: roomData } = await supabase
      .from("rooms")
      .select("owner_id")
      .eq("id", room_id)
      .maybeSingle();

    if (roomData && roomData.owner_id === user_id) return true;

    // 2. Check if user has an admin role string (host or co-host)
    const { data: partData } = await supabase
      .from("room_participate")
      .select("role")
      .match({ room_id, user_id })
      .maybeSingle();

    // Returns true if role is exactly 'host' or 'co-host'
    return partData && ["host", "co-host"].includes(partData.role);
  },

  /**
   * Mutes all participants in a room except the host
   */
  muteAllInRoom: async (room_id, host_id) => {
    const { error } = await supabase
      .from("room_participate")
      .update({
        role: "listener", // Changed from array to single string
        is_mic_on: false,
      })
      .eq("room_id", room_id)
      .neq("user_id", host_id); // Don't mute the host

    if (error) throw error;
  },

  resumeRoom: async (room_id) => {
    const { data, error } = await supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("id", room_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  updateMediaMetadata: async (room_id, user_id, updates) => {
    const { data, error } = await supabase
      .from("room_participate")
      .update(updates)
      .match({ room_id, user_id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

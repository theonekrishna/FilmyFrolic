const crypto = require("crypto");
const { supabaseAdmin } = require("../../configs/supabase");

const BUCKET = "message-media";

const MessagesModel = {
  async search(query, currentUserId) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, avatar_url")
      .textSearch("username_search", query, {
        type: "websearch",
        config: "english",
      })
      .neq("id", currentUserId) // exclude yourself
      .limit(10);

    if (error) throw error;
    return data;
  },

  async suggested(currentUserId) {
    // returns users you've messaged before as suggestions
    const { data, error } = await supabaseAdmin.rpc("get_suggested_users", {
      p_user_id: currentUserId,
    });

    if (error) throw error;
    return data;
  },

  async uploadMedia(file, senderId) {
    const ext = (file.originalname.split(".").pop() || "bin").toLowerCase();
    const fileName = `${senderId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);

    return {
      media_url: publicUrl,
      media_path: fileName,
      media_type: file.mimetype.startsWith("image/") ? "image" : "video",
    };
  },

  async deleteMedia(path) {
    if (!path) return;
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
    // best-effort: log but don't throw — DB row is already gone
    if (error) console.error("[deleteMedia]", error);
  },

  async create({ sender_id, receiver_id, content, media_url, media_type, media_path }) {
    // check receiver exists
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", receiver_id)
      .single();

    if (receiverError && receiverError.code === "PGRST116") {
      const err = new Error("Receiver not found");
      err.statusCode = 404;
      throw err;
    }

    if (receiverError) throw receiverError; // real DB error

    // receiver exists, proceed with insert
    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({
        sender_id,
        receiver_id,
        content: content || null,
        media_url: media_url || null,
        media_type: media_type || null,
        media_path: media_path || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversation(userA, userB, before, limit) {
    const { data: otherUser, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userB)
      .single();

    if (userError && userError.code === "PGRST116") {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userA},receiver_id.eq.${userB}),` +
          `and(sender_id.eq.${userB},receiver_id.eq.${userA})`
      )
      .lt("created_at", before) // only messages older than the cursor
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // return in ascending order so frontend renders top → bottom
    return data.reverse();
  },

  async getInbox(userId) {
    const { data, error } = await supabaseAdmin.rpc("get_inbox", { p_user_id: userId });

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId, userId) {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId)
      .eq("receiver_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found or not recipient
      throw error;
    }
    return data;
  },

  async delete(messageId, userId) {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("id", messageId)
      .eq("sender_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // no row matched
      throw error; // real DB error → 500
    }

    // cleanup storage if this message had media
    if (data?.media_path) {
      await MessagesModel.deleteMedia(data.media_path);
    }
    return data;
  },

  async markConversationRead(currentUserId, otherUserId) {
    const { data, error } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", currentUserId) // only messages sent TO the current user
      .eq("sender_id", otherUserId) // only from this specific conversation
      .eq("is_read", false) // only the unread ones
      .select();

    if (error) throw error;
    return data; // returns array of all messages that were just marked read
  },
};

module.exports = MessagesModel;

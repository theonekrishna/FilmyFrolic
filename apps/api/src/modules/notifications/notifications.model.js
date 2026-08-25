// ═══════════════════════════════════════════════════════════════════════════
// notifications.model.js
// Data access layer for the notifications module.
// All queries exclude soft-deleted notifications (deleted_at IS NULL).
// ═══════════════════════════════════════════════════════════════════════════

const { supabaseAdmin } = require("../../configs/supabase");

const NotificationsModel = {
  // ────────────────────────────────────────────────────────────────────────
  // GET NOTIFICATIONS (paginated, filtered)
  // ────────────────────────────────────────────────────────────────────────

  async getNotifications(userId, { page = 1, limit = 20, type = null, unreadOnly = false } = {}) {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("notifications")
      .select(
        `
        id,
        user_id,
        actor_id,
        title,
        message,
        type,
        icon,
        accent,
        entity_type,
        entity_id,
        action_url,
        group_key,
        priority,
        is_read,
        read_at,
        metadata,
        created_at,
        actor:profiles!notifications_actor_id_fkey (
          id,
          username,
          display_name,
          avatar_url,
          avatar_color,
          avatar_preset,
          gradient,
          initials
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq("type", type);
    }

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error, count } = await query;

    if (error) {
      // PGRST103 = offset out of range (page beyond available rows)
      // Return empty result instead of throwing
      if (error.code === "PGRST103") {
        return {
          data: [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        };
      }
      throw error;
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  // ────────────────────────────────────────────────────────────────────────
  // GET UNREAD COUNT (optimized for badges)
  // ────────────────────────────────────────────────────────────────────────

  async getUnreadCount(userId) {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .is("deleted_at", null);

    if (error) throw error;
    return count || 0;
  },

  // ────────────────────────────────────────────────────────────────────────
  // MARK SINGLE AS READ
  // ────────────────────────────────────────────────────────────────────────

  async markAsRead(notificationId, userId) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // ────────────────────────────────────────────────────────────────────────
  // MARK ALL AS READ
  // ────────────────────────────────────────────────────────────────────────

  async markAllAsRead(userId) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("is_read", false)
      .is("deleted_at", null)
      .select("id");

    if (error) throw error;
    return data || [];
  },

  // ────────────────────────────────────────────────────────────────────────
  // SOFT DELETE SINGLE
  // ────────────────────────────────────────────────────────────────────────

  async softDelete(notificationId, userId) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // ────────────────────────────────────────────────────────────────────────
  // SOFT DELETE ALL (clear all notifications)
  // ────────────────────────────────────────────────────────────────────────

  async softDeleteAll(userId) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select("id");

    if (error) throw error;
    return data || [];
  },
};

module.exports = NotificationsModel;

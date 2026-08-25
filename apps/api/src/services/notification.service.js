// ═══════════════════════════════════════════════════════════════════════════
// notification.service.js
// Central notification service — all modules call this to create notifications.
// Uses supabaseAdmin (service role) to bypass RLS for inserts.
// ═══════════════════════════════════════════════════════════════════════════

const { supabaseAdmin } = require("../configs/supabase");

// ──────────────────────────────────────────────────────────────────────────
// NOTIFICATION TYPE → PREFERENCE KEY MAPPING
// Maps notification types to the user preference toggle that gates them.
// If a type is not listed, it is always sent (no opt-out).
// ──────────────────────────────────────────────────────────────────────────

const TYPE_PREFERENCE_MAP = {
  // discussions preference gates comment/reply notifications
  feed_comment: "discussions",
  feed_reply: "discussions",
  meme_comment: "discussions",
  meme_reply: "discussions",
  gossip_comment: "discussions",
  gossip_reply: "discussions",
  post_comment: "discussions",

  // liveRooms preference gates room-related notifications
  room_join: "liveRooms",
  room_hand_raised: "liveRooms",
  room_role_changed: "liveRooms",
};

// ──────────────────────────────────────────────────────────────────────────
// DEDUPLICATION WINDOW (milliseconds)
// Prevents duplicate notifications for the same action within this window.
// ──────────────────────────────────────────────────────────────────────────

const DEDUP_WINDOW_MS = 60 * 1000; // 1 minute

// ──────────────────────────────────────────────────────────────────────────
// HELPER: Check user notification preferences
// ──────────────────────────────────────────────────────────────────────────

async function shouldNotify(userId, notificationType) {
  const preferenceKey = TYPE_PREFERENCE_MAP[notificationType];

  // If no preference mapping exists, always send
  if (!preferenceKey) return true;

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("preferences")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return true; // fail-open: send notification

    const notifications = data.preferences?.notifications;
    if (!notifications) return true;

    // If the preference key exists and is explicitly false, don't send
    return notifications[preferenceKey] !== false;
  } catch {
    return true; // fail-open
  }
}

// ──────────────────────────────────────────────────────────────────────────
// HELPER: Get actor display name for notification text
// ──────────────────────────────────────────────────────────────────────────

async function getActorDisplayName(actorId) {
  if (!actorId) return "Someone";

  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("username, display_name")
      .eq("id", actorId)
      .maybeSingle();

    return data?.display_name || data?.username || "Someone";
  } catch {
    return "Someone";
  }
}

// ──────────────────────────────────────────────────────────────────────────
// HELPER: Check for recent duplicate notification
// ──────────────────────────────────────────────────────────────────────────

async function isDuplicate(userId, actorId, groupKey) {
  if (!groupKey) return false;

  try {
    const since = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();

    const { data } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("group_key", groupKey)
      .gt("created_at", since)
      .maybeSingle();

    // If actorId is provided, also check actor match for dedup
    if (data && actorId) {
      const { data: exact } = await supabaseAdmin
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("actor_id", actorId)
        .eq("group_key", groupKey)
        .gt("created_at", since)
        .maybeSingle();

      return !!exact;
    }

    return false; // Don't dedup if no exact actor match
  } catch {
    return false; // fail-open
  }
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN: Create a single notification
// ══════════════════════════════════════════════════════════════════════════

/**
 * Creates a notification for a user.
 *
 * @param {Object} params
 * @param {string} params.userId       - Recipient user ID (required)
 * @param {string} [params.actorId]    - User who triggered the action
 * @param {string} params.title        - Notification title (required)
 * @param {string} params.message      - Notification body (required)
 * @param {string} params.type         - Notification type (e.g., 'follow', 'feed_comment')
 * @param {string} [params.entityType] - Related entity type ('feed', 'meme', 'gossip', etc.)
 * @param {string} [params.entityId]   - Related entity UUID
 * @param {string} [params.actionUrl]  - Deep link path (e.g., '/feeds/abc-123')
 * @param {string} [params.groupKey]   - Aggregation key (e.g., 'reaction:feed:abc-123')
 * @param {string} [params.priority]   - 'low' | 'normal' | 'high' | 'critical'
 * @param {string} [params.icon]       - Icon name for the frontend
 * @param {string} [params.accent]     - Accent color hex
 * @param {Object} [params.metadata]   - Additional data (extensible)
 * @returns {Object|null} Created notification or null on failure
 */
async function createNotification({
  userId,
  actorId = null,
  title,
  message,
  type = "general",
  entityType = null,
  entityId = null,
  actionUrl = null,
  groupKey = null,
  priority = "normal",
  icon = null,
  accent = null,
  metadata = {},
}) {
  try {
    // ── Guard: Don't notify yourself ──────────────────────────────────
    if (actorId && actorId === userId) return null;

    // ── Guard: Check user preferences ────────────────────────────────
    const allowed = await shouldNotify(userId, type);
    if (!allowed) return null;

    // ── Guard: Deduplication ─────────────────────────────────────────
    if (groupKey) {
      const dup = await isDuplicate(userId, actorId, groupKey);
      if (dup) return null;
    }

    // ── Insert ───────────────────────────────────────────────────────
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        actor_id: actorId,
        title,
        message,
        type,
        entity_type: entityType,
        entity_id: entityId,
        action_url: actionUrl,
        group_key: groupKey,
        priority,
        icon,
        accent,
        metadata,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[NotificationService] insert failed:", {
        userId,
        type,
        error: error.message,
      });
      return null;
    }

    return data;
  } catch (err) {
    console.error("[NotificationService] unexpected error:", {
      userId,
      type,
      error: err.message,
    });
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// BULK: Create notifications for multiple users
// Used for admin broadcasts.
// ══════════════════════════════════════════════════════════════════════════

/**
 * Creates notifications for multiple users in a single batch insert.
 *
 * @param {Array<Object>} notifications - Array of notification objects (same shape as createNotification params)
 * @returns {Array|null} Created notifications or null on failure
 */
async function createBulkNotifications(notifications) {
  if (!notifications || notifications.length === 0) return null;

  try {
    const rows = notifications.map((n) => ({
      user_id: n.userId,
      actor_id: n.actorId || null,
      title: n.title,
      message: n.message,
      type: n.type || "system",
      entity_type: n.entityType || null,
      entity_id: n.entityId || null,
      action_url: n.actionUrl || null,
      group_key: n.groupKey || null,
      priority: n.priority || "normal",
      icon: n.icon || null,
      accent: n.accent || null,
      metadata: n.metadata || {},
      is_read: false,
    }));

    // Batch in chunks of 500 to avoid payload limits
    const CHUNK_SIZE = 500;
    const results = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      const { data, error } = await supabaseAdmin.from("notifications").insert(chunk).select();

      if (error) {
        console.error("[NotificationService] bulk insert failed:", {
          chunk: i,
          error: error.message,
        });
      } else if (data) {
        results.push(...data);
      }
    }

    return results.length > 0 ? results : null;
  } catch (err) {
    console.error("[NotificationService] bulk unexpected error:", err.message);
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════

module.exports = {
  createNotification,
  createBulkNotifications,
  getActorDisplayName,
  shouldNotify,
};

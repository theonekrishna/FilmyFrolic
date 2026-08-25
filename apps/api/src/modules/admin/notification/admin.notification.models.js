// ═══════════════════════════════════════════════════════════════════════════
// admin.notification.models.js
// ═══════════════════════════════════════════════════════════════════════════

const { supabase } = require("../../../configs/supabase");

// ══════════════════════
// SEND NOTIFICATION
// ══════════════════════

exports.sendNotification = async ({
  adminId,
  title,
  message,
  type,
  target_audience,
  icon,
  accent,
}) => {
  const { data, error } = await supabase

    .from("admin_notifications")

    .insert([
      {
        actor_id: adminId,

        title,

        message,

        type,

        target_audience,

        icon,

        accent,
      },
    ])

    .select(
      `
      id,
      title,
      message,
      type,
      icon,
      accent,
      target_audience,
      created_at,

      actor:profiles!admin_notifications_actor_id_fkey (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `
    )

    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// ══════════════════════
// GET ALL NOTIFICATIONS
// ══════════════════════

exports.getAllNotifications = async ({ search, type, page, limit }) => {
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  let query = supabase

    .from("admin_notifications")

    .select(
      `
      id,
      title,
      message,
      type,
      icon,
      accent,
      target_audience,
      created_at,

      actor:profiles!admin_notifications_actor_id_fkey (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `,
      {
        count: "exact",
      }
    );

  // ══════════════════════
  // SEARCH
  // ══════════════════════

  if (search?.trim()) {
    const safeSearch = search.trim();

    query = query.or(`title.ilike.%${safeSearch}%,message.ilike.%${safeSearch}%`);
  }

  // ══════════════════════
  // FILTER TYPE
  // ══════════════════════

  if (type?.trim()) {
    query = query.eq("type", type.trim());
  }

  // ══════════════════════
  // ORDERING
  // ══════════════════════

  query = query.order("created_at", {
    ascending: false,
  });

  // ══════════════════════
  // PAGINATION
  // ══════════════════════

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    total: count || 0,

    page,

    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: data || [],
  };
};

// ══════════════════════
// GET LATEST NOTIFICATIONS
// ══════════════════════

exports.getLatestNotifications = async ({ user, limit }) => {
  // SAFETY LIMIT
  const safeLimit = Math.min(Math.max(limit || 10, 1), 50);

  // ══════════════════════
  // FETCH EXTRA DATA
  // IMPORTANT:
  // because filtering happens AFTER fetch
  // ══════════════════════

  const fetchLimit = safeLimit * 3;

  const { data, error } = await supabase

    .from("admin_notifications")

    .select(
      `
      id,
      title,
      message,
      type,
      icon,
      accent,
      target_audience,
      created_at,

      actor:profiles!admin_notifications_actor_id_fkey (
        id,
        name,
        username,
        display_name,
        avatar_url
      )
    `
    )

    .order("created_at", {
      ascending: false,
    })

    .limit(fetchLimit);

  if (error) {
    throw new Error(error.message);
  }

  // ══════════════════════
  // SERVER SIDE FILTERING
  // ══════════════════════

  const filtered = (data || []).filter((notification) => {
    const audience = notification.target_audience;

    // ALL USERS

    if (audience === "all_users") {
      return true;
    }

    // ENTERTAINMENT USERS

    if (audience === "entertainment_users") {
      return user?.modules?.entertainment === true;
    }

    // SOCIAL USERS

    if (audience === "social_users") {
      return user?.modules?.social === true;
    }

    // CONTENT USERS

    if (audience === "content_users") {
      return user?.modules?.content === true;
    }

    // NEW USERS (LAST 7 DAYS)

    if (audience === "new_users_7_days") {
      if (!user?.created_at) {
        return false;
      }

      const createdAt = new Date(user.created_at);

      const days = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      return days <= 7;
    }

    return false;
  });

  // ══════════════════════
  // FINAL LIMIT
  // ══════════════════════

  return filtered.slice(0, safeLimit);
};

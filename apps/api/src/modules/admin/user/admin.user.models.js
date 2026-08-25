// ═══════════════════════════════════════════════════════════════════════════
// admin.user.models.js
// ═══════════════════════════════════════════════════════════════════════════

const { supabase } = require("../../../configs/supabase");

// ═══════════════════════════════════════════════════════════════════════════
// GET ALL USERS
// ═══════════════════════════════════════════════════════════════════════════

exports.getAllUsers = async ({
  search = "",
  role = "all",
  status = "all",
  page = 1,
  limit = 10,
}) => {
  // PAGINATION
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  // BASE QUERY
  let query = supabase.from("profiles").select(
    `
      id,
      name,
      username,
      email,
      avatar_url,
      avatar_color,
      role,
      is_suspended,
      is_banned,
      created_at
      `,
    {
      count: "exact",
    }
  );

  // ═══════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════

  if (search?.trim()) {
    const keyword = search.trim();

    query = query.or(
      `name.ilike.%${keyword}%,username.ilike.%${keyword}%,email.ilike.%${keyword}%`
    );
  }

  // ═══════════════════════════════════════
  // ROLE FILTER
  // ═══════════════════════════════════════

  if (role !== "all") {
    query = query.eq("role", role);
  }

  // ═══════════════════════════════════════
  // STATUS FILTER
  // ═══════════════════════════════════════

  if (status !== "all") {
    // ACTIVE
    if (status === "active") {
      query = query.eq("is_suspended", false).eq("is_banned", false);
    }

    // SUSPENDED
    if (status === "suspended") {
      query = query.eq("is_suspended", true);
    }

    // BANNED
    if (status === "banned") {
      query = query.eq("is_banned", true);
    }
  }

  // ═══════════════════════════════════════
  // ORDER + PAGINATION
  // ═══════════════════════════════════════

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  // EXECUTE QUERY
  const { data, error, count } = await query;

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // EMPTY
  if (!data?.length) {
    return {
      total: 0,
      page,
      limit,
      totalPages: 0,
      data: [],
    };
  }

  // ═══════════════════════════════════════
  // MAP USERS
  // ═══════════════════════════════════════

  const mappedUsers = await Promise.all(
    data.map(async (user) => {
      // FEEDS COUNT
      const { count: feedsCount } = await supabase
        .from("feeds")
        .select("id", {
          count: "exact",
        })
        .eq("user_id", user.id)
        .is("deleted_at", null);

      // GOSSIPS COUNT
      const { count: gossipsCount } = await supabase
        .from("gossips")
        .select("id", {
          count: "exact",
        })
        .eq("user_id", user.id);

      // MEMES COUNT
      const { count: memesCount } = await supabase
        .from("memes")
        .select("id", {
          count: "exact",
        })
        .eq("created_by", user.id)
        .eq("is_deleted", false);

      // TOTAL POSTS
      const totalPosts =
        Number(feedsCount || 0) + Number(gossipsCount || 0) + Number(memesCount || 0);

      // USER STATUS
      const userStatus = user.is_banned ? "banned" : user.is_suspended ? "suspended" : "active";

      // RETURN USER
      return {
        id: user.id,

        name: user.name,

        username: user.username,

        email: user.email,

        avatar_url: user.avatar_url,

        avatar_color: user.avatar_color,

        role: user.role,

        is_suspended: user.is_suspended,

        is_banned: user.is_banned,

        status: userStatus,

        created_at: user.created_at,

        // POSTS
        feeds_count: Number(feedsCount || 0),

        gossips_count: Number(gossipsCount || 0),

        memes_count: Number(memesCount || 0),

        total_posts: totalPosts,
      };
    })
  );

  // FINAL RESPONSE
  return {
    total: count || 0,

    page,

    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedUsers,
  };
};

// ═══════════════════════════════════════
// CHANGE USER ROLE
// ═══════════════════════════════════════

exports.changeUserRole = async ({ userId, role, currentUserRole }) => {
  try {
    // ═══════════════════════════════════════
    // TARGET USER
    // ═══════════════════════════════════════

    const { data: existingUser, error: userError } = await supabase
      .from("profiles")
      .select(
        `
          id,
          name,
          username,
          email,
          role
        `
      )
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!existingUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // ═══════════════════════════════════════
    // SAME ROLE CHECK
    // ═══════════════════════════════════════

    if (existingUser.role === role) {
      const err = new Error(`User already has the "${role}" role`);
      err.statusCode = 409;
      throw err;
    }

    // ═══════════════════════════════════════
    // CURRENT ROLE
    // ═══════════════════════════════════════

    const { data: currentRole } = await supabase
      .from("roles")
      .select(
        `
        id,
        slug,
        name,
        priority
      `
      )
      .eq("slug", currentUserRole)
      .maybeSingle();

    if (!currentRole) {
      const err = new Error("Your role configuration is invalid");
      err.statusCode = 403;
      throw err;
    }

    // ═══════════════════════════════════════
    // TARGET USER ROLE
    // ═══════════════════════════════════════

    const { data: targetUserRole } = await supabase
      .from("roles")
      .select(
        `
        id,
        slug,
        name,
        priority
      `
      )
      .eq("slug", existingUser.role)
      .maybeSingle();

    if (!targetUserRole) {
      const err = new Error("Target user's role configuration is invalid");
      err.statusCode = 500;
      throw err;
    }

    // ═══════════════════════════════════════
    // NEW ROLE
    // ═══════════════════════════════════════

    const { data: newRole } = await supabase
      .from("roles")
      .select(
        `
        id,
        name,
        slug,
        priority,
        is_active
      `
      )
      .eq("slug", role)
      .maybeSingle();

    if (!newRole) {
      const err = new Error("Selected role does not exist");
      err.statusCode = 404;
      throw err;
    }

    if (!newRole.is_active) {
      const err = new Error(`The "${newRole.name}" role is disabled`);
      err.statusCode = 403;
      throw err;
    }

    // ═══════════════════════════════════════
    // HIERARCHY CHECK (USER LEVEL)
    // ═══════════════════════════════════════

    if (targetUserRole.priority >= currentRole.priority) {
      const err = new Error(`You cannot manage users with "${targetUserRole.name}" role`);
      err.statusCode = 403;
      throw err;
    }

    // ═══════════════════════════════════════
    // HIERARCHY CHECK (ROLE LEVEL)
    // ═══════════════════════════════════════

    if (newRole.priority >= currentRole.priority) {
      const err = new Error(`You cannot assign "${newRole.name}" role`);
      err.statusCode = 403;
      throw err;
    }

    // ═══════════════════════════════════════
    // UPDATE USER ROLE
    // ═══════════════════════════════════════

    const { data, error } = await supabase
      .from("profiles")
      .update({
        role: newRole.slug,
      })
      .eq("id", userId)
      .select(
        `
        id,
        name,
        username,
        email,
        role,
        updated_at
      `
      )
      .maybeSingle();

    if (error) {
      const err = new Error(error.message);
      err.statusCode = 500;
      throw err;
    }

    if (!data) {
      const err = new Error("Failed to update user role");
      err.statusCode = 500;
      throw err;
    }

    // ═══════════════════════════════════════
    // RESPONSE
    // ═══════════════════════════════════════

    return {
      ...data,
      role_name: newRole.name,
      old_role: existingUser.role,
      new_role: newRole.slug,
    };
  } catch (err) {
    // rethrow clean error
    throw err;
  }
};

// ═══════════════════════════════════════
// TOGGLE SUSPEND USER
// ═══════════════════════════════════════

exports.toggleSuspendUser = async (userId) => {
  // FIND USER
  const { data: existingUser, error: findError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      username,
      email,
      is_suspended,
      is_banned
    `
    )
    .eq("id", userId)
    .maybeSingle();

  // USER NOT FOUND
  if (findError || !existingUser) {
    throw new Error("User not found");
  }

  // BLOCK BANNED USER SUSPEND
  if (existingUser.is_banned) {
    throw new Error("Banned users cannot be suspended");
  }

  // TOGGLE VALUE
  const newSuspendStatus = !existingUser.is_suspended;

  // UPDATE
  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_suspended: newSuspendStatus,
    })
    .eq("id", userId)
    .select(
      `
      id,
      name,
      username,
      email,
      role,
      is_suspended,
      is_banned,
      updated_at
    `
    )
    .maybeSingle();
  if (!data) {
    throw new Error("Failed to update user");
  }
  // UPDATE ERROR
  if (error) {
    throw new Error(error.message);
  }

  // RESPONSE MESSAGE
  const message = newSuspendStatus ? "User suspended successfully" : "User restored successfully";

  return {
    message,
    user: data,
  };
};

// ═══════════════════════════════════════
// TOGGLE BAN USER
// ═══════════════════════════════════════

exports.toggleBanUser = async (userId) => {
  // FIND USER
  const { data: existingUser, error: findError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      username,
      email,
      role,
      is_suspended,
      is_banned
    `
    )
    .eq("id", userId)
    .maybeSingle();

  // USER NOT FOUND
  if (findError || !existingUser) {
    throw new Error("User not found");
  }

  // TOGGLE VALUE
  const newBanStatus = !existingUser.is_banned;

  // UPDATE
  const { data, error } = await supabase
    .from("profiles")
    .update({
      // TOGGLE BAN
      is_banned: newBanStatus,

      // REMOVE SUSPEND IF BANNED
      is_suspended: newBanStatus ? false : existingUser.is_suspended,
    })
    .eq("id", userId)
    .select(
      `
      id,
      name,
      username,
      email,
      role,
      is_suspended,
      is_banned,
      updated_at
    `
    )
    .maybeSingle();
  if (!data) {
    throw new Error("Failed to update user");
  }
  // UPDATE ERROR
  if (error) {
    throw new Error(error.message);
  }

  // RESPONSE MESSAGE
  const message = newBanStatus ? "User banned successfully" : "User unbanned successfully";

  return {
    message,
    user: data,
  };
};

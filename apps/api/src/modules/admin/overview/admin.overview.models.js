const { supabase } = require("../../../configs/supabase");

// ═══════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════

exports.getOverviewStats = async () => {
  const [users, content, reports, communities, quizzes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),

    supabase.from("gossips").select("*", { count: "exact", head: true }).eq("is_deleted", false),

    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),

    supabase
      .from("communities")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),

    supabase.from("game_results").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: users.count || 0,
    totalContent: content.count || 0,
    openReports: reports.count || 0,
    communities: communities.count || 0,
    quizzesPlayed: quizzes.count || 0,
  };
};

// ═══════════════════════════════════════
// DAILY ACTIVE USERS
// ═══════════════════════════════════════

exports.getDailyActiveUsers = async () => {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  const { count } = await supabase
    .from("game_results")
    .select("user_id", {
      count: "exact",
      head: true,
    })
    .gte("created_at", yesterday.toISOString());

  return count || 0;
};

// ═══════════════════════════════════════
// USER GROWTH
// ═══════════════════════════════════════

exports.getUserGrowth = async () => {
  const { data, error } = await supabase.from("profiles").select("created_at");

  if (error) throw error;

  return data;
};

// ═══════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════

exports.getRecentActivity = async (limit = 6) => {
  const { data, error } = await supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) throw error;

  return data || [];
};

// ═══════════════════════════════════════
// MODULE HEALTH
// ═══════════════════════════════════════

exports.getModuleHealth = async () => {
  const [
    usersRes,
    feedsRes,
    messagesRes,
    roomsRes,
    communitiesRes,
    gossipsRes,
    memesRes,
    followsRes,
    gamesRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_deactivated", false),

    supabase.from("feeds").select("*", { count: "exact", head: true }),

    supabase.from("messages").select("*", { count: "exact", head: true }),

    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("is_deleted", false),

    supabase
      .from("communities")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false),

    supabase.from("gossips").select("*", { count: "exact", head: true }).eq("is_deleted", false),

    supabase.from("memes").select("*", { count: "exact", head: true }).eq("is_deleted", false),

    supabase.from("follows").select("*", { count: "exact", head: true }),

    supabase.from("game_results").select("*", { count: "exact", head: true }),
  ]);

  const totalUsers = usersRes.count || 0;

  const modules = [
    {
      module: "core",
      activeCount: (feedsRes.count || 0) + totalUsers,
    },
    {
      module: "social",
      activeCount: (messagesRes.count || 0) + (roomsRes.count || 0) + (communitiesRes.count || 0),
    },
    {
      module: "content",
      activeCount: gossipsRes.count || 0,
    },
    {
      module: "entertain",
      activeCount: (gamesRes.count || 0) + (memesRes.count || 0),
    },
    {
      module: "user",
      activeCount: followsRes.count || 0,
    },
  ];

  const maxCount = Math.max(...modules.map((m) => m.activeCount), 1);

  return modules.map((module) => {
    const percentage = (module.activeCount / maxCount) * 100;

    let status = "degraded";

    if (percentage >= 70) {
      status = "healthy";
    } else if (percentage >= 40) {
      status = "warning";
    }

    return {
      ...module,
      status,
    };
  });
};

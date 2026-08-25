// ═══════════════════════════════════════════════════════════════════════════
// admin.moderation.models.js
// ═══════════════════════════════════════════════════════════════════════════

const { supabase } = require("../../../configs/supabase");

// ═══════════════════════════════════════════════════════════════════════════
// GET ALL REPORTS
// ═══════════════════════════════════════════════════════════════════════════

exports.getAllReports = async ({
  search = "",
  status = "all",
  category = "all",
  moduleType = "all",
  sortBy = "latest",
  page = 1,
  limit = 10,
}) => {
  // PAGINATION
  const from = (page - 1) * limit;

  const to = from + limit - 1;

  // NORMALIZE MODULE TYPE
  const normalizedModuleType = moduleType
    ?.trim()
    ?.toLowerCase()
    ?.replace(/[\s-]+/g, "_");

  // NORMALIZE SEARCH
  const safeSearch = search?.trim();

  // ═══════════════════════════════════════════════════════════════════════
  // BASE QUERY
  // ═══════════════════════════════════════════════════════════════════════

  let query = supabase.from("reports").select(
    `
        id,
        module_type,
        target_id,
        target_user_id,
        custom_issue,
        description,
        status,
        created_at,
        is_warning_sent,
        is_content_removed,
        is_dismissed,

        report_categories (
          id,
          name,
          description,
          module_type
        ),

        reporter:reported_by (
          id,
          name,
          username,
          avatar_url,
          avatar_color
        ),

        target_user:target_user_id (
          id,
          name,
          username,
          avatar_url,
          avatar_color,
          is_banned,
          is_suspended
        )
      `,
    {
      count: "exact",
    }
  );

  // ═══════════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════════

  if (safeSearch) {
    // MAIN TABLE SEARCH
    query = query.or(
      `description.ilike.%${safeSearch}%,custom_issue.ilike.%${safeSearch}%,module_type.ilike.%${safeSearch}%,status.ilike.%${safeSearch}%`
    );

    // REPORTER SEARCH
    query = query.or(`name.ilike.%${safeSearch}%,username.ilike.%${safeSearch}%`, {
      foreignTable: "reporter",
    });

    // TARGET USER SEARCH
    query = query.or(`name.ilike.%${safeSearch}%,username.ilike.%${safeSearch}%`, {
      foreignTable: "target_user",
    });

    // CATEGORY SEARCH
    query = query.or(
      `name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,module_type.ilike.%${safeSearch}%`,
      {
        foreignTable: "report_categories",
      }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STATUS FILTER
  // ═══════════════════════════════════════════════════════════════════════

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CATEGORY FILTER
  // ═══════════════════════════════════════════════════════════════════════

  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MODULE FILTER
  // ═══════════════════════════════════════════════════════════════════════

  if (normalizedModuleType && normalizedModuleType !== "all") {
    query = query.ilike("module_type", normalizedModuleType);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SORTING
  // ═══════════════════════════════════════════════════════════════════════

  // OLDEST
  if (sortBy === "oldest") {
    query = query.order("created_at", {
      ascending: true,
    });
  }

  // LATEST
  else {
    query = query.order("created_at", {
      ascending: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════════════════

  query = query.range(from, to);

  // ═══════════════════════════════════════════════════════════════════════
  // EXECUTE QUERY
  // ═══════════════════════════════════════════════════════════════════════

  const { data, error, count } = await query;

  // ERROR
  if (error) {
    console.error("GET REPORTS ERROR:", error);

    throw new Error(error.message);
  }

  // EMPTY
  if (!data || data.length === 0) {
    return {
      total: 0,

      page,

      limit,

      totalPages: 0,

      data: [],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TARGET IDS
  // ═══════════════════════════════════════════════════════════════════════

  const targetIds = data.map((item) => item.target_id);

  // ═══════════════════════════════════════════════════════════════════════
  // GET REPORT COUNTS
  // ═══════════════════════════════════════════════════════════════════════

  const { data: allReports, error: reportCountError } = await supabase
    .from("reports")
    .select(
      `
      target_id
    `
    )
    .in("target_id", targetIds);

  // REPORT COUNT ERROR
  if (reportCountError) {
    console.error("REPORT COUNT ERROR:", reportCountError);

    throw new Error(reportCountError.message);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // COUNT MAP
  // ═══════════════════════════════════════════════════════════════════════

  const reportCountMap = {};

  allReports?.forEach((report) => {
    if (!reportCountMap[report.target_id]) {
      reportCountMap[report.target_id] = 0;
    }

    reportCountMap[report.target_id] += 1;
  });

  // ═══════════════════════════════════════════════════════════════════════
  // MAP REPORTS
  // ═══════════════════════════════════════════════════════════════════════

  const mappedReports = data.map((report) => {
    const reportsCount = reportCountMap[report.target_id] || 1;

    return {
      // REPORT
      id: report.id,

      module_type: report.module_type,

      target_id: report.target_id,

      target_user_id: report.target_user_id,

      custom_description: report.description,

      custom_issue: report.custom_issue,

      status: report.status,

      created_at: report.created_at,

      reports_count: reportsCount,

      is_warning_sent: report.is_warning_sent,

      is_content_removed: report.is_content_removed,

      is_dismissed: report.is_dismissed,

      // CATEGORY
      category: report.report_categories
        ? {
            id: report.report_categories.id,

            name: report.report_categories.name,

            description: report.report_categories.description,

            module_type: report.report_categories.module_type,
          }
        : null,

      // REPORTER
      reporter: report.reporter
        ? {
            id: report.reporter.id,

            name: report.reporter.name,

            username: report.reporter.username,

            avatar_url: report.reporter.avatar_url,

            avatar_color: report.reporter.avatar_color,
          }
        : null,

      // TARGET USER
      target_user: report.target_user
        ? {
            id: report.target_user.id,

            name: report.target_user.name,

            username: report.target_user.username,

            avatar_url: report.target_user.avatar_url,

            avatar_color: report.target_user.avatar_color,

            is_banned: report.target_user.is_banned,

            is_suspended: report.target_user.is_suspended,
          }
        : null,
    };
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SORT MOST REPORTED
  // ═══════════════════════════════════════════════════════════════════════

  if (sortBy === "most_reported") {
    mappedReports.sort((a, b) => b.reports_count - a.reports_count);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RESPONSE
  // ═══════════════════════════════════════════════════════════════════════

  return {
    total: count || 0,

    page,

    limit,

    totalPages: Math.ceil((count || 0) / limit),

    data: mappedReports,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// GET MODERATION STATS
// ═══════════════════════════════════════════════════════════════════════════

exports.getModerationStats = async () => {
  // TOTAL REPORTS
  const { count: totalReports, error: totalError } = await supabase.from("reports").select("*", {
    count: "exact",
    head: true,
  });

  if (totalError) {
    throw new Error(totalError.message);
  }

  // PENDING REPORTS
  const { count: pendingReports, error: pendingError } = await supabase
    .from("reports")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "pending");

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  // RESOLVED REPORTS
  const { count: resolvedReports, error: resolvedError } = await supabase
    .from("reports")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "resolved");

  if (resolvedError) {
    throw new Error(resolvedError.message);
  }

  // DISMISSED REPORTS
  const { count: dismissedReports, error: dismissedError } = await supabase
    .from("reports")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "dismissed");

  if (dismissedError) {
    throw new Error(dismissedError.message);
  }

  // RESPONSE
  return {
    total_reports: totalReports || 0,

    pending_reports: pendingReports || 0,

    resolved_reports: resolvedReports || 0,

    dismissed_reports: dismissedReports || 0,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// WARN USER
// ═══════════════════════════════════════════════════════════════════════════

exports.warnUser = async ({ reportId, adminId }) => {
  // GET REPORT
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      `
        id,
        module_type,
        target_user_id,
        is_warning_sent
      `
    )
    .eq("id", reportId)
    .single();

  // REPORT ERROR
  if (reportError || !report) {
    throw new Error("Report not found");
  }

  // TARGET USER
  if (!report.target_user_id) {
    throw new Error("Target user not found");
  }

  // ALREADY WARNED
  if (report.is_warning_sent) {
    return {
      is_warning_sent: true,

      success: false,

      message: "Warning already sent",
    };
  }

  // MESSAGE
  const title = "Community Guidelines Warning";

  const message =
    `Your ${report.module_type} violated community guidelines. ` +
    `Repeated violations may result in suspension or permanent ban.`;

  // CREATE NOTIFICATION
  const { data, error } = await supabase
    .from("admin_notifications")
    .insert({
      title,

      message,

      type: "warning",

      icon: "⚠️",

      accent: "warning",

      target_audience: "single_user",

      actor_id: adminId,

      receiver_id: report.target_user_id,
    })
    .select()
    .single();

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  // UPDATE REPORT
  await supabase
    .from("reports")
    .update({
      status: "resolved",

      is_warning_sent: true,

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      admin_note: "User warned by moderator",
    })
    .eq("id", reportId);

  return {
    success: true,

    is_warning_sent: true,

    message: "User warned successfully",

    data,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// GET USER WARNINGS
// ═══════════════════════════════════════════════════════════════════════════
exports.getUserWarnings = async ({ userId }) => {
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
        is_read,
        created_at,

        actor:actor_id (
          id,
          name,
          username,
          avatar_url,
          avatar_color
        )
      `
    )

    .eq("receiver_id", userId)

    .eq("type", "warning")

    .order("created_at", {
      ascending: false,
    });

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

// ═══════════════════════════════════════════════════════════════════════════
// REMOVE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

exports.removeContent = async ({ reportId, adminId }) => {
  // GET REPORT
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      `
      id,
      module_type,
      target_id,
      target_user_id,
      is_content_removed
    `
    )
    .eq("id", reportId)
    .single();

  // REPORT ERROR
  if (reportError || !report) {
    console.error("REPORT FETCH ERROR:", reportError);

    throw new Error("Report not found");
  }

  // NORMALIZE MODULE TYPE
  const normalizedModuleType = report.module_type
    ?.trim()
    ?.toLowerCase()
    ?.replace(/[\s-]+/g, "_");

  // DEBUG LOGS
  // console.log("━━━━━━━━━━━━━━━━━━");
  // console.log("REMOVE CONTENT");
  // console.log("RAW MODULE:", report.module_type);
  // console.log("NORMALIZED MODULE:", normalizedModuleType);
  // console.log("TARGET ID:", report.target_id);
  // console.log("━━━━━━━━━━━━━━━━━━");

  // ALREADY REMOVED
  if (report.is_content_removed) {
    return {
      success: false,

      is_content_removed: true,

      message: "Content already removed",
    };
  }

  // MODERATION MAP
  const moderationMap = {
    // FEEDS
    feed: {
      table: "feeds",
      field: "deleted_at",
      value: new Date().toISOString(),
    },

    // FEED COMMENTS
    feed_comment: {
      table: "feeds_comments",
      field: "is_deleted",
      value: true,
    },

    // GOSSIPS
    gossip: {
      table: "gossips",
      field: "is_deleted",
      value: true,
    },

    // GOSSIP COMMENTS
    gossip_comment: {
      table: "gossip_comments",
      field: "is_deleted",
      value: true,
    },

    // MEMES
    meme: {
      table: "memes",
      field: "is_deleted",
      value: true,
    },

    // MEME COMMENTS
    meme_comment: {
      table: "meme_comments",
      field: "is_deleted",
      value: true,
    },

    // COMMUNITIES
    community: {
      table: "communities",
      field: "is_deleted",
      value: true,
    },

    // COMMUNITY POSTS
    community_post: {
      table: "posts",
      field: "is_deleted",
      value: true,
    },

    // COMMUNITY COMMENTS
    community_comment: {
      table: "posts",
      field: "is_deleted",
      value: true,
    },

    // ROOMS
    room: {
      table: "rooms",
      field: "is_deleted",
      value: true,
    },

    // GAMES
    game: {
      table: "games",
      field: "is_deleted",
      value: true,
    },
  };

  // CONFIG
  const config = moderationMap[normalizedModuleType];

  // INVALID MODULE
  if (!config) {
    console.error("INVALID MODULE TYPE:", normalizedModuleType);

    throw new Error(`Unsupported module type: ${normalizedModuleType}`);
  }

  // DEBUG CONFIG
  console.log("TABLE:", config.table);

  console.log("FIELD:", config.field);

  // CHECK CONTENT EXISTS
  const { data: existingContent, error: existingError } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", String(report.target_id))
    .maybeSingle();

  // EXIST ERROR
  if (existingError) {
    console.error("CHECK CONTENT ERROR:", existingError);

    throw new Error(existingError.message);
  }

  // NOT FOUND
  if (!existingContent) {
    console.error("CONTENT NOT FOUND");

    console.error("TABLE:", config.table);

    console.error("TARGET ID:", report.target_id);

    throw new Error(`No content found in ${config.table} with id ${report.target_id}`);
  }

  // CONTENT FOUND
  console.log("CONTENT FOUND:", existingContent.id);

  // REMOVE CONTENT
  const { data: removedData, error: removeError } = await supabase
    .from(config.table)
    .update({
      [config.field]: config.value,
    })
    .eq("id", String(report.target_id))
    .select();

  // REMOVE ERROR
  if (removeError) {
    console.error("REMOVE CONTENT ERROR:", removeError);

    throw new Error(removeError.message);
  }

  // NOTHING UPDATED
  if (!removedData || removedData.length === 0) {
    console.error("NO ROW UPDATED");

    throw new Error("Failed to remove content");
  }

  // DEBUG SUCCESS
  console.log("CONTENT REMOVED SUCCESSFULLY");

  // SEND NOTIFICATION
  if (report.target_user_id) {
    const { error: notificationError } = await supabase.from("admin_notifications").insert({
      title: "Content Removed",

      message:
        `One of your ${normalizedModuleType} contents ` +
        `was removed for violating community guidelines.`,

      type: "content_removed",

      icon: "🛡️",

      accent: "danger",

      target_audience: "single_user",

      actor_id: adminId,

      receiver_id: report.target_user_id,
    });

    // NOTIFICATION ERROR
    if (notificationError) {
      console.error("NOTIFICATION ERROR:", notificationError);
    }
  }

  // UPDATE REPORT
  const { error: reportUpdateError } = await supabase
    .from("reports")
    .update({
      status: "resolved",

      is_content_removed: true,

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),

      admin_note: "Content removed by moderator",
    })
    .eq("id", reportId);

  // REPORT UPDATE ERROR
  if (reportUpdateError) {
    console.error("REPORT UPDATE ERROR:", reportUpdateError);

    throw new Error(reportUpdateError.message);
  }

  // SUCCESS RESPONSE
  return {
    success: true,

    is_content_removed: true,

    message: "Content removed successfully",

    data: {
      removed: true,

      module_type: normalizedModuleType,

      target_id: report.target_id,

      table: config.table,

      updated_field: config.field,
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// DISMISS REPORT
// ═══════════════════════════════════════════════════════════════════════════

exports.dismissReport = async ({ reportId, adminId }) => {
  // GET REPORT
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      `
        id,
        is_dismissed
      `
    )
    .eq("id", reportId)
    .single();

  // ERROR
  if (reportError || !report) {
    throw new Error("Report not found");
  }

  // ALREADY DISMISSED
  if (report.is_dismissed) {
    return {
      success: false,

      is_dismissed: true,

      message: "Report already dismissed",
    };
  }

  // UPDATE REPORT
  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "dismissed",

      is_dismissed: true,

      reviewed_by: adminId,

      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,

    is_dismissed: true,

    message: "Report dismissed successfully",

    data,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// GET REMOVED CONTENT NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════
exports.getRemovedContentNotifications = async ({ userId }) => {
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
          created_at,

          actor:actor_id (
            id,
            name,
            username,
            avatar_url,
            avatar_color
          )
        `
    )

    .eq("receiver_id", userId)

    .eq("type", "content_removed")

    .order("created_at", {
      ascending: false,
    });

  // ERROR
  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

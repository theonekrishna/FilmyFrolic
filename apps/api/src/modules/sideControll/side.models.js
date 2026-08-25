const { supabase } = require("../../configs/supabase");

// ═══════════════════════════════════════
// GET MODULE ACCESS
// ═══════════════════════════════════════

exports.getAllModules = async () => {
  const { data, error } = await supabase
    .from("app_modules")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};
// ═══════════════════════════════════════
// COMMON QUERY FUNCTION
// ═══════════════════════════════════════

exports.getByKey = async (table, column, value) => {
  const { data, error } = await supabase.from(table).select("*").eq(column, value).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`${value} not found`);
  }

  return data;
};

// ═══════════════════════════════════════
// ACCESS & REGISTRATION
// ═══════════════════════════════════════

exports.getMaintenanceMode = async () => {
  return await exports.getByKey("app_settings", "setting_key", "maintenance_mode");
};

exports.getRegistrationOpen = async () => {
  return await exports.getByKey("app_settings", "setting_key", "registration_open");
};

exports.getAdminAnnouncements = async () => {
  return await exports.getByKey("app_settings", "setting_key", "admin_announcements");
};

exports.getAnalyticsTracking = async () => {
  return await exports.getByKey("app_settings", "setting_key", "analytics_tracking");
};

// ═══════════════════════════════════════
// CONTENT CONTROLS
// ═══════════════════════════════════════

// REMOVED: Spoiler Protection feature has been removed from the application.
// exports.getSpoilerProtection = async () => {
//   return await exports.getByKey(
//     "content_controls",
//     "control_key",
//     "spoiler_protection",
//   );
// };

exports.getAdultContentFilter = async () => {
  return await exports.getByKey("content_controls", "control_key", "adult_content_filter");
};

exports.getGossipSection = async () => {
  return await exports.getByKey("content_controls", "control_key", "gossip_section");
};

exports.getMemeSubmissions = async () => {
  return await exports.getByKey("content_controls", "control_key", "meme_submissions");
};

// ═══════════════════════════════════════
// ENTERTAINMENT CONTROLS
// ═══════════════════════════════════════

exports.getDailyQuiz = async () => {
  return await exports.getByKey("entertainment_controls", "control_key", "daily_quiz");
};

exports.getLiveRooms = async () => {
  return await exports.getByKey("entertainment_controls", "control_key", "live_rooms");
};

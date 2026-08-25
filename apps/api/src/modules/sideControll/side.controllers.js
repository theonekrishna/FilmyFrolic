const model = require("./side.models");

// ═══════════════════════════════════════
// GET MODULE ACCESS
// ═══════════════════════════════════════

exports.getAllModules = async (req, res) => {
  try {
    const modules = await model.getAllModules();
    return res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    console.warn("GET MODULES ERROR (using fallback):", error.message);
    return res.status(200).json({
      success: true,
      count: 5,
      data: [
        { module_key: "home", is_enabled: true },
        { module_key: "social", is_enabled: true },
        { module_key: "entertainment", is_enabled: true },
        { module_key: "user", is_enabled: true },
        { module_key: "content", is_enabled: true },
      ],
    });
  }
};

// ═══════════════════════════════════════
// MAINTENANCE MODE
// ═══════════════════════════════════════

exports.getMaintenanceMode = async (req, res) => {
  try {
    const data = await model.getByKey("app_settings", "setting_key", "maintenance_mode");

    return res.status(200).json({
      success: true,
      message: "Maintenance mode fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET MAINTENANCE MODE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch maintenance mode",
    });
  }
};

// ═══════════════════════════════════════
// REGISTRATION OPEN
// ═══════════════════════════════════════

exports.getRegistrationOpen = async (req, res) => {
  try {
    const data = await model.getByKey("app_settings", "setting_key", "registration_open");

    return res.status(200).json({
      success: true,
      message: "Registration setting fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET REGISTRATION OPEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch registration setting",
    });
  }
};

// ═══════════════════════════════════════
// ADMIN ANNOUNCEMENTS
// ═══════════════════════════════════════

exports.getAdminAnnouncements = async (req, res) => {
  try {
    const data = await model.getByKey("app_settings", "setting_key", "admin_announcements");

    return res.status(200).json({
      success: true,
      message: "Admin announcements fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET ADMIN ANNOUNCEMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admin announcements",
    });
  }
};

// ═══════════════════════════════════════
// ANALYTICS TRACKING
// ═══════════════════════════════════════

exports.getAnalyticsTracking = async (req, res) => {
  try {
    const data = await model.getByKey("app_settings", "setting_key", "analytics_tracking");

    return res.status(200).json({
      success: true,
      message: "Analytics tracking fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET ANALYTICS TRACKING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch analytics tracking",
    });
  }
};

// ═══════════════════════════════════════
// SPOILER PROTECTION — REMOVED
// Feature has been removed from the application.
// ═══════════════════════════════════════

// exports.getSpoilerProtection = async (req, res) => {
//   try {
//     const data = await model.getByKey(
//       "content_controls",
//       "control_key",
//       "spoiler_protection",
//     );
//
//     return res.status(200).json({
//       success: true,
//       message: "Spoiler protection fetched successfully",
//       data,
//     });
//   } catch (error) {
//     console.error("GET SPOILER PROTECTION ERROR:", error);
//
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to fetch spoiler protection",
//     });
//   }
// };

// ═══════════════════════════════════════
// ADULT CONTENT FILTER
// ═══════════════════════════════════════

exports.getAdultContentFilter = async (req, res) => {
  try {
    const data = await model.getByKey("content_controls", "control_key", "adult_content_filter");

    return res.status(200).json({
      success: true,
      message: "Adult content filter fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET ADULT CONTENT FILTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch adult content filter",
    });
  }
};

// ═══════════════════════════════════════
// GOSSIP SECTION
// ═══════════════════════════════════════

exports.getGossipSection = async (req, res) => {
  try {
    const data = await model.getByKey("content_controls", "control_key", "gossip_section");

    return res.status(200).json({
      success: true,
      message: "Gossip section fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET GOSSIP SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch gossip section",
    });
  }
};

// ═══════════════════════════════════════
// MEME SUBMISSIONS
// ═══════════════════════════════════════

exports.getMemeSubmissions = async (req, res) => {
  try {
    const data = await model.getByKey("content_controls", "control_key", "meme_submissions");

    return res.status(200).json({
      success: true,
      message: "Meme submissions fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET MEME SUBMISSIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch meme submissions",
    });
  }
};

// ═══════════════════════════════════════
// DAILY QUIZ
// ═══════════════════════════════════════

exports.getDailyQuiz = async (req, res) => {
  try {
    const data = await model.getByKey("entertainment_controls", "control_key", "daily_quiz");

    return res.status(200).json({
      success: true,
      message: "Daily quiz fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET DAILY QUIZ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch daily quiz",
    });
  }
};

// ═══════════════════════════════════════
// LIVE ROOMS
// ═══════════════════════════════════════

exports.getLiveRooms = async (req, res) => {
  try {
    const data = await model.getByKey("entertainment_controls", "control_key", "live_rooms");

    return res.status(200).json({
      success: true,
      message: "Live rooms fetched successfully",
      data,
    });
  } catch (error) {
    console.error("GET LIVE ROOMS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch live rooms",
    });
  }
};

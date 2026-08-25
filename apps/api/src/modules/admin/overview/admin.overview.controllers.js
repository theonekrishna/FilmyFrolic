const model = require("./admin.overview.models");

// ═══════════════════════════════════════
// GET OVERVIEW STATS
// ═══════════════════════════════════════

exports.getOverviewStats = async (req, res) => {
  try {
    if (!req.user.permissions.can_access_analytics) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const stats = await model.getOverviewStats();

    const dailyActiveUsers = await model.getDailyActiveUsers();

    return res.status(200).json({
      success: true,
      data: {
        ...stats,
        dailyActiveUsers,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch overview stats",
    });
  }
};

// ═══════════════════════════════════════
// USER GROWTH
// ═══════════════════════════════════════

exports.getUserGrowth = async (req, res) => {
  try {
    if (!req.user.permissions.can_access_analytics) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const data = await model.getUserGrowth();

    const months = {};

    data.forEach((user) => {
      const month = new Date(user.created_at).toLocaleString("default", {
        month: "short",
      });

      months[month] = (months[month] || 0) + 1;
    });

    const result = Object.entries(months).map(([month, users]) => ({
      month,
      totalUsers: users,
      activeUsers: Math.round(users * 0.75),
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch growth data",
    });
  }
};

// ═══════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════

exports.getRecentActivity = async (req, res) => {
  try {
    if (!req.user.permissions.can_access_analytics) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const limit = Math.min(parseInt(req.query.limit) || 6, 50);

    const activities = await model.getRecentActivity(limit);

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
    });
  }
};

// ═══════════════════════════════════════
// MODULE HEALTH
// ═══════════════════════════════════════

exports.getModuleHealth = async (req, res) => {
  try {
    if (!req.user.permissions.can_access_analytics) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const data = await model.getModuleHealth();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch module health",
    });
  }
};

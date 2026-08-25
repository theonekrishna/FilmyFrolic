const model = require("./admin.feedback.models");
const { logAdminActivity } = require("../activeLog/adminActivityLogger");
// GET ALL FEEDBACKS
exports.getFeedbacks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      contentType,
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const result = await model.getFeedbacks({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
      contentType,
      sortBy,
      order,
    });

    return res.status(200).json({
      success: true,
      message: "Feedbacks fetched successfully",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveFeedback = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to moderate feedback",
      });
    }
    const result = await model.approveFeedback({
      feedbackId: req.params.feedbackId,
      adminId: req.user.id,
    });
    // ACTIVITY LOG
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "feedback",
      action: "APPROVE",

      entityType: "feedback",
      entityId: result.id,

      entityName: result.feedback_type || "Feedback",

      icon: "MessageSquareCheck",
      iconColor: "green",

      description: `Approved feedback (${result.feedback_type})`,
    });
    return res.status(200).json({
      success: true,
      message: "Feedback approved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectFeedback = async (req, res) => {
  try {
    if (!req.user?.permissions?.can_moderate) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to moderate feedback",
      });
    }
    const result = await model.rejectFeedback({
      feedbackId: req.params.feedbackId,
      adminId: req.user.id,
    });
    // ACTIVITY LOG
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "feedback",
      action: "REJECT",

      entityType: "feedback",
      entityId: result.id,

      entityName: result.feedback_type || "Feedback",

      icon: "MessageSquareX",
      iconColor: "red",

      description: `Rejected feedback (${result.feedback_type})`,
    });
    return res.status(200).json({
      success: true,
      message: "Feedback rejected successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

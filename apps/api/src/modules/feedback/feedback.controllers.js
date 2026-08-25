const model = require("./feedback.models");

// SUBMIT FEEDBACK
exports.submitFeedback = async (req, res) => {
  try {
    const result = await model.submitFeedback({
      userId: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CHECK FEEDBACK EXISTS
exports.checkFeedbackExists = async (req, res) => {
  try {
    const { contentType, contentId } = req.query;

    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: "contentType and contentId are required",
      });
    }
    const feedback = await model.checkFeedbackExists({
      userId: req.user.id,
      contentType,
      contentId,
    });
    return res.status(200).json({
      success: true,
      alreadySubmitted: !!feedback,
      data: feedback || null,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MY FEEDBACK
exports.getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await model.getMyFeedback(req.user.id);

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

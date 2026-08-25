const reportsModel = require("./reports.model");
const { validateCreateReport } = require("./reports.validation");

/**
 * CREATE REPORT
 */
exports.createReport = async (req, res) => {
  try {
    const validationError = validateCreateReport(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const report = await reportsModel.createReport({
      reported_by: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    console.error("Create Report Error:", error);

    const knownErrors = [
      "You cannot report your own content",
      "You already reported this content",
      "Invalid report category",
      "Custom issue is required",
    ];

    return res.status(knownErrors.includes(error.message) ? 400 : 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * GET REPORT CATEGORIES
 */
exports.getReportCategories = async (req, res) => {
  try {
    const { module_type } = req.params;

    if (!module_type) {
      return res.status(400).json({
        success: false,
        message: "module_type is required",
      });
    }

    const categories = await reportsModel.getReportCategories(module_type);

    return res.status(200).json({
      success: true,
      message: "Report categories fetched successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Report Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * CHECK USER REPORT
 */
exports.checkUserReport = async (req, res) => {
  try {
    const { module_type, target_id } = req.query;

    if (!module_type) {
      return res.status(400).json({
        success: false,
        message: "module_type is required",
      });
    }

    if (!target_id) {
      return res.status(400).json({
        success: false,
        message: "target_id is required",
      });
    }

    const report = await reportsModel.checkUserReport({
      reported_by: req.user.id,
      module_type,
      target_id,
    });

    return res.status(200).json({
      success: true,
      reported: !!report,
      data: report || null,
    });
  } catch (error) {
    console.error("Check User Report Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const model = require("./admin.policy.model");
const { logAdminActivity } = require("../activeLog/adminActivityLogger");
/* ==========================================================================
   POLICIES
   ========================================================================== */

// GET ALL POLICIES
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await model.getAllPolicies();

    return res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error("GET ALL POLICIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET POLICY BY ID
exports.getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await model.getPolicyById(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("GET POLICY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE POLICY
exports.createPolicy = async (req, res) => {
  try {
    const policy = await model.createPolicy({
      ...req.body,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    });
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policies",
      action: "CREATE_POLICY",

      entityType: "Policy",
      entityId: policy.id,
      entityName: policy.title,

      icon: "file-plus",
      iconColor: "success",

      description: `${req.user.name} created policy "${policy.title}"`,
    });
    return res.status(201).json({
      success: true,
      message: "Policy created successfully",
      data: policy,
    });
  } catch (error) {
    console.error("CREATE POLICY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE POLICY
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await model.updatePolicy(id, {
      ...req.body,
      updated_by: req.user?.id || null,
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policies",
      action: "UPDATE_POLICY",

      entityType: "Policy",
      entityId: policy.id,
      entityName: policy.title,

      icon: "file-pen-line",
      iconColor: "warning",

      description: `${req.user.name} updated policy "${policy.title}"`,
    });
    return res.status(200).json({
      success: true,
      message: "Policy updated successfully",
      data: policy,
    });
  } catch (error) {
    console.error("UPDATE POLICY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE POLICY (SOFT DELETE)
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await model.deletePolicy(id, req.user?.id || null);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policies",
      action: "DELETE_POLICY",

      entityType: "Policy",
      entityId: policy.id,
      entityName: policy.title,

      icon: "trash2",
      iconColor: "danger",

      description: `${req.user.name} deleted policy "${policy.title}"`,
    });
    return res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("DELETE POLICY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================================
   POLICY SECTIONS
   ========================================================================== */

// GET ALL SECTIONS OF A POLICY
exports.getSectionsByPolicyId = async (req, res) => {
  try {
    const { policyId } = req.params;

    const sections = await model.getSectionsByPolicyId(policyId);

    return res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("GET POLICY SECTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE POLICY SECTION
exports.createPolicySection = async (req, res) => {
  try {
    const { policyId } = req.params;

    const section = await model.createPolicySection(policyId, req.body);
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policy Sections",
      action: "CREATE_POLICY_SECTION",

      entityType: "Policy Section",
      entityId: section.id,
      entityName: section.title,

      icon: "plus-square",
      iconColor: "success",

      description: `${req.user.name} created policy section "${section.title}"`,
    });
    return res.status(201).json({
      success: true,
      message: "Policy section created successfully",
      data: section,
    });
  } catch (error) {
    console.error("CREATE POLICY SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE POLICY SECTION
exports.updatePolicySection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await model.updatePolicySection(id, req.body);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Policy section not found",
      });
    }
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policy Sections",
      action: "UPDATE_POLICY_SECTION",

      entityType: "Policy Section",
      entityId: section.id,
      entityName: section.title,

      icon: "square-pen",
      iconColor: "warning",

      description: `${req.user.name} updated policy section "${section.title}"`,
    });
    return res.status(200).json({
      success: true,
      message: "Policy section updated successfully",
      data: section,
    });
  } catch (error) {
    console.error("UPDATE POLICY SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE POLICY SECTION (SOFT DELETE)
exports.deletePolicySection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await model.deletePolicySection(id, req.user?.id || null);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Policy section not found",
      });
    }
    await logAdminActivity({
      adminId: req.user.id,
      adminName: req.user.name,
      adminRole: req.user.role,

      module: "Policy Sections",
      action: "DELETE_POLICY_SECTION",

      entityType: "Policy Section",
      entityId: section.id,
      entityName: section.title,

      icon: "trash2",
      iconColor: "danger",

      description: `${req.user.name} deleted policy section "${section.title}"`,
    });
    return res.status(200).json({
      success: true,
      message: "Policy section deleted successfully",
    });
  } catch (error) {
    console.error("DELETE POLICY SECTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================================
   PUBLIC
   ========================================================================== */

// GET ALL ACTIVE POLICIES WITH SECTIONS
exports.getPublicPolicies = async (req, res) => {
  try {
    const policies = await model.getPublicPolicies();

    return res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error("GET PUBLIC POLICIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE POLICY BY SLUG WITH SECTIONS
exports.getPublicPolicyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const policy = await model.getPublicPolicyBySlug(slug);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("GET PUBLIC POLICY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ═══════════════════════════════════════════════
// PUBLIC - POLICY LIST
// ═══════════════════════════════════════════════

exports.getPolicyList = async (req, res) => {
  try {
    const policies = await model.getPolicyList();

    return res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    console.error("GET POLICY LIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

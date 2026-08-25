const model = require("./admin.settings.models");

// ═══════════════════════════════════════
// GET ALL ROLES
// ═══════════════════════════════════════

exports.getAllRoles = async (req, res) => {
  try {
    // RBAC

    // QUERY PARAMS
    const search = req.query.search?.trim() || "";

    const status = req.query.status || "all";

    // MODEL
    const roles = await model.getAllRoles({
      search,
      status,
    });

    // RESPONSE
    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      ...roles,
    });
  } catch (err) {
    console.error("GET ALL ROLES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch roles",
    });
  }
};

// ═══════════════════════════════════════
// GET SINGLE ROLE
// ═══════════════════════════════════════

exports.getSingleRole = async (req, res) => {
  try {
    // RBAC

    // PARAMS
    const { roleId } = req.params;

    // REQUIRED
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    // MODEL
    const role = await model.getSingleRole(roleId);

    return res.status(200).json({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (err) {
    console.error("GET SINGLE ROLE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch role",
    });
  }
};

// ═══════════════════════════════════════
// CREATE ROLE
// ═══════════════════════════════════════

exports.createRole = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to create roles",
      });
    }

    // BODY
    const {
      name,
      description,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,
    } = req.body;

    // REQUIRED
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // CREATE
    const role = await model.createRole({
      name,
      description,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (err) {
    console.error("CREATE ROLE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create role",
    });
  }
};

// ═══════════════════════════════════════
// UPDATE ROLE
// ═══════════════════════════════════════

exports.updateRole = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update roles",
      });
    }

    // PARAMS
    const { roleId } = req.params;

    // BODY
    const {
      name,
      description,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,

      is_active,
    } = req.body;

    // REQUIRED
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // UPDATE
    const role = await model.updateRole({
      roleId,

      name,
      description,
      color,
      priority,

      can_create,
      can_moderate,
      can_manage_users,
      can_manage_roles,
      can_access_analytics,

      is_active,
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);

    const statusCode = err.message.includes("exists")
      ? 409
      : err.message.includes("not found")
        ? 404
        : err.message.includes("system role")
          ? 403
          : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to update role",
    });
  }
};

// ═══════════════════════════════════════
// DELETE ROLE
// ═══════════════════════════════════════

exports.deleteRole = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete roles",
      });
    }

    // PARAMS
    const { roleId } = req.params;

    // VALIDATION
    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    // DELETE ROLE
    const result = await model.deleteRole(roleId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error("DELETE ROLE ERROR:", err);

    let statusCode = 500;

    if (err.message.includes("not found")) {
      statusCode = 404;
    } else if (err.message.includes("System role") || err.message.includes("permission")) {
      statusCode = 403;
    } else if (err.message.includes("assigned users")) {
      statusCode = 409;
    } else if (err.message.includes("required")) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to delete role",
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE ROLE STATUS
// ═══════════════════════════════════════

exports.toggleRoleStatus = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage roles",
      });
    }

    // PARAMS
    const { roleId } = req.params;

    // MODEL
    const result = await model.toggleRoleStatus(roleId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.role,
    });
  } catch (err) {
    console.error("TOGGLE ROLE STATUS ERROR:", err);

    const statusCode = err.message.includes("not found")
      ? 404
      : err.message.includes("system role")
        ? 403
        : 500;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to update role status",
    });
  }
};

// ═══════════════════════════════════════
// GET ACTIVE ROLES ONLY
// ═══════════════════════════════════════

exports.getRolesList = async (req, res) => {
  try {
    const roles = await model.getRolesList();

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (err) {
    console.error("GET ROLES LIST ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch roles",
    });
  }
};

// ═══════════════════════════════════════
// GET LOGGED IN USER PERMISSIONS
// ═══════════════════════════════════════

exports.getMyPermissions = async (req, res) => {
  try {
    // AUTH

    // MODEL
    const permissions = await model.getMyPermissions(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions,
    });
  } catch (err) {
    console.error("GET MY PERMISSIONS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch permissions",
    });
  }
};

// ═══════════════════════════════════════
// GET ALL MODULES
// ═══════════════════════════════════════

exports.getAllModules = async (req, res) => {
  try {
    // GET DATA

    const modules = await model.getAllModules();

    return res.status(200).json({
      success: true,
      count: modules.length,
      data: modules,
    });
  } catch (error) {
    console.error("GET MODULES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE MODULE STATUS
// ═══════════════════════════════════════

exports.toggleModuleStatus = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { module_key } = req.params;

    const updatedModule = await model.toggleModuleStatus(module_key);

    return res.status(200).json({
      success: true,
      message: `Module ${updatedModule.is_enabled ? "enabled" : "disabled"} successfully`,
      data: updatedModule,
    });
  } catch (error) {
    console.error("TOGGLE MODULE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle module status",
    });
  }
};

// ═══════════════════════════════════════
// GET ALL ACCESS SETTINGS
// ═══════════════════════════════════════

exports.getAllAccessSettings = async (req, res) => {
  try {
    // RBAC

    // GET DATA
    const settings = await model.getAllAccessSettings();

    return res.status(200).json({
      success: true,
      count: settings.length,
      data: settings,
    });
  } catch (error) {
    console.error("GET ACCESS SETTINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch access settings",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE ACCESS SETTING
// ═══════════════════════════════════════

exports.toggleAccessSetting = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { setting_key } = req.params;

    // TOGGLE
    const updatedSetting = await model.toggleAccessSetting(setting_key);

    return res.status(200).json({
      success: true,
      message: `Setting ${updatedSetting.is_enabled ? "enabled" : "disabled"} successfully`,
      data: updatedSetting,
    });
  } catch (error) {
    console.error("TOGGLE ACCESS SETTING ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle setting",
    });
  }
};

// ═══════════════════════════════════════
// GET ALL CONTENT CONTROLS
// ═══════════════════════════════════════

exports.getAllContentControls = async (req, res) => {
  try {
    // RBAC

    // GET DATA
    const controls = await model.getAllContentControls();

    return res.status(200).json({
      success: true,
      count: controls.length,
      data: controls,
    });
  } catch (error) {
    console.error("GET CONTENT CONTROLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch content controls",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE CONTENT CONTROL
// ═══════════════════════════════════════

exports.toggleContentControl = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { control_key } = req.params;

    // TOGGLE
    const updatedControl = await model.toggleContentControl(control_key);

    return res.status(200).json({
      success: true,
      message: `Content control ${updatedControl.is_enabled ? "enabled" : "disabled"} successfully`,
      data: updatedControl,
    });
  } catch (error) {
    console.error("TOGGLE CONTENT CONTROL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle content control",
    });
  }
};

// ═══════════════════════════════════════
// GET ALL ENTERTAINMENT CONTROLS
// ═══════════════════════════════════════

exports.getAllEntertainmentControls = async (req, res) => {
  try {
    // RBAC

    const controls = await model.getAllEntertainmentControls();

    return res.status(200).json({
      success: true,
      count: controls.length,
      data: controls,
    });
  } catch (error) {
    console.error("GET ENTERTAINMENT CONTROLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch entertainment controls",
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════
// TOGGLE ENTERTAINMENT CONTROL
// ═══════════════════════════════════════

exports.toggleEntertainmentControl = async (req, res) => {
  try {
    // RBAC
    if (!req.user?.permissions?.can_manage_roles) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { control_key } = req.params;

    const updatedControl = await model.toggleEntertainmentControl(control_key);

    return res.status(200).json({
      success: true,
      message: `Entertainment control ${
        updatedControl.is_enabled ? "enabled" : "disabled"
      } successfully`,
      data: updatedControl,
    });
  } catch (error) {
    console.error("TOGGLE ENTERTAINMENT CONTROL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle entertainment control",
    });
  }
};

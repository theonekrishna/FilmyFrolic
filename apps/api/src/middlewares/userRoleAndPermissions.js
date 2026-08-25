// const { supabase } = require("../../../configs/supabase.js");

// // Middleware: Admin Only Access
// const adminOnly = async (req, res, next) => {
//   try {
//     // 1. Ensure user is authenticated
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({
//         error: "Unauthorized: No admin found"
//       });
//     }

//     // 2. Fetch role from DB (trust DB, not client)
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", req.user.id)
//       .single();

//     if (error) {
//       return res.status(500).json({
//         error: "Failed to verify admin",
//         details: error.message
//       });
//     }

//     // Check role
//     if (!data || data.role !== "admin") {
//       return res.status(403).json({
//         error: "you shall not pass! Admins only."
//       });
//     }

//     // Attach role (optional but useful)
//     req.user.role = data.role;

//     next();

//   } catch (err) {
//     return res.status(500).json({
//       error: "Admin middleware error",
//       details: err.message
//     });
//   }
// };

// module.exports = adminOnly;

const { supabase } = require("../configs/supabase.js");

const loadUserRoleAndPermissions = async (req, res, next) => {
  try {
    // AUTH CHECK
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // GET PROFILE ROLE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile role",
        error: profileError?.message,
      });
    }

    // GET ROLE + ALL PERMISSIONS
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("*")
      .eq("slug", profile.role)
      .single();

    if (roleError || !role) {
      return res.status(403).json({
        success: false,
        message: "Role not found",
        error: roleError?.message,
      });
    }

    // ATTACH EVERYTHING
    req.user.role = role.slug;

    req.user.permissions = {
      can_create: role.can_create,
      can_moderate: role.can_moderate,
      can_manage_users: role.can_manage_users,
      can_manage_roles: role.can_manage_roles,
      can_access_analytics: role.can_access_analytics,
    };

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Role middleware error",
      error: err.message,
    });
  }
};

module.exports = loadUserRoleAndPermissions;

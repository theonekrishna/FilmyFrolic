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

// Middleware: Staff Only Access
const staffOnly = async (req, res, next) => {
  try {
    // AUTH CHECK
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // GET USER ROLE
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
          role,
          username
        `
      )
      .eq("id", req.user.id)
      .single();

    if (error || !data) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify role",
        error: error?.message,
      });
    }

    // BLOCK NORMAL USER
    if (data.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // ATTACH ROLE
    req.user.role = data.role;
    req.user.name = data.username; // for activity logger
    req.user.username = data.username;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Middleware error",
      error: err.message,
    });
  }
};

module.exports = staffOnly;

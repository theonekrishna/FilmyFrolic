const { supabase } = require("../configs/supabase");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = data.user;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({
      message: err.message,
    });
  }
};
// Optional auth — sets req.user if token valid, never blocks the request
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) req.user = data.user;
  } catch {}
  next();
};
module.exports = { protect, optionalAuth }; // add to existing exports

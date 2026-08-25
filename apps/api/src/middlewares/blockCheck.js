const { supabaseAdmin } = require("../configs/supabase");

// Checks if a block exists in either direction between two users
async function isBlocked(userA, userB) {
  const { data } = await supabaseAdmin
    .from("blocked_users")
    .select("id")
    .or(
      `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),` +
        `and(blocker_id.eq.${userB},blocked_id.eq.${userA})`
    )
    .limit(1)
    .maybeSingle();
  return !!data;
}

// Middleware: needs req.user.id (viewer) + target from params/body
// Returns 404 deliberately — never reveal block status to either party
async function blockCheckMiddleware(req, res, next) {
  try {
    const viewerId = req.user?.id;
    const targetId = req.params.userId || req.params.id || req.body.userId;

    if (!viewerId || !targetId || viewerId === targetId) return next();

    const blocked = await isBlocked(viewerId, targetId);
    if (blocked) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { isBlocked, blockCheckMiddleware };

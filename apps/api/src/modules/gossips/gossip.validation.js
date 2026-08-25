// src/modules/gossips/gossip.validation.js

const VALID_CATEGORIES = ["breaking", "rumour", "paparazzi", "interview", "drama", "hottake"];
const VALID_REACTIONS = ["fire", "shocked"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateCreateGossip(req, res, next) {
  const { headline, excerpt, category, tags } = req.body;
  const errors = [];

  if (!headline || typeof headline !== "string" || !headline.trim()) {
    errors.push("headline is required");
  } else if (headline.trim().length > 300) {
    errors.push("headline must be 300 characters or fewer");
  }

  if (!excerpt || typeof excerpt !== "string" || !excerpt.trim()) {
    errors.push("excerpt is required");
  } else if (excerpt.trim().length > 1000) {
    errors.push("excerpt must be 1000 characters or fewer");
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push("tags must be an array");
    } else if (tags.some((t) => typeof t !== "string" || !t.trim())) {
      errors.push("each tag must be a non-empty string");
    } else if (tags.length > 10) {
      errors.push("maximum 10 tags allowed");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join("; ") });
  }

  next();
}

function validateReaction(req, res, next) {
  const { reaction } = req.body;

  if (!reaction || !VALID_REACTIONS.includes(reaction)) {
    return res.status(400).json({
      success: false,
      message: `reaction must be one of: ${VALID_REACTIONS.join(", ")}`,
    });
  }

  next();
}

function validateUUID(req, res, next) {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid gossip id" });
  }

  next();
}
function validateGossipId(req, res, next) {
  const id = req.params.id;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ success: false, message: "Invalid gossip id" });
  }
  next();
}

function validateCommentId(req, res, next) {
  const id = req.params.commentId;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ success: false, message: "Invalid comment id" });
  }
  next();
}
module.exports = {
  validateCreateGossip,
  validateReaction,
  validateUUID,
  validateGossipId,
  validateCommentId,
};

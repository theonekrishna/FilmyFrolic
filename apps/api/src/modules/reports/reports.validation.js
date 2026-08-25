exports.validateCreateReport = (body) => {
  const { module_type, target_id, category_id } = body;

  const allowedModules = [
    "feed",
    "feed_comment",

    "gossip",
    "gossip_comment",

    "meme",
    "meme_comment",

    "community",
    "community_comment",

    "room",
    "room_comment",

    "game",

    "profile",
  ];

  if (!module_type) {
    return "module_type is required";
  }

  if (!allowedModules.includes(module_type)) {
    return "Invalid module_type";
  }

  if (!target_id) {
    return "target_id is required";
  }

  if (!category_id) {
    return "category_id is required";
  }

  return null;
};

//
module.exports = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// admin.content.routes.js
// ═══════════════════════════════════════════════════════════════════════════

const express = require("express");

const router = express.Router();

const multer = require("multer");

const { protect } = require("../../../middlewares/auth");

const staffOnly = require("../../../middlewares/staffOnly");

const loadUserRoleAndPermissions = require("../../../middlewares/userRoleAndPermissions");

const controller = require("./admin.content.controller");

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES
// ═══════════════════════════════════════════════════════════════════════════

router.use(protect, staffOnly, loadUserRoleAndPermissions);

// ═══════════════════════════════════════════════════════════════════════════
// MULTER CONFIG
// ═══════════════════════════════════════════════════════════════════════════

// MEMORY STORAGE
const storage = multer.memoryStorage();

// FILE FILTER
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// MULTER INSTANCE
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

// SAFE SINGLE IMAGE HANDLER
const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET ALL GOSSIPS
router.get("/gossips", controller.getAllGossips);

// TOGGLE PUBLISH STATUS
router.put("/gossips/:id/toggle-publish", controller.togglePublishStatus);

// TOGGLE VERIFY STATUS
router.put("/gossips/:id/toggle-verify", controller.toggleVerifyGossip);

// EDIT GOSSIP
router.put("/gossips/:id", (req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  // IMAGE UPLOAD REQUEST
  if (contentType.includes("multipart/form-data")) {
    return uploadSingleImage(req, res, () => {
      controller.editGossip(req, res, next);
    });
  }

  // NORMAL JSON REQUEST
  controller.editGossip(req, res, next);
});
// DELETE GOSSIP
router.delete("/gossips/:id", controller.deleteGossip);

module.exports = router;

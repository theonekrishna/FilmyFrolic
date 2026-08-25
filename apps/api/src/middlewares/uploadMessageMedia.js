const multer = require("multer");

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // hard cap at 50MB (video limit)
  },
  fileFilter: (req, file, cb) => {
    const ok = ALLOWED_IMAGE.includes(file.mimetype) || ALLOWED_VIDEO.includes(file.mimetype);
    if (!ok) {
      return cb(new Error("Only jpg/png/webp/gif images and mp4/webm videos are allowed"));
    }
    cb(null, true);
  },
}).single("media"); // field name from frontend FormData

// wrap so multer errors return JSON instead of crashing
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

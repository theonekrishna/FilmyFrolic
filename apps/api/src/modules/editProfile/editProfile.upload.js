const multer = require("multer");
//const { supabase } = require('../../configs/supabase');
const { supabaseAdmin } = require("../../configs/supabase"); // ← service role

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG and WebP images are allowed"));
    }
  },
});

const uploadAvatarFile = async (userId, file) => {
  const ext = file.mimetype.split("/")[1];
  const path = `avatars/${userId}_${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from("avatars").upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);

  return data.publicUrl;
};

module.exports = { upload, uploadAvatarFile };

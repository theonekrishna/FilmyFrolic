const ProfileModel = require("./editProfile.model");
const { uploadAvatarFile } = require("./editProfile.upload");
const { isBlocked } = require("../../middlewares/blockCheck");

// Lowercased gradients for display
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #f5c518, #e84545)", // Sunset Blaze
  "linear-gradient(135deg, #3b82f6, #9b59b6)", // Blue Violet
  "linear-gradient(135deg, #e91e8c, #9b59b6)", // Rosy Purple
  "linear-gradient(135deg, #2ecc71, #1abc9c)", // Green Teal
  "linear-gradient(135deg, #7c5cfc, #3b82f6)", // Purple Blue
  "linear-gradient(135deg, #f5c518, #2ecc71)", // Yellow Green
  "linear-gradient(135deg, #e84545, #f97316)", // Red Orange
  "linear-gradient(135deg, #ec4899, #8b5cf6)", // Pink Violet
];

const MAX_GENRES = 5;

// ─── HELPER FUNCTIONS ───────────────────────────────────────
const extractHexFromGradient = (gradientString) => {
  const hexMatches = gradientString.match(/#[0-9a-f]{6}/gi);
  return hexMatches ? hexMatches.map((hex) => hex.toLowerCase()) : null;
};

const reconstructGradient = (hexArray) => {
  if (!hexArray || !Array.isArray(hexArray) || hexArray.length !== 2) return null;
  return `linear-gradient(135deg, ${hexArray[0]}, ${hexArray[1]})`;
};

// ─── GET MY PROFILE ──────────────────────────────────────────
// GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    let profile = await ProfileModel.getById(req.user.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Reconstruct gradient from stored hex codes
    if (profile.avatar_color) {
      try {
        const hexArray = JSON.parse(profile.avatar_color);
        profile.avatar_color = reconstructGradient(hexArray);
      } catch {
        console.warn("[getMyProfile] Failed to parse avatar_color:", profile.avatar_color);
      }
    }

    // ── FIX: fetch total post count (feeds + community posts) ──
    const total_posts_count = await ProfileModel.getTotalPostCount(req.user.id);
    profile.total_posts_count = total_posts_count;

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[getMyProfile]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET PUBLIC PROFILE ──────────────────────────────────────
// GET /api/profile/:username
const getProfile = async (req, res) => {
  try {
    let profile = await ProfileModel.getByUsername(req.params.username);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Block check — viewer is optional (unauthenticated users can still view)
    const viewerId = req.user?.id;
    if (viewerId && viewerId !== profile.id) {
      const blocked = await isBlocked(viewerId, profile.id);
      if (blocked) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
    }

    if (profile.avatar_color) {
      try {
        const hexArray = JSON.parse(profile.avatar_color);
        profile.avatar_color = reconstructGradient(hexArray);
      } catch {
        console.warn("[getProfile] Failed to parse avatar_color:", profile.avatar_color);
      }
    }

    const total_posts_count = await ProfileModel.getTotalPostCount(profile.id);
    profile.total_posts_count = total_posts_count;

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[getProfile]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─── UPDATE INFO ─────────────────────────────────────────────
// PATCH /api/profile/me/info
const updateInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, username, bio, website } = req.body;

    const updates = {};
    if (display_name !== undefined) updates.display_name = display_name.trim();
    if (username !== undefined) updates.username = username.trim().toLowerCase();
    if (bio !== undefined) updates.bio = bio.trim();
    if (website !== undefined) updates.website = website.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    if (updates.username !== undefined) {
      if (updates.username.length < 3 || updates.username.length > 20) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 3 and 20 characters",
        });
      }

      if (!/^[a-z0-9_]+$/.test(updates.username)) {
        return res.status(400).json({
          success: false,
          message: "Username can only contain letters, numbers, and underscores",
        });
      }

      const taken = await ProfileModel.isUsernameTaken(updates.username, userId);
      if (taken) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    if (updates.website !== undefined) {
      if (updates.website.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Website URL cannot exceed 100 characters",
        });
      }

      if (updates.website.length > 0) {
        try {
          const url = new URL(updates.website);
          if (!["http:", "https:"].includes(url.protocol)) {
            return res.status(400).json({
              success: false,
              message: "Website must be a valid http or https URL",
            });
          }
        } catch {
          return res.status(400).json({
            success: false,
            message: "Website must be a valid URL",
          });
        }
      }
    }

    const profile = await ProfileModel.updateInfo(userId, updates);

    // ── FIX: removed stray `newUrl` reference — just return profile directly ──
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[updateInfo]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE AVATAR COLOR ─────────────────────────────────────
// PATCH /api/profile/me/avatar/color
const updateAvatarColor = async (req, res) => {
  try {
    const { avatar_color } = req.body;

    if (!avatar_color) {
      return res.status(400).json({ success: false, message: "avatar_color is required" });
    }

    const normalizedColor = avatar_color.toLowerCase().trim();

    if (!AVATAR_GRADIENTS.includes(normalizedColor)) {
      return res.status(400).json({ success: false, message: "Invalid avatar color" });
    }

    const hexCodes = extractHexFromGradient(normalizedColor);
    if (!hexCodes || hexCodes.length !== 2) {
      return res.status(400).json({ success: false, message: "Invalid gradient format" });
    }

    const profile = await ProfileModel.updateAvatarColor(req.user.id, JSON.stringify(hexCodes));

    // ── reconstruct gradient string for response ──
    if (profile.avatar_color) {
      try {
        const hexArray = JSON.parse(profile.avatar_color);
        profile.avatar_color = reconstructGradient(hexArray);
      } catch {
        // leave as-is if parsing fails
      }
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[updateAvatarColor]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPLOAD AVATAR IMAGE ─────────────────────────────────────
// PATCH /api/profile/me/avatar/upload
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Only image files are allowed" });
    }

    const userId = req.user.id;
    const oldAvatarUrl = await ProfileModel.getCurrentAvatarUrl(userId);
    const newUrl = await uploadAvatarFile(userId, req.file);
    const profile = await ProfileModel.updateAvatarUrl(userId, newUrl);

    ProfileModel.deleteOldAvatar(oldAvatarUrl).catch((err) =>
      console.error("[uploadAvatar] Failed to delete old avatar:", err)
    );

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[uploadAvatar]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL GENRES ──────────────────────────────────────────
// GET /api/profile/genres
const getAllGenres = async (req, res) => {
  try {
    const genres = await ProfileModel.getAllGenres();
    res.status(200).json({ success: true, data: genres });
  } catch (err) {
    console.error("[getAllGenres]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET MY GENRES ───────────────────────────────────────────
// GET /api/profile/me/genres
const getMyGenres = async (req, res) => {
  try {
    const genres = await ProfileModel.getMyGenres(req.user.id);
    res.status(200).json({ success: true, data: genres });
  } catch (err) {
    console.error("[getMyGenres]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE MY GENRES ────────────────────────────────────────
// PUT /api/profile/me/genres
const updateMyGenres = async (req, res) => {
  try {
    const { genres } = req.body;

    if (!Array.isArray(genres)) {
      return res.status(400).json({ success: false, message: "Genres must be an array" });
    }

    if (genres.length > MAX_GENRES) {
      return res.status(400).json({
        success: false,
        message: `You can select a maximum of ${MAX_GENRES} genres`,
      });
    }

    const allIntegers = genres.every((id) => Number.isInteger(id));
    if (!allIntegers) {
      return res.status(400).json({ success: false, message: "Invalid genre IDs" });
    }

    if (genres.length > 0) {
      const validIds = await ProfileModel.validateGenreIds(genres);
      if (!validIds) {
        return res
          .status(400)
          .json({ success: false, message: "One or more genre IDs are invalid" });
      }
    }

    const data = await ProfileModel.replaceGenres(req.user.id, genres);
    res.status(200).json({ success: true, message: "Genres updated successfully", data });
  } catch (err) {
    console.error("[updateMyGenres]", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMyProfile,
  getProfile,
  updateInfo,
  updateAvatarColor,
  uploadAvatar,
  getAllGenres,
  getMyGenres,
  updateMyGenres,
};

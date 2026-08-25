const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");
const { protect } = require("../../middlewares/auth");

const rateLimit = require("express-rate-limit");

// abuse/spam protection — generous enough for real users who mistype
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 3, // 3 requests per IP per window
  message: {
    success: false,
    message: "Too many reset requests. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// brute-force protection — tighter, this is someone guessing the OTP
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many attempts. Request a new code.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/check-username/:username", AuthController.checkUsername);
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh); // ✅ NEW
router.get("/me", protect, AuthController.getCurrentUser);
router.post("/logout", protect, AuthController.logout);
router.post("/forgot-password", forgotPasswordLimiter, AuthController.forgotPassword);

router.post("/reset-password", resetPasswordLimiter, AuthController.resetPassword);

router.post("/check-email", resetPasswordLimiter, AuthController.checkEmailExists);
module.exports = router;

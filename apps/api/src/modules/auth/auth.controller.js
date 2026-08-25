const AuthModel = require("./auth.model");
const { supabase } = require("../../configs/supabase");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signup = async (req, res) => {
  try {
    const { displayName, username, email, password, confirmPassword } = req.body;

    if (!displayName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const data = await AuthModel.signUpUser({
      email,
      password,
      displayName,
      username,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters",
      });
    }

    const available = await AuthModel.checkUsername(username);
    return res.status(200).json({ success: true, available });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// After a successful Supabase sign-in, we check whether the account is
// deactivated before returning the session:
//
//   • Deactivated AND within 60 days  → auto-reactivate, proceed normally
//   • Deactivated AND beyond 60 days  → 403, block access (data preserved)
//   • Not deactivated                 → proceed normally
// ─────────────────────────────────────────────────────────────────────────────

const REACTIVATION_WINDOW_DAYS = 60;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const data = await AuthModel.signInUser(email, password);

    // ── Deactivation check ────────────────────────────────────────────────────
    const profile = await AuthModel.getDeactivationStatus(data.user.id);

    if (profile?.is_deactivated) {
      const deactivatedAt = new Date(profile.deactivated_at);
      const daysSince = (Date.now() - deactivatedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince >= REACTIVATION_WINDOW_DAYS) {
        // Beyond 60 days — block login. All data is preserved in the DB;
        // we simply deny access. No data is ever deleted.
        return res.status(403).json({
          success: false,
          code: "ACCOUNT_DEACTIVATED_EXPIRED",
          message:
            "This account has been deactivated and the 60-day reactivation window has expired. Please contact support.",
        });
      }

      // Within 60 days — silently reactivate the account on login
      const { error: reactivateError } = await supabase
        .from("profiles")
        .update({ is_deactivated: false, deactivated_at: null })
        .eq("id", data.user.id);

      if (reactivateError) {
        console.error("[login] reactivation failed:", reactivateError.message);
        // Non-fatal — still return the session; account will reactivate on
        // the next successful login attempt.
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: "Login successful",
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    const profile = await AuthModel.getProfile(user.id);

    return res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    await AuthModel.signOutUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("[logout]", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, message: "refresh_token is required" });
    }

    const data = await AuthModel.refreshSession(refresh_token);

    return res.status(200).json({
      success: true,
      session: data.session,
      user: data.user,
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const exists = await AuthModel.checkEmailExists(email);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    await AuthModel.sendPasswordResetEmail(email);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { accessToken, refreshToken, password, confirmPassword } = req.body;

    if (!accessToken || !refreshToken || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    await AuthModel.resetPassword(accessToken, refreshToken, password);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const exists = await AuthModel.checkEmailExists(email);

    return res.status(200).json({
      success: true,
      exists,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkEmailExists,
  signup,
  login,
  getCurrentUser,
  logout,
  refresh,
  checkUsername,
  forgotPassword,
  resetPassword,
};

const { supabase, supabaseAdmin } = require("../../configs/supabase");
const { createClient } = require("@supabase/supabase-js");
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const signUpUser = async ({ email, password, displayName, username }) => {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    throw new Error("Username already taken");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        username: username,
      },
    },
  });

  if (error) {
    console.error("Supabase signUp error:", JSON.stringify(error, null, 2));
    throw new Error(error.message);
  }

  console.log("Auth user created:", data.user?.id);
  console.log("User confirmation status:", data.user?.confirmed_at);

  if (!data.user) {
    throw new Error("Signup failed - no user returned");
  }

  return { user: data.user, session: data.session };
};

const checkUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.warn("checkUsername warning:", error.message);
      return true;
    }
    return !data;
  } catch (err) {
    console.warn("checkUsername exception:", err.message);
    return true;
  }
};

const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
};

const getUser = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error) throw error;
  return data.user;
};

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const getDeactivationStatus = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_deactivated, deactivated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const signOutUser = async (userId) => {
  return true;
};

const refreshSession = async (refreshToken) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) throw error;

  return data;
};

const sendPasswordReset = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
  });
  if (error) throw error;

  return true;
};

const resetPassword = async (accessToken, refreshToken, newPassword) => {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  const { data: sessionData, error: sessionError } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError || !sessionData?.user) {
    throw new Error("Invalid or expired reset link.");
  }

  const userId = sessionData.user.id;

  // 1. Attempt standard user-client password update
  const { error: updateError } = await client.auth.updateUser({
    password: newPassword,
  });

  // 2. If MFA/AAL2 error occurs or client update fails, bypass via Service Role Admin API
  if (updateError) {
    console.warn(
      `[resetPassword] Standard updateUser failed (${updateError.message}). Bypassing via Service Role Admin...`
    );
    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (adminError) {
      console.error("[resetPassword] Admin password reset failed:", adminError.message);
      throw new Error(adminError.message);
    }
  }

  await client.auth.signOut();
  return true;
};

const sendPasswordResetEmail = async (email) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${frontendUrl}/reset-password`,
    },
  });

  if (error) {
    console.warn(
      "Supabase generateLink error, falling back to resetPasswordForEmail:",
      error.message
    );
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/reset-password`,
    });
    if (resetErr) throw resetErr;
    return true;
  }

  const recoveryLink = data.properties?.action_link;
  console.log(`🔑 PASSWORD RESET LINK FOR ${email}: ${recoveryLink}`);

  if (resend) {
    try {
      const { error: resendError } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset Your Password",
        html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /><title>Reset Password</title></head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
              <tr><td style="background:#111827;padding:24px;text-align:center;color:#ffffff;font-size:24px;font-weight:bold;">Password Reset Request</td></tr>
              <tr><td style="padding:32px;">
                <p style="font-size:16px;color:#374151;">Hello,</p>
                <p style="font-size:16px;color:#374151;">Click the button below to reset your password:</p>
                <div style="text-align:center;margin:35px 0;">
                  <a href="${recoveryLink}" style="display:inline-block;padding:14px 28px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">Reset Password</a>
                </div>
                <p style="word-break:break-all;font-size:13px;color:#2563eb;">${recoveryLink}</p>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
      `,
      });

      if (resendError) {
        console.warn("Resend email delivery notice:", resendError.message);
      }
    } catch (resendErr) {
      console.warn("Resend exception notice:", resendErr.message);
    }
  } else {
    console.log(
      `[sendPasswordResetEmail] RESEND_API_KEY is not set. Reset link generated: ${recoveryLink}`
    );
  }

  return true;
};

const checkEmailExists = async (email) => {
  try {
    if (!email) return false;
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !data?.users) {
      return true;
    }
    const found = data.users.find(
      (u) => u.email && u.email.toLowerCase() === email.toLowerCase().trim()
    );
    return !!found;
  } catch (err) {
    console.warn("checkEmailExists warning:", err.message);
    return true;
  }
};

module.exports = {
  signUpUser,
  signInUser,
  getUser,
  getProfile,
  getDeactivationStatus,
  signOutUser,
  refreshSession,
  checkUsername,
  sendPasswordReset,
  resetPassword,
  sendPasswordResetEmail,
  checkEmailExists,
};

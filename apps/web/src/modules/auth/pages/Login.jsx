import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, KeyRound } from "lucide-react";
import InputField from "../components/InputField";
import GoogleButton from "../components/SocialButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../utils/supabaseClient";
import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithToken } = useAuth();
  const from = location.state?.from?.pathname ?? "/";

  // ── Credential fields ────────────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── 2FA step state ───────────────────────────────────────────────────────
  // When the user has 2FA enabled we hold their session tokens here and ask
  // them to verify their TOTP code before we actually sign them in.
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  // Stored temporarily while waiting for the user to enter their OTP
  const [pendingSession, setPendingSession] = useState(null); // { access_token, refresh_token }

  // ── Helpers ──────────────────────────────────────────────────────────────

  // After a successful Supabase sign-in we check whether 2FA is active for
  // this account via GET /api/settings/account/2fa.
  // If enabled → store the session tokens and show the 2FA input screen.
  // If not     → proceed straight to the app.
  const check2FAAndProceed = async (session) => {
    const { access_token, refresh_token } = session;

    try {
      // Temporarily store the token so privateAxios can reach the endpoint
      localStorage.setItem("accessToken", access_token);

      const response = await privateAxios.get("/api/settings/account/2fa");
      // Handle both { success: true, data: { enabled } } and direct shapes
      const twoFAData =
        (response.data?.data ?? response.data?.success === true)
          ? response.data.data
          : response.data;

      const enabled = twoFAData?.enabled ?? false;

      if (enabled) {
        // 2FA is active — don't finish sign-in yet; ask for OTP first
        localStorage.removeItem("accessToken"); // clear until verified
        setPendingSession({ access_token, refresh_token });
        setTwoFARequired(true);
      } else {
        // No 2FA — complete sign-in normally
        localStorage.setItem("refreshToken", refresh_token);
        signInWithToken(access_token);
        navigate(from, { replace: true });
      }
    } catch (err) {
      // If the 2FA status check itself fails (e.g. network error) we still
      // let the user in — degrading gracefully rather than locking them out.
      console.warn("2FA status check failed, proceeding without 2FA:", err.message);
      localStorage.setItem("refreshToken", refresh_token);
      signInWithToken(access_token);
      navigate(from, { replace: true });
    }
  };

  // Verify the TOTP code the user typed against Supabase MFA
  const handleVerify2FA = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAError("Please enter a 6-digit code.");
      return;
    }

    try {
      setTwoFALoading(true);
      setTwoFAError("");

      // Re-set the token so Supabase client has a session to work with
      await supabase.auth.setSession({
        access_token: pendingSession.access_token,
        refresh_token: pendingSession.refresh_token,
      });

      // List enrolled factors, pick the TOTP one
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData?.totp?.[0];
      if (!totpFactor) throw new Error("No TOTP factor found on this account.");

      // Challenge → Verify
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: twoFACode,
      });
      if (verifyError) throw verifyError;

      // ✓ Verified — complete sign-in
      localStorage.setItem("refreshToken", pendingSession.refresh_token);
      signInWithToken(pendingSession.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("2FA verification failed:", err);
      setTwoFAError(
        err.message?.toLowerCase().includes("invalid")
          ? "Invalid code. Please try again."
          : err.message || "Verification failed. Please try again."
      );
    } finally {
      setTwoFALoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setErrors({ general: error.message || "Google Login failed" });
      // Supabase redirects the browser — no further action needed here
    } catch (error) {
      setErrors({ general: "Google Login failed or was cancelled." });
    } finally {
      setLoading(false);
    }
  };

  // ── Email / password login ────────────────────────────────────────────────
  const loginWithEmailPassword = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email) newErrors.email = "Email required";
    if (!password) newErrors.password = "Password required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      // ── 2FA gate ──────────────────────────────────────────────────────────
      await check2FAAndProceed(data.session);
    } catch (error) {
      console.error(error);
      setErrors({ general: "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA Screen ────────────────────────────────────────────────────────────
  if (twoFARequired) {
    return (
      <div className="min-h-screen flex bg-[#080810] text-white">
        {/* Left panel — same branding, no interaction needed */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src={BG_IMAGE}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
          <div className="absolute inset-0 flex flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-yellow-400 to-red-500">
                🎬
              </div>
              <span className="font-bebas text-2xl tracking-widest">FILMY FROLIC</span>
            </div>
            <div>
              <h2 className="font-['Bebas_Neue'] text-[52px] tracking-[2px] text-[#f0f0f8] leading-none max-w-[440px] mb-4">
                CINEMA LIVES <br />
                <span className="bg-gradient-to-r from-[#f5c518] to-[#e84545] bg-clip-text text-transparent">
                  IN THE DETAILS
                </span>
              </h2>
              <p className="text-gray-400 max-w-sm">
                Track every film, join the conversation, and play trivia with film lovers around the
                world.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel — 2FA form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "rgba(31,209,168,0.12)",
                border: "1px solid rgba(31,209,168,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Shield size={28} color="#1fd1a8" />
            </div>

            <h1 className="text-4xl font-bebas mb-2">Two-Factor Auth</h1>
            <p className="text-gray-400 mb-8">
              Your account has 2FA enabled. Open your authenticator app and enter the 6-digit code
              below.
            </p>

            {/* OTP Input */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  color: "rgba(240,240,248,0.5)",
                  marginBottom: 10,
                }}
              >
                Verification Code
              </label>
              <div style={{ position: "relative" }}>
                <KeyRound
                  size={16}
                  color="rgba(240,240,248,0.3)"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => {
                    setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setTwoFAError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify2FA()}
                  placeholder="000000"
                  autoFocus
                  style={{
                    width: "100%",
                    height: 52,
                    paddingLeft: 44,
                    paddingRight: 16,
                    background: "#0e0e1a",
                    border: `1px solid ${twoFAError ? "#e84545" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 12,
                    color: "#f0f0f8",
                    fontFamily: "monospace",
                    fontSize: 24,
                    letterSpacing: 8,
                    outline: "none",
                    transition: "border 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {twoFAError && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    background: "rgba(232,69,69,0.1)",
                    border: "1px solid rgba(232,69,69,0.3)",
                    borderRadius: 8,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "#e84545",
                  }}
                >
                  ⚠ {twoFAError}
                </div>
              )}
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify2FA}
              disabled={twoFALoading || twoFACode.length !== 6}
              className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                twoFALoading || twoFACode.length !== 6
                  ? "bg-[#1fd1a8]/40 cursor-not-allowed"
                  : "bg-[#1fd1a8] hover:opacity-90"
              }`}
              style={{
                color: "#080810",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 15,
              }}
            >
              {twoFALoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify &amp; Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back link */}
            <button
              onClick={() => {
                setTwoFARequired(false);
                setPendingSession(null);
                setTwoFACode("");
                setTwoFAError("");
                setErrors({});
              }}
              style={{
                display: "block",
                margin: "20px auto 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.4)",
              }}
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal Login Screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#080810] text-white">
      {/* LEFT PANEL */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={BG_IMAGE}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/80" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-yellow-400 to-red-500">
              🎬
            </div>
            <span className="font-bebas text-2xl tracking-widest">FILMY FROLIC</span>
          </div>

          <div>
            <h2 className="font-['Bebas_Neue'] text-[52px] tracking-[2px] text-[#f0f0f8] leading-none max-w-[440px] mb-4">
              CINEMA LIVES <br />
              <span className="bg-gradient-to-r from-[#f5c518] to-[#e84545] bg-clip-text text-transparent">
                IN THE DETAILS
              </span>
            </h2>
            <p className="text-gray-400 max-w-sm">
              Track every film, join the conversation, and play trivia with film lovers around the
              world.
            </p>

            <div className="flex gap-8 mt-8">
              <div>
                <p className="text-yellow-400 text-2xl font-bebas">2M+</p>
                <p className="text-xs text-gray-400">MEMBERS</p>
              </div>
              <div>
                <p className="text-yellow-400 text-2xl font-bebas">500K</p>
                <p className="text-xs text-gray-400">REVIEWS</p>
              </div>
              <div>
                <p className="text-yellow-400 text-2xl font-bebas">12K</p>
                <p className="text-xs text-gray-400">COMMUNITIES</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bebas mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-8">
            Sign in to your account and pick up where you left off.
          </p>

          <GoogleButton onClick={() => loginWithGoogle()} disabled={loading} />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-400">OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={loginWithEmailPassword} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email}
            />

            <InputField
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              icon={<Lock size={16} />}
              error={errors.password}
              rightSlot={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="text-right text-sm">
              <Link to="/forgot-password" className="text-yellow-400">
                Forgot password?
              </Link>
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-500">
                ⚠ {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-yellow-400/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-yellow-500"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            New here?{" "}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="text-yellow-500 font-semibold"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

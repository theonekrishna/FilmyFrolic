import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import InputField from "../components/InputField";
import { publicAxios } from "../../../utils/AxiosInstance";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Reads tokens from query params set by AuthCallbackPage:
 *   /reset-password?token=ACCESS&refreshToken=REFRESH&email=EMAIL
 *
 * Falls back to raw Supabase hash if AuthCallbackPage was bypassed:
 *   /#access_token=...&refresh_token=...&type=recovery
 */
function extractTokens(searchParams) {
  // Priority 1: clean query params from AuthCallbackPage
  const tokenFromQuery = searchParams.get("token");
  if (tokenFromQuery) {
    return {
      accessToken: tokenFromQuery,
      refreshToken: searchParams.get("refreshToken") ?? "", // ← now correctly read
      email: searchParams.get("email") ?? "",
    };
  }

  // Priority 2: raw Supabase hash (direct redirect, no callback page)
  const hash = window.location.hash.slice(1);
  if (hash) {
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const accessToken = params.get("access_token") ?? "";
    const refreshToken = params.get("refresh_token") ?? "";

    if (type === "recovery" && accessToken) {
      const payload = decodeJwtPayload(accessToken);
      const email = payload?.email ?? "";
      window.history.replaceState(null, "", window.location.pathname);
      return { accessToken, refreshToken, email };
    }
  }

  return { accessToken: "", refreshToken: "", email: "" };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [{ accessToken, refreshToken, email }] = useState(() => extractTokens(searchParams));

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const invalidLink = !accessToken;

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "New password is required.";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password.";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setLoading(true);
      // POST /api/auth/reset-password — all four fields required by the API
      await publicAxios.post("/api/auth/reset-password", {
        accessToken,
        refreshToken,
        password,
        confirmPassword,
      });
      setDone(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Reset failed. The link may have expired — please request a new one.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid / missing token ───────────────────────────────────────────────
  if (invalidLink) {
    return (
      <div className="min-h-screen flex bg-[#080810] text-white">
        <LeftPanel />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <IconBox bg="rgba(232,69,69,0.1)" border="rgba(232,69,69,0.3)">
              <AlertTriangle size={28} color="#e84545" />
            </IconBox>
            <h1 className="text-4xl font-bebas mb-2">Invalid Reset Link</h1>
            <p className="text-gray-400 mb-8">
              This link is missing or has already been used. Please request a fresh one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 w-full transition"
              style={{ color: "#080810" }}
            >
              Request new link <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex bg-[#080810] text-white">
        <LeftPanel />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <IconBox bg="rgba(245,197,24,0.1)" border="rgba(245,197,24,0.3)">
              <CheckCircle size={28} color="#f5c518" />
            </IconBox>
            <h1 className="text-4xl font-bebas mb-2">Password Reset!</h1>
            <p className="text-gray-400 mb-8">
              Your password has been updated. All existing sessions have been signed out for your
              security.
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 w-full transition"
              style={{ color: "#080810" }}
            >
              Sign in with new password <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#080810] text-white">
      <LeftPanel />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition mb-8"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>

          <h1 className="text-4xl font-bebas mb-2">Reset Password</h1>
          <p className="text-gray-400 mb-8">
            Choose a strong new password
            {email && (
              <>
                {" "}
                for <span className="text-white font-medium">{email}</span>
              </>
            )}
            .
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="New Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Min. 6 characters"
              icon={<Lock size={16} />}
              error={errors.password}
              rightSlot={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <InputField
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat your new password"
              icon={<Lock size={16} />}
              error={errors.confirmPassword}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {password.length > 0 && <PasswordStrength password={password} />}

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-500">
                ⚠ {errors.general}
                {errors.general.toLowerCase().includes("expired") && (
                  <span>
                    {" "}
                    <Link to="/forgot-password" className="underline text-yellow-400">
                      Request a new link.
                    </Link>
                  </span>
                )}
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
              style={{ color: "#080810" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />{" "}
                  Resetting…
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
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
  );
}

function IconBox({ bg, border, children }) {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 18,
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
      }}
    >
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#e84545", "#f5a623", "#f5c518", "#1fd1a8"];
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {checks.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i < score ? colors[score - 1] : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: 12,
          color: score > 0 ? colors[score - 1] : "rgba(255,255,255,0.3)",
        }}
      >
        {score > 0 ? labels[score - 1] : ""}
      </p>
    </div>
  );
}

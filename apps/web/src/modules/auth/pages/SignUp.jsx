import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  ArrowLeft,
  Check,
  Clapperboard,
} from "lucide-react";
import axios from "axios";
import InputField from "../components/InputField";
import GoogleButton from "../components/SocialButton";
import StepDots from "../components/StepDots";
import PasswordStrength from "../components/PasswordStrength";
import { useAuth } from "../../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
const BASE_URL = (import.meta.env.VITE_BASE_URL || "https://filmy-frolic-new-backend.onrender.com").replace(/\/+$/, "");
const BG_IMAGE =
  "https://images.unsplash.com/photo-1563381013529-1c922c80ac8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

//genres
const ALL_GENRES = [
  { id: 1, label: "Action", emoji: "💥" },
  { id: 2, label: "Sci-Fi", emoji: "🚀" },
  { id: 3, label: "Horror", emoji: "👻" },
  { id: 4, label: "Romance", emoji: "💕" },
  { id: 5, label: "Thriller", emoji: "🔪" },
  { id: 6, label: "Fantasy", emoji: "🧙" },
  { id: 7, label: "Anime", emoji: "⛩️" },
  { id: 8, label: "Comedy", emoji: "😂" },
  { id: 9, label: "Drama", emoji: "🎭" },
  { id: 10, label: "Documentary", emoji: "🎥" },
  { id: 11, label: "Animation", emoji: "✨" },
  { id: 12, label: "Crime", emoji: "🕵️" },
];

//signup page

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [genres, setGenres] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const { signInWithToken } = useAuth();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const response = await axios.post(`${BASE_URL}/api/auth/google`, {
          access_token: tokenResponse.access_token,
        });

        console.log("Google Signup success:", response.data);
        const { access_token } = response.data.session;
        signInWithToken(access_token);
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      } catch (error) {
        console.error("Google Signup failed:", error.response?.data || error.message);
        setErrors({
          general: error.response?.data?.message || "Google Signup failed",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      setErrors({
        general: "Google Login failed or was cancelled.",
      });
    },
  });

  // Auto-fill username from display name
  function handleDisplayName(v) {
    setDisplayName(v);
  }

  useEffect(() => {
    if (!username) return;

    // validate before API call
    if (!/^[a-z0-9_]+$/i.test(username)) return;

    const timer = setTimeout(() => {
      checkUsername(username);
    }, 500);

    return () => clearTimeout(timer); // cleanup
  }, [username]);
  function validateStep0() {
    const errs = {};

    if (!displayName.trim()) errs.displayName = "Display name is required";

    if (!username.trim()) errs.username = "Username is required";
    else if (!/^[a-z0-9_]+$/i.test(username))
      errs.username = "Only letters, numbers and underscores";

    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    else if (!/[^a-zA-Z0-9]/.test(password)) errs.password = "Must include a special character";

    if (password !== confirmPw) errs.confirmPw = "Passwords don't match";

    return errs;
  }
  function handleNext() {
    const errs = validateStep0();

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStep(1);
  }

  //genres

  function toggleGenre(id) {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  const checkUsername = async (value) => {
    if (!value) return;

    try {
      setCheckingUsername(true);

      const res = await axios.get(`${BASE_URL}/api/auth/check-username/${value}`);

      const available = res.data.available;

      if (!available) {
        setErrors((prev) => ({
          ...prev,
          username: "Username already taken",
        }));
        setUsernameAvailable(false);
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.username; // ✅ remove error properly
          return newErrors;
        });
        setUsernameAvailable(true);
      }
    } catch (err) {
      console.error("Username check error:", err);
    } finally {
      setCheckingUsername(false);
    }
  };

  async function handleSubmit() {
    if (!agreed) {
      setErrors((prev) => ({
        ...prev,
        general: "Please agree to the Terms of Service.",
      }));
      return;
    }

    if (genres.length < 2) {
      setErrors((prev) => ({
        ...prev,
        general: "Please pick at least 2 genres.",
      }));
      return;
    }

    if (!displayName || !username || !email || !password || !confirmPw) {
      setErrors((prev) => ({
        ...prev,
        general: "All fields are required.",
      }));
      return;
    }

    if (password !== confirmPw) {
      setErrors((prev) => ({
        ...prev,
        general: "Passwords do not match.",
      }));
      return;
    }

    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        general: "Password must be at least 6 characters.",
      }));
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        general: "Password must include at least one special character.",
      }));
      return;
    }

    setLoading(true);
    setErrors({});

    const data = {
      displayName: displayName.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword: confirmPw,
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/signup`, data);
      const access_token = response?.data?.session?.access_token;
      const refresh_token = response?.data?.session?.refresh_token;

      if (access_token) {
        localStorage.setItem("accessToken", access_token);
        if (refresh_token) localStorage.setItem("refreshToken", refresh_token);
        signInWithToken(access_token);
        try {
          const cleanedGenres = genres.map((g) => Number(g));
          await axios.put(
            `${BASE_URL}/api/profile/me/genres`,
            { genres: cleanedGenres },
            { headers: { Authorization: `Bearer ${access_token}` } }
          );
        } catch (e) {
          console.warn("Genre update failed:", e.message);
        }
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      } else {
        // Account created successfully (email confirmation link sent)
        navigate("/login", {
          replace: true,
          state: {
            message: "Account created successfully! Please check your email to confirm or sign in.",
          },
        });
      }
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);

      setErrors({
        general: error.response?.data?.message || "Signup failed",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex bg-[#080810]">
      {/* ── Left Panel ── */}
      <div className="hidden md:flex md:flex-1 relative overflow-hidden">
        <img src={BG_IMAGE} alt="" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(8,8,16,0.75)] via-[rgba(8,8,16,0.3)] to-[rgba(8,8,16,0.9)]" />
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[rgba(124,92,252,0.1)] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[360px] h-[360px] rounded-full bg-[rgba(245,197,24,0.08)] blur-[70px] pointer-events-none" />

        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f5c518] to-[#e84545] flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,197,24,0.3)]">
              🎬
            </div>
            <span className="font-[BebasNeue] text-2xl tracking-widest text-[#f0f0f8]">
              FILMY FROLIC
            </span>
          </div>

          <div>
            <div className="w-12 h-1.5 bg-gradient-to-r from-[#7c5cfc] to-[#3b82f6] rounded-full mb-6" />
            <h2 className="font-[BebasNeue] text-[47px] tracking-[2px] text-[#f0f0f8] leading-none mb-4">
              YOUR CINEMATIC
              <br />
              <span className="bg-gradient-to-r from-[#7c5cfc] to-[#3b82f6] bg-clip-text text-transparent">
                JOURNEY STARTS
              </span>
            </h2>
            <p className="font-outfit text-sm text-[rgba(240,240,248,0.5)] max-w-[360px] leading-[1.7] font-light">
              Rate films, join communities, play trivia, and build your watchlist — all in one
              place.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3 mt-8">
              {[
                { emoji: "🗄️", text: "Archive of 50,000+ films & series" },
                { emoji: "👥", text: "12,000+ active fan communities" },
                { emoji: "🎮", text: "Movie trivia & games every day" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.09)] flex items-center justify-center text-sm flex-shrink-0">
                    {f.emoji}
                  </div>
                  <span className="font-outfit text-xs text-[rgba(240,240,248,0.55)] font-light">
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto h-screen">
        <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(124,92,252,0.04)] blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f5c518] to-[#e84545] flex items-center justify-center text-lg shadow-[0_0_16px_rgba(245,197,24,0.25)]">
              🎬
            </div>
            <span className="font-[BebasNeue] text-xl tracking-widest text-[#f0f0f8]">
              FILMY FROLIC
            </span>
          </div>

          {/* Step Dots */}
          <StepDots current={step} total={2} />

          {/* ════ STEP 0 — Account details ════ */}
          {/* Input fields, password, GoogleButton will go here in next block */}
          {step === 0 && (
            <>
              {/* Heading */}
              <div className="mb-6">
                <h1 className="font-[BebasNeue] text-[38px] tracking-[2px] text-[#f0f0f8] leading-none mb-1">
                  Create Account
                </h1>
                <p className="font-outfit text-sm text-[rgba(240,240,248,0.4)] font-light">
                  Join 2M+ film lovers on Filmy Frolic.
                </p>
              </div>

              {/* Google Signup Button */}
              <GoogleButton onClick={() => loginWithGoogle()} disabled={loading} />

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3 mt-3">
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
                <span className="font-outfit text-[11px] text-[rgba(240,240,248,0.28)] tracking-wide">
                  OR SIGN UP WITH EMAIL
                </span>
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-[rgba(232,69,69,0.1)] border border-[rgba(232,69,69,0.3)] rounded-xl p-3 mb-5">
                  <span className="font-outfit text-sm text-[#e84545]">⚠ {errors.general}</span>
                </div>
              )}

              {/* Input Fields */}
              <div className="flex flex-col gap-3">
                <InputField
                  label="Display Name"
                  value={displayName}
                  onChange={handleDisplayName}
                  placeholder="Your full name"
                  autoComplete="name"
                  icon={<User size={16} />}
                  error={errors.displayName}
                />

                <InputField
                  label="Username"
                  value={username}
                  onChange={(v) => setUsername(v)}
                  placeholder="your_username"
                  autoComplete="username"
                  icon={<AtSign size={16} />}
                  error={errors.username}
                  hint={
                    checkingUsername
                      ? "Checking..."
                      : usernameAvailable === true
                        ? "Username available ✅"
                        : "Only letters, numbers and underscores"
                  }
                />

                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail size={16} />}
                  error={errors.email}
                />

                <div className="flex flex-col gap-1.5">
                  <InputField
                    label="Password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    icon={<Lock size={16} />}
                    error={errors.password}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="bg-transparent border-none cursor-pointer p-0 text-[rgba(240,240,248,0.35)] flex items-center justify-center"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <PasswordStrength password={password} />
                </div>

                <InputField
                  label="Confirm Password"
                  type={showCPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={setConfirmPw}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  icon={<Lock size={16} />}
                  error={errors.confirmPw}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowCPw((v) => !v)}
                      className="bg-transparent border-none cursor-pointer p-0 text-[rgba(240,240,248,0.35)] flex items-center justify-center"
                    >
                      {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Continue Button */}
                <button
                  onClick={handleNext}
                  className="h-[52px] mt-[6px] rounded-xl bg-gradient-to-br from-[#f5c518] to-[#f0a500] 
             border-none cursor-pointer flex items-center justify-center gap-[10px]
             font-['Outfit'] text-[16px] font-extrabold text-[#080810] tracking-[0.3px]
             shadow-[0_6px_24px_rgba(245,197,24,0.35)]"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>

              {/* Sign-in Link */}
              <p className="font-outfit text-sm text-[rgba(240,240,248,0.4)] text-center mt-6 font-light">
                Already have an account?{" "}
                <Link
                  to="/login"
                  state={{ from: location.state?.from }}
                  className="text-yellow-500 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
          {/* ════════════════════════════════════════════════
              STEP 1 — Genre preferences
          ════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* Back */}
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1.5 text-[13px] text-white/45 mb-6 hover:text-white/70 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>

              <div className="mb-6">
                <h1 className="font-bebas text-[38px] tracking-[2px] text-[#f0f0f8] leading-none mb-1">
                  Pick Your Genres
                </h1>

                <p className="text-sm text-white/40 font-light">
                  Choose at least 2 — we'll tailor your feed around what you love.
                </p>
              </div>

              {/* Genre grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {ALL_GENRES.map((g) => {
                  const selected = genres.includes(g.id);

                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`relative h-[66px] rounded-xl flex flex-col items-center justify-center gap-1 transition border-[1.5px]
            ${
              selected
                ? "bg-yellow-400/10 border-yellow-400 shadow-[0_0_16px_rgba(245,197,24,0.15)]"
                : "bg-white/5 border-white/10"
            }`}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Check size={9} strokeWidth={3} className="text-[#080810]" />
                        </div>
                      )}

                      <span className="text-xl">{g.emoji}</span>

                      <span
                        className={`text-[11px] ${
                          selected ? "text-yellow-400 font-bold" : "text-white/60"
                        }`}
                      >
                        {g.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected count */}
              <div className="flex items-center justify-between mb-5 text-xs">
                <span className={`${genres.length >= 2 ? "text-green-500" : "text-white/35"}`}>
                  {genres.length >= 2
                    ? `✓ ${genres.length} selected`
                    : `${genres.length}/2 minimum`}
                </span>

                {genres.length > 0 && (
                  <button
                    onClick={() => setGenres([])}
                    className="text-white/30 hover:text-white/50 transition"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 mb-5">
                <button
                  onClick={() => setAgreed((v) => !v)}
                  className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition
        ${agreed ? "bg-yellow-400 border-yellow-400" : "bg-white/5 border-white/20"}`}
                >
                  {agreed && <Check size={11} strokeWidth={3} className="text-[#080810]" />}
                </button>

                <p className="text-[12px] text-white/45 leading-relaxed font-light">
                  I agree to the{" "}
                  <Link to="/user/policies" className="text-yellow-400">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/user/policies" className="text-yellow-400">
                    Privacy Policy
                  </Link>
                  . I understand this is a demo app.
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-sm text-red-500">
                  ⚠ {errors.general}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !agreed || genres.length < 2}
                className={`h-[52px] w-full rounded-xl font-extrabold text-[16px] flex items-center justify-center gap-2 transition
      ${
        !agreed || genres.length < 2
          ? "bg-yellow-400/30 cursor-default"
          : loading
            ? "bg-yellow-400/40"
            : "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-[0_6px_24px_rgba(245,197,24,0.35)]"
      }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>🎬 Start My Journey</>
                )}
              </button>

              {/* Footer emojis */}
              <div className="flex justify-center gap-2 mt-5">
                {["🎭", "🍿", "⭐", "🎬", "🎥"].map((e, i) => (
                  <span key={i} className="text-base opacity-40">
                    {e}
                  </span>
                ))}
              </div>

              <p className="text-[12px] text-white/20 text-center mt-1.5 font-light">
                You're about to join 2M+ movie lovers
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import InputField from "../components/InputField";
import { publicAxios } from "../../../utils/AxiosInstance";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1762532264896-c70364efe09f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Check if email exists in the system
      const checkRes = await publicAxios.post("/api/auth/check-email", {
        email,
      });
      if (!checkRes.data?.exists) {
        setError("No account found with this email address.");
        return;
      }

      // Step 2: Send the password reset email
      await publicAxios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: "rgba(245,197,24,0.12)",
                  border: "1px solid rgba(245,197,24,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <CheckCircle size={28} color="#f5c518" />
              </div>

              <h1 className="text-4xl font-bebas mb-2">Check Your Inbox</h1>
              <p className="text-gray-400 mb-2">
                We've sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Didn't get it? Check your spam folder or wait a minute and try again.
              </p>

              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-yellow-400 text-sm hover:underline mb-4 block mx-auto"
              >
                Try a different email
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-gray-400 text-sm hover:text-white transition"
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition mb-8"
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>

              <h1 className="text-4xl font-bebas mb-2">Forgot Password?</h1>
              <p className="text-gray-400 mb-8">
                Enter the email you signed up with and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  icon={<Mail size={16} />}
                  error={error}
                />

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
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-gray-400 mt-8">
                Remember it?{" "}
                <Link to="/login" className="text-yellow-500 font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

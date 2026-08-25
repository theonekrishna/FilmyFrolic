import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const ERROR_MESSAGES = {
  otp_expired:
    "This reset link has expired. Reset links are only valid for a short time — please request a new one.",
  access_denied: "Access was denied. The link may have already been used or has expired.",
  email_not_confirmed: "Your email hasn't been confirmed yet. Please check your inbox.",
};

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function parseHash() {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  return {
    error: params.get("error"),
    errorCode: params.get("error_code"),
    errorDescription: params.get("error_description"),
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"), // ← was missing before
    type: params.get("type"),
  };
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { signInWithToken } = useAuth();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");

  useEffect(() => {
    const parsed = parseHash();

    // ── Error in hash ──────────────────────────────────────────────────────
    if (parsed.error || parsed.errorCode) {
      const friendly =
        ERROR_MESSAGES[parsed.errorCode] ||
        (parsed.errorDescription
          ? decodeURIComponent(parsed.errorDescription).replace(/\+/g, " ")
          : "An unexpected error occurred. Please try again.");
      setErrorMsg(friendly);
      setErrorCode(parsed.errorCode || parsed.error || "");
      setStatus("error");
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // ── Password recovery ──────────────────────────────────────────────────
    if (parsed.type === "recovery" && parsed.accessToken) {
      const payload = decodeJwtPayload(parsed.accessToken);
      const email = payload?.email ?? "";

      window.history.replaceState(null, "", window.location.pathname);

      // FIX: also pass refreshToken so ResetPasswordPage can use it
      navigate(
        `/reset-password` +
          `?token=${encodeURIComponent(parsed.accessToken)}` +
          `&refreshToken=${encodeURIComponent(parsed.refreshToken ?? "")}` +
          `&email=${encodeURIComponent(email)}`,
        { replace: true }
      );
      return;
    }

    // ── OAuth / magic-link sign-in ─────────────────────────────────────────
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setErrorMsg("Could not establish a session. Please try logging in again.");
        setStatus("error");
        return;
      }
      const { access_token, refresh_token } = session;
      localStorage.setItem("refreshToken", refresh_token);
      signInWithToken(access_token);
      setStatus("success");
      setTimeout(() => navigate("/", { replace: true }), 1000);
    });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080810",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center",
          fontFamily: "'Outfit', sans-serif",
          color: "#f0f0f8",
        }}
      >
        {status === "loading" && <LoadingState />}
        {status === "success" && <SuccessState />}
        {status === "error" && (
          <ErrorState message={errorMsg} code={errorCode} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(245,197,24,0.1)",
          border: "1px solid rgba(245,197,24,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <Loader size={28} color="#f5c518" className="animate-spin" />
      </div>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          margin: "0 0 8px",
        }}
      >
        Signing you in…
      </h2>
      <p style={{ color: "rgba(240,240,248,0.45)", fontSize: 14 }}>
        Hang tight, this only takes a second.
      </p>
    </>
  );
}

function SuccessState() {
  return (
    <>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(31,209,168,0.1)",
          border: "1px solid rgba(31,209,168,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <CheckCircle size={28} color="#1fd1a8" />
      </div>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          margin: "0 0 8px",
        }}
      >
        All good!
      </h2>
      <p style={{ color: "rgba(240,240,248,0.45)", fontSize: 14 }}>Redirecting you now…</p>
    </>
  );
}

function ErrorState({ message, code, navigate }) {
  const isExpired = code === "otp_expired";
  return (
    <>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(232,69,69,0.1)",
          border: "1px solid rgba(232,69,69,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <AlertTriangle size={28} color="#e84545" />
      </div>
      <h2
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          margin: "0 0 12px",
        }}
      >
        {isExpired ? "Link Expired" : "Something Went Wrong"}
      </h2>
      <p
        style={{
          color: "rgba(240,240,248,0.55)",
          fontSize: 14,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}
      >
        {message}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {isExpired && (
          <button
            onClick={() => navigate("/forgot-password", { replace: true })}
            style={{
              height: 48,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(to right, #f5c518, #f5a623)",
              color: "#080810",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Request a new reset link
          </button>
        )}
        <button
          onClick={() => navigate("/login", { replace: true })}
          style={{
            height: 48,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            background: "transparent",
            color: "rgba(240,240,248,0.6)",
          }}
        >
          Back to login
        </button>
      </div>
    </>
  );
}

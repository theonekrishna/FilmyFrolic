import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, LogIn, UserPlus } from "lucide-react";

/**
 * AuthPromptModal
 *
 * Props:
 *   isOpen   {boolean}
 *   onClose  {fn}
 *   message  {string}  — optional custom message
 */

const KF = `
@keyframes auth-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes auth-card-in {
  from { opacity: 0; transform: translate(-50%, -44%) scale(0.93); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes auth-float {
  0%,100% { transform: translateY(0px) rotate(-8deg); }
  50%      { transform: translateY(-6px) rotate(-8deg); }
}
@keyframes auth-float2 {
  0%,100% { transform: translateY(0px) rotate(12deg); }
  50%      { transform: translateY(-8px) rotate(12deg); }
}
@keyframes auth-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
@keyframes auth-ring-spin {
  to { transform: rotate(360deg); }
}
@keyframes auth-pulse-dot {
  0%,100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.15); }
}
`;

if (typeof document !== "undefined" && !document.getElementById("auth-prompt-kf")) {
  const s = document.createElement("style");
  s.id = "auth-prompt-kf";
  s.textContent = KF;
  document.head.appendChild(s);
}

export default function AuthPromptModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);

    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultMessage =
    message ||
    "Join communities, connect with members, and be part of discussions with people who share your interests.";

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9990,
          background: "rgba(4,4,14,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "auth-backdrop-in 0.2s ease both",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 9991,
          width: "min(400px, 92vw)",
          background: "linear-gradient(160deg, #13131f 0%, #0e0e1a 100%)",
          border: "1px solid rgba(245,197,24,0.15)",
          borderRadius: 20,
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(245,197,24,0.06), inset 0 1px 0 rgba(245,197,24,0.08)",
          overflow: "hidden",
          animation: "auth-card-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Shimmer top border */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,197,24,0.7) 40%, rgba(232,69,69,0.5) 60%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "auth-shimmer 3s linear infinite",
          }}
        />

        {/* Decorative floating icons */}
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            fontSize: 28,
            opacity: 0.09,
            animation: "auth-float 3.2s ease-in-out infinite",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          🌐
        </div>

        <div
          style={{
            position: "absolute",
            top: 48,
            left: 20,
            fontSize: 20,
            opacity: 0.07,
            animation: "auth-float2 4s ease-in-out infinite",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          👥
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(240,240,248,0.4)",
            transition: "background 0.15s, color 0.15s",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(240,240,248,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(240,240,248,0.4)";
          }}
        >
          <X size={13} strokeWidth={2.5} />
        </button>

        {/* Body */}
        <div style={{ padding: "28px 28px 24px" }}>
          {/* Icon cluster */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(245,197,24,0.12), rgba(232,69,69,0.08))",
                border: "1px solid rgba(245,197,24,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* spinning ring */}
              <svg
                style={{
                  position: "absolute",
                  inset: -4,
                  width: "calc(100% + 8px)",
                  height: "calc(100% + 8px)",
                  animation: "auth-ring-spin 8s linear infinite",
                  opacity: 0.22,
                }}
                viewBox="0 0 72 72"
              >
                <circle
                  cx="36"
                  cy="36"
                  r="33"
                  fill="none"
                  stroke="url(#auth-ring-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />

                <defs>
                  <linearGradient id="auth-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f5c518" />
                    <stop offset="100%" stopColor="#e84545" />
                  </linearGradient>
                </defs>
              </svg>

              <span style={{ fontSize: 26 }}>👥</span>

              {/* pulse dots */}
              {[0, 120, 240].map((deg, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: i === 0 ? "#f5c518" : i === 1 ? "#e84545" : "#3b82f6",
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${deg}deg) translateX(34px) translateY(-50%)`,
                    animation: `auth-pulse-dot 1.8s ${i * 0.3}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 26,
                letterSpacing: "2.5px",
                background: "linear-gradient(90deg, #f5c518, #f0f0f8 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1,
              }}
            >
              Join the Community
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.48)",
                lineHeight: 1.55,
                padding: "0 8px",
              }}
            >
              {defaultMessage}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
              margin: "20px 0",
            }}
          />

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {[
              { emoji: "🛡️", label: "Create Communities" },
              { emoji: "👥", label: "Join Communities" },
              { emoji: "💬", label: "Chat with Members" },
            ].map((f) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 100,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 11,
                  color: "rgba(240,240,248,0.5)",
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 12 }}>{f.emoji}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "linear-gradient(135deg, #f5c518 0%, #e84545 100%)",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#08080f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(245,197,24,0.25), 0 2px 8px rgba(232,69,69,0.15)",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <LogIn size={15} strokeWidth={2.5} />
              Sign In
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/signup");
              }}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(245,197,24,0.22)",
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(245,197,24,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(245,197,24,0.08)";
                e.currentTarget.style.borderColor = "rgba(245,197,24,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(245,197,24,0.22)";
              }}
            >
              <UserPlus size={15} strokeWidth={2.2} />
              Create Account
            </button>
          </div>

          {/* Footer note */}
          <p
            style={{
              margin: "14px 0 0",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 10.5,
              color: "rgba(240,240,248,0.22)",
              textAlign: "center",
              letterSpacing: "0.3px",
            }}
          >
            Free to join · Discover communities worldwide
          </p>
        </div>
      </div>
    </>
  );
}

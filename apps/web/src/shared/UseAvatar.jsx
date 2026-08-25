import { useState, useEffect, useRef } from "react";
import { privateAxios } from "../utils/AxiosInstance";
import { useProfile } from "../context/Profilecontext";
export const SIZE_MAP = { xs: 24, sm: 32, md: 40, lg: 56 };
export const DOT_MAP = { xs: 6, sm: 8, md: 9, lg: 11 };
export const FONT_MAP = { xs: 8, sm: 10, md: 13, lg: 17 };

export const GRADS = [
  "linear-gradient(135deg,#f5c518,#e84545)",
  "linear-gradient(135deg,#3b82f6,#7c5cfc)",
  "linear-gradient(135deg,#1fd1a8,#3b82f6)",
  "linear-gradient(135deg,#e84545,#7c5cfc)",
  "linear-gradient(135deg,#f5c518,#1fd1a8)",
];

export function getGrad(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return GRADS[Math.abs(h) % GRADS.length];
}

/* ── Keyframes injected once ── */
const KEYFRAMES = `
@keyframes ff-avatar-pulse {
  0%,100% { opacity:0.5; }
  50%      { opacity:1;   }
}
@keyframes ff-tooltip-in {
  from { opacity:0; transform:translateY(6px) scale(0.97); }
  to   { opacity:1; transform:translateY(0)   scale(1);    }
}
@keyframes ff-lock-bounce {
  0%,100% { transform:translateY(0);  }
  40%     { transform:translateY(-3px); }
  70%     { transform:translateY(1px);  }
}
@keyframes ff-ring-spin {
  to { transform:rotate(360deg); }
}`;

if (typeof document !== "undefined" && !document.getElementById("ff-avatar-kf")) {
  const s = document.createElement("style");
  s.id = "ff-avatar-kf";
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════
   NOT-LOGGED-IN AVATAR
   A ghost avatar shell that opens a sleek
   sign-in nudge card on hover / click.
══════════════════════════════════════════════ */
function GuestAvatar({ size = "md", accentColor = "#f5c518", onLoginClick }) {
  const px = SIZE_MAP[size];
  const dot = DOT_MAP[size];
  const font = FONT_MAP[size];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex flex-shrink-0" style={{ isolation: "isolate" }}>
      {/* ── Ghost shell button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Sign in"
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          border: `1.5px dashed rgba(245,197,24,0.5)`,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(6px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s, background 0.2s",
          position: "relative",
          overflow: "hidden",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.background = "rgba(245,197,24,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(245,197,24,0.5)";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }}
      >
        {/* spinning dashed ring */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            animation: "ff-ring-spin 8s linear infinite",
            opacity: 0.25,
          }}
          viewBox="0 0 40 40"
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeDasharray="5 4"
          />
        </svg>

        {/* lock icon */}
        <svg
          style={{
            width: font + 4,
            height: font + 4,
            animation: "ff-lock-bounce 2.4s ease-in-out infinite",
            flexShrink: 0,
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,197,24,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {/* offline dot */}
      <div
        className="absolute rounded-full box-border"
        style={{
          bottom: 1,
          right: 1,
          width: dot,
          height: dot,
          background: "rgba(240,240,248,0.2)",
          border: "2px solid #080810",
        }}
      />

      {/* ── Sign-in popover ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: px + 10,
            right: 0,
            width: 220,
            borderRadius: 14,
            background: "linear-gradient(145deg,#131318,#1c1c24)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,197,24,0.08)",
            padding: "18px 18px 16px",
            zIndex: 9999,
            animation: "ff-tooltip-in 0.2s cubic-bezier(.22,1,.36,1) both",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}
        >
          {/* small arrow tip */}
          <div
            style={{
              position: "absolute",
              top: -6,
              right: SIZE_MAP[size] / 2 - 6,
              width: 12,
              height: 12,
              background: "#131318",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              borderRight: "none",
              transform: "rotate(45deg)",
              borderRadius: 2,
            }}
          />

          {/* avatar placeholder inside card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(245,197,24,0.1)",
                border: "1.5px dashed rgba(245,197,24,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(245,197,24,0.7)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#f0f0f8",
                  letterSpacing: "-0.01em",
                }}
              >
                You're not signed in
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(240,240,248,0.4)",
                  marginTop: 2,
                }}
              >
                Sign in to access your profile
              </p>
            </div>
          </div>

          {/* divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.06)",
              marginBottom: 14,
            }}
          />

          {/* CTA button */}
          <button
            onClick={() => {
              setOpen(false);
              onLoginClick?.();
            }}
            style={{
              width: "100%",
              padding: "9px 0",
              borderRadius: 9,
              background: `linear-gradient(135deg, ${accentColor}, #e84545)`,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#080810",
              letterSpacing: "0.01em",
              fontFamily: "inherit",
              boxShadow: `0 4px 14px rgba(245,197,24,0.25)`,
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
            Sign In
          </button>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: 10.5,
              color: "rgba(240,240,248,0.3)",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Your session may have expired.
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */

export default function UserAvatar({
  size = "md",
  status = "offline",
  accentColor = "#f5c518",
  onClick,
  onLoginClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { sharedProfile, profileLoaded } = useProfile();
  const profile = sharedProfile;
  const loading = !profileLoaded;
  // notLoggedIn = fetch is done but no id means guest user
  const notLoggedIn = profileLoaded && !sharedProfile?.id;

  /* ── Not logged in → show guest UI ── */
  if (!loading && notLoggedIn) {
    return <GuestAvatar size={size} accentColor={accentColor} onLoginClick={onLoginClick} />;
  }

  /* ── Sizes ── */
  const px = SIZE_MAP[size];
  const dot = DOT_MAP[size];
  const font = FONT_MAP[size];

  const name = profile?.display_name ?? "";
  const initials = name
    .split(" ")
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  console.log(profile);
  const gradient = profile?.gradient || getGrad(name);
  const avatarUrl = profile?.avatar_url ?? null;
  const currentStatus = loading ? "loading" : status;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex flex-shrink-0"
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div
        className="rounded-full overflow-hidden box-border flex-shrink-0 transition-colors duration-200"
        style={{
          width: px,
          height: px,
          border: hovered ? `2px solid ${accentColor}` : "2px solid transparent",
        }}
      >
        {currentStatus === "loading" ? (
          <div
            className="w-full h-full"
            style={{
              background: "rgba(255,255,255,0.08)",
              animation: "ff-avatar-pulse 1.4s infinite",
            }}
          />
        ) : avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold"
            style={{
              background: gradient,
              fontFamily: "'Outfit', sans-serif",
              fontSize: font,
              color: "#080810",
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Status dot */}
      {currentStatus !== "loading" && (
        <div
          className="absolute box-border rounded-full border-2 border-[#080810]"
          style={{
            bottom: 1,
            right: 1,
            width: dot,
            height: dot,
            background: status === "online" ? "#1fd1a8" : "rgba(240,240,248,0.25)",
          }}
        />
      )}
    </div>
  );
}

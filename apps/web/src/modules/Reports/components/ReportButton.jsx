import { useState, useEffect } from "react";
import { Flag } from "lucide-react";
import { checkUserReport } from "../services/reportService";
import ReportModal from "./ReportModal";

/**
 * ReportButton — importable button that opens a full report modal.
 *
 * Props:
 *   moduleType      {string}   "feed" | "feed_comment" | "meme" | "meme_comment"
 *                               | "gossip" | "gossip_comment" | "community" | ...
 *   targetId        {string}   ID of the content being reported (UUID as string)
 *   targetUserId    {string=}  Owner's user ID (optional, helps backend)
 *   contentPreview  {string=}  Short text preview shown inside the report modal
 *   isLoggedIn      {boolean}  If false, triggers onRequireAuth or redirects to /login
 *   isOwner         {boolean}  If true, button is completely hidden (can't report own content)
 *   onRequireAuth   {()=>void=} Alternative: call this instead of redirecting
 *
 *   // Appearance overrides
 *   size            {"sm"|"md"|"lg"}  default "sm"
 *   variant         {"icon"|"text"|"full"}  default "icon"
 *   className       {string=}  extra CSS classes
 *   style           {Object=}  extra inline styles
 */
export default function ReportButton({
  moduleType,
  targetId,
  targetUserId,
  contentPreview,
  isLoggedIn = false,
  isOwner = false,
  onRequireAuth,
  size = "sm",
  variant = "icon",
  className = "",
  style = {},
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  // Check if user already reported this content when logged in (skip for own content)
  useEffect(() => {
    if (isOwner || !isLoggedIn || !moduleType || !targetId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await checkUserReport(moduleType, targetId);
        if (!cancelled) setAlreadyReported(res?.reported === true);
      } catch {
        // silently ignore — assume not yet reported
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOwner, isLoggedIn, moduleType, targetId]);

  // ── Completely hidden for own content — can't report yourself ──────────────
  if (isOwner) return null;

  const iconSize = 14;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        window.location.href = "/login";
      }
      return;
    }
    if (alreadyReported) return; // no-op if already reported
    setModalOpen(true);
  };

  const reportedColor = "#e84545";
  const idleColor = "rgba(240,240,248,0.35)";

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    cursor: alreadyReported ? "default" : "pointer",
    background: "transparent",
    border: "none",
    padding: 0,
    transition: "color 0.15s, opacity 0.15s",
    color: alreadyReported ? reportedColor : idleColor,
    fontFamily: "'Outfit', sans-serif",
    fontSize: size === "lg" ? 13 : size === "md" ? 12 : 11,
    fontWeight: 500,
    opacity: alreadyReported ? 0.7 : 1,
    ...style,
  };

  const label = alreadyReported ? "Reported" : "Report";

  return (
    <>
      <button
        onClick={handleClick}
        title={alreadyReported ? "Already reported" : `Report this ${moduleType}`}
        aria-label={label}
        className={className}
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!alreadyReported) e.currentTarget.style.color = reportedColor;
        }}
        onMouseLeave={(e) => {
          if (!alreadyReported) e.currentTarget.style.color = idleColor;
        }}
      >
        <Flag size={iconSize} />
        {(variant === "text" || variant === "full") && <span>{label}</span>}
      </button>

      <ReportModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onSuccess={() => {
          setAlreadyReported(true);
        }}
        moduleType={moduleType}
        targetId={targetId}
        targetUserId={targetUserId}
        contentPreview={contentPreview}
        isLoggedIn={isLoggedIn}
        onRequireAuth={onRequireAuth}
      />
    </>
  );
}

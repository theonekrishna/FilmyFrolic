import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useFollow } from "../hooks/useFollow";

/**
 * FollowUnFollowToggleButton
 *
 * Props:
 *   targetUserId {string}         — the user to follow/unfollow
 *   size         {"sm"|"md"|"lg"} — visual size preset (default "sm")
 *   className    {string}
 */
export default function FollowUnFollowToggleButton({ targetUserId, size = "sm", className = "" }) {
  const { user } = useAuth();
  const { isFollowing, isLoading, isOwn, toggle, error } = useFollow(targetUserId, user?.id);
  const [hovered, setHovered] = useState(false);

  if (isOwn || !user || !targetUserId) return null;

  const ACCENT = "#3b82f6";
  const DANGER = "#e84545";

  const sizeStyles = {
    sm: {
      padding: "3px 10px",
      fontSize: 11,
      height: 26,
      borderRadius: 100,
      fontWeight: 700,
      minWidth: 68,
    },
    md: {
      padding: "6px 18px",
      fontSize: 13,
      height: 34,
      borderRadius: 100,
      fontWeight: 700,
      minWidth: 100,
    },
    lg: {
      padding: "10px 24px",
      fontSize: 14,
      height: 42,
      borderRadius: 100,
      fontWeight: 700,
      minWidth: 130,
    },
  };

  const style = sizeStyles[size] ?? sizeStyles.sm;
  const showUnfollowHover = isFollowing && hovered && !isLoading;

  const bgColor = showUnfollowHover ? `${DANGER}18` : isFollowing ? `${ACCENT}15` : ACCENT;
  const borderColor = showUnfollowHover ? `${DANGER}60` : isFollowing ? `${ACCENT}50` : ACCENT;
  const textColor = showUnfollowHover ? DANGER : isFollowing ? ACCENT : "#fff";
  const label = isLoading
    ? "..."
    : showUnfollowHover
      ? "Unfollow"
      : isFollowing
        ? "Following"
        : "Follow";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isLoading}
      title={error || label}
      style={{
        ...style,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        color: textColor,
        fontFamily: "'Outfit', sans-serif",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.65 : 1,
        transition: "all 0.18s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
      className={`follow-toggle-btn ${className}`}
    >
      {label}
    </button>
  );
}

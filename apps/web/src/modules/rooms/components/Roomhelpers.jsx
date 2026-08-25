// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers used by all room cards
// Optimized: React.memo on all exported components, lazy img loading
// ─────────────────────────────────────────────────────────────────────────────
import { memo } from "react";

/**
 * Shows the host's avatar.
 * • If avatarUrl is present → circular photo (lazy loaded)
 * • Otherwise              → gradient circle with initials
 */
export const HostAvatar = memo(function HostAvatar({ avatarUrl, initials, gradient, size = 28 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: avatarUrl ? "transparent" : gradient,
    border: "1.5px solid rgba(255,255,255,0.12)",
  };

  const getInitials = (name = initials) =>
    (name || "")
      .trim()
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase())
      .join("");

  const data = getInitials();

  if (avatarUrl) {
    return (
      <div style={style}>
        <img
          src={avatarUrl}
          alt={data}
          loading="lazy" // ← lazy load
          decoding="async" // ← async decode (non-blocking)
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.style.background = gradient;
            e.currentTarget.parentElement.innerHTML = `<span style="font-size:${Math.round(size * 0.36)}px;font-weight:800;color:#080810">${initials}</span>`;
          }}
        />
      </div>
    );
  }

  return (
    <div style={style}>
      <span
        style={{
          fontSize: Math.round(size * 0.36),
          fontWeight: 800,
          color: "#080810",
          lineHeight: 1,
        }}
      >
        {data}
      </span>
    </div>
  );
});

/**
 * Gold ⭐ FEATURED badge
 */
export const FeaturedBadge = memo(function FeaturedBadge() {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 999,
        background: "rgba(245,197,24,0.18)",
        border: "1px solid rgba(245,197,24,0.55)",
        backdropFilter: "blur(6px)",
        zIndex: 10,
      }}
    >
      <span style={{ fontSize: 11 }}>⭐</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: "#f5c518",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Featured
      </span>
    </div>
  );
});

/**
 * Thin gold top-border glow applied to the card wrapper when featured.
 * Pure function — no memo needed.
 */
export function featuredCardStyle(featured) {
  if (!featured) return {};
  return {
    borderColor: "rgba(245,197,24,0.45)",
    boxShadow: "0 0 0 1px rgba(245,197,24,0.2), 0 8px 32px rgba(245,197,24,0.08)",
  };
}

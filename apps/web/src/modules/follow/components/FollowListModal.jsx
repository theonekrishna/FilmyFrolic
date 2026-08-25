import { useState, useEffect } from "react";
import { X, Loader2, UserCircle2 } from "lucide-react";
import { getFollowers, getFollowing } from "../services/followService";

/**
 * FollowListModal
 *
 * Props:
 *   isOpen     {boolean}
 *   onClose    {fn}
 *   userId     {string}   — whose followers/following to load
 *   type       {"followers"|"following"}
 *   count      {number}   — shown in the title
 */
export default function FollowListModal({ isOpen, onClose, userId, type, count }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setList([]);
      try {
        const res = type === "followers" ? await getFollowers(userId) : await getFollowing(userId);

        if (!cancelled) {
          // API returns { success: true, data: [...] }
          setList(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (!cancelled) setError("Failed to load " + type);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  const title = type === "followers" ? `Followers · ${count ?? ""}` : `Following · ${count ?? ""}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(420px, 92vw)",
          maxHeight: "70vh",
          background: "#13131f",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 18,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 20,
              letterSpacing: 1.5,
              color: "#f0f0f8",
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(240,240,248,0.6)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 40,
              }}
            >
              <Loader2
                size={28}
                color="#3b82f6"
                style={{ animation: "spin 0.7s linear infinite" }}
              />
            </div>
          )}

          {error && (
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "#e84545",
                textAlign: "center",
                padding: 24,
              }}
            >
              {error}
            </p>
          )}

          {!loading && !error && list.length === 0 && (
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.35)",
                textAlign: "center",
                padding: 32,
              }}
            >
              No {type} yet
            </p>
          )}

          {!loading &&
            list.map((item, i) => {
              // API response shape:
              // { follower_id/following_id, created_at, profiles: { id, username, display_name, avatar_url, avatar_color, gradient, avatar_preset } }
              const p = item.profiles || {};
              const name = p.display_name || p.username || "User";
              const username = p.username;
              const avatarUrl = p.avatar_url;
              const avatarColor = p.avatar_color || "#6366F1";
              const gradient = p.gradient;
              const useGradient = !avatarUrl && (p.avatar_preset === "gradient" || gradient);
              const initials = (p.initials || name.slice(0, 2)).toUpperCase();

              const avatarBg = useGradient ? gradient : avatarColor;

              return (
                <div
                  key={p.id || item.follower_id || item.following_id || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: avatarBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                  )}

                  {/* Name / username */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#f0f0f8",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </div>
                    {username && (
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 12,
                          color: "rgba(240,240,248,0.4)",
                        }}
                      >
                        @{username}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}

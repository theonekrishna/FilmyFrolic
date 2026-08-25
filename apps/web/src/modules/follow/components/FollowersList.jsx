import { useState, useEffect } from "react";
import { getFollowers } from "../services/followService";

/**
 * FollowersList
 *
 * Displays a list of followers for a given userId.
 *
 * Props:
 *   userId   {string}   — whose followers to show
 *   onClose  {function} — called when user wants to close/dismiss
 */
export default function FollowersList({ userId, onClose }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const ACCENT = "#3b82f6";

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      const res = await getFollowers(userId);
      if (!cancelled) {
        setFollowers(res.data ?? []);
        setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      style={{
        background: "#12121e",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        minWidth: 280,
        maxHeight: 480,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 18,
            letterSpacing: 2,
            color: "#f0f0f8",
          }}
        >
          Followers
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(240,240,248,0.4)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 32,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: ACCENT,
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : followers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 20px",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              color: "rgba(240,240,248,0.35)",
            }}
          >
            No followers yet
          </div>
        ) : (
          followers.map((item) => {
            const p = item.profiles ?? {};
            const initials = p.initials || (p.display_name?.[0] ?? "?");
            return (
              <div
                key={item.follower_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 18px",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: p.gradient || "#2a2a3e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Outfit', sans-serif",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.display_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Names */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f0f8",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.display_name || "Unknown"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: "rgba(240,240,248,0.38)",
                    }}
                  >
                    @{p.username || "user"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import { Laptop, LogOut, Shield, AlertTriangle, Smartphone, Globe } from "lucide-react";
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import SettingsLoader from "../components/SettingsLoader";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";

const ACCENT = "#3b82f6";

// Simple UUID generator
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ── Module-level helpers (avoid recreation every render) ────────────────────
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDeviceIcon(label) {
  if (!label) return <Laptop size={18} />;
  const lower = label.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return <Smartphone size={18} />;
  }
  if (lower.includes("web") || lower.includes("browser")) {
    return <Globe size={18} />;
  }
  return <Laptop size={18} />;
}

// ── SessionRow ───────────────────────────────────────────────────────────────
const SessionRow = memo(function SessionRow({ session, isCurrent, isLast, onRevoke }) {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleRevoke = useCallback(() => onRevoke(session.id), [onRevoke, session.id]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
        background: isCurrent ? `${ACCENT}08` : "transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: isCurrent ? `${ACCENT}20` : "rgba(255,255,255,0.05)",
            border: `1px solid ${isCurrent ? `${ACCENT}40` : "rgba(255,255,255,0.1)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isCurrent ? ACCENT : "rgba(240,240,248,0.5)",
          }}
        >
          {getDeviceIcon(session.session_label)}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#f0f0f8",
              }}
            >
              {session.session_label || "Unknown Device"}
            </span>
            {isCurrent && (
              <span
                style={{
                  padding: "2px 8px",
                  background: `${ACCENT}20`,
                  border: `1px solid ${ACCENT}40`,
                  borderRadius: 100,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: ACCENT,
                }}
              >
                CURRENT
              </span>
            )}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.4)",
              marginTop: 4,
            }}
          >
            IP: {session.ip_address || "Unknown"}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 11,
              color: "rgba(240,240,248,0.3)",
              marginTop: 2,
            }}
          >
            Last active: {formatDate(session.last_active)}
          </div>
        </div>
      </div>
      {!isCurrent && (
        <button
          onClick={handleRevoke}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            padding: "8px 14px",
            background: hovered ? "rgba(232,69,69,0.1)" : "transparent",
            border: `1px solid ${hovered ? "rgba(232,69,69,0.5)" : "rgba(232,69,69,0.3)"}`,
            borderRadius: 8,
            color: "#e84545",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s",
          }}
        >
          <LogOut size={14} />
          Revoke
        </button>
      )}
    </div>
  );
});

export default function SessionsPage({ inModal = false, onClose }) {
  const toastApi = useToast();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  // Get or create session ID for this device
  const getOrCreateSessionId = useCallback(() => {
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  }, []);

  // Ping session heartbeat
  const pingSession = useCallback(async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const label = `${navigator.platform} - ${navigator.userAgent.split(" ")[0]}`;
      await settingsService.pingSession(sessionId, label);
    } catch (err) {
      console.error("Session ping error:", err);
    }
  }, [getOrCreateSessionId]);

  const loadSessions = useCallback(async () => {
    try {
      // Check cache first
      const cached = settingsCache.get(CACHE_KEYS.SESSIONS);
      if (cached) {
        setLoading(false);
        const sessionsData = cached?.sessions || cached;
        const items = Array.isArray(sessionsData) ? sessionsData : [];
        setSessions(items);
        // Identify current session
        const storedSessionId = localStorage.getItem("sessionId");
        if (storedSessionId) {
          setCurrentSessionId(storedSessionId);
        }
      } else {
        setLoading(true);
      }

      // Fetch fresh data
      const res = await settingsCache.fetchWithCache(
        CACHE_KEYS.SESSIONS,
        () => settingsService.getSessions(),
        { staleWhileRevalidate: true }
      );
      const sessionsData = res?.sessions || res;
      const items = Array.isArray(sessionsData) ? sessionsData : [];
      setSessions(items);

      // Identify current session
      const storedSessionId = localStorage.getItem("sessionId");
      if (storedSessionId) {
        setCurrentSessionId(storedSessionId);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
      toastApi.error("Error", "Failed to load sessions", 3000);
    } finally {
      setLoading(false);
    }
  }, [toastApi]);

  useEffect(() => {
    loadSessions();
    pingSession();

    // Set up heartbeat interval (every 5 minutes)
    const interval = setInterval(pingSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadSessions, pingSession]);

  const handleRevokeSession = useCallback(
    async (sessionId) => {
      if (
        !window.confirm(
          "Are you sure you want to revoke this session? The device will be logged out."
        )
      )
        return;

      try {
        await settingsService.revokeSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toastApi.success("Session Revoked", "The session has been terminated.", 3000);
      } catch (err) {
        console.error("Error revoking session:", err);
        toastApi.error("Error", "Failed to revoke session", 3000);
      }
    },
    [toastApi]
  );

  const handleRevokeAllOthers = useCallback(async () => {
    if (
      !window.confirm(
        "Revoke all other sessions? You'll be logged out everywhere except this device."
      )
    )
      return;

    try {
      setRevokingAll(true);
      const currentId = getOrCreateSessionId();
      await settingsService.revokeAllSessions(currentId);

      // Reload sessions
      await loadSessions();
      toastApi.success("Sessions Revoked", "All other sessions have been terminated.", 3000);
    } catch (err) {
      console.error("Error revoking all sessions:", err);
      toastApi.error("Error", "Failed to revoke sessions", 3000);
    } finally {
      setRevokingAll(false);
    }
  }, [getOrCreateSessionId, loadSessions, toastApi]);

  if (loading) {
    return <SettingsLoader text="Loading sessions..." />;
  }

  const otherSessionsCount = sessions.filter((s) => s.id !== currentSessionId).length;

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header - hidden in modal */}
      {!inModal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 20,
            padding: "16px 20px",
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}18`,
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Shield size={20} color={ACCENT} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 20,
                  letterSpacing: 2,
                  color: "#f0f0f8",
                  lineHeight: 1,
                }}
              >
                Active Sessions
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.38)",
                  marginTop: 2,
                }}
              >
                {sessions.length} active session
                {sessions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          {otherSessionsCount > 0 && (
            <button
              onClick={handleRevokeAllOthers}
              disabled={revokingAll}
              style={{
                padding: "10px 18px",
                background: "transparent",
                border: `1px solid ${ACCENT}50`,
                borderRadius: 8,
                color: ACCENT,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: revokingAll ? 0.6 : 1,
              }}
            >
              <LogOut size={14} />
              {revokingAll ? "Revoking..." : "Log Out All Others"}
            </button>
          )}
        </div>
      )}

      {/* Security Notice */}
      <div
        style={{
          background: "rgba(245,197,24,0.08)",
          border: "1px solid rgba(245,197,24,0.2)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <AlertTriangle size={18} color="#f5c518" />
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            color: "rgba(240,240,248,0.7)",
          }}
        >
          If you notice any unfamiliar sessions, revoke them immediately and change your password.
        </span>
      </div>

      {/* Sessions List */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {sessions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            <Laptop size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>No active sessions</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sessions.map((session, index) => {
              const isCurrent = session.id === currentSessionId || session.is_current;
              return (
                <SessionRow
                  key={session.id}
                  session={session}
                  isCurrent={isCurrent}
                  isLast={index === sessions.length - 1}
                  onRevoke={handleRevokeSession}
                />
              );
            })}
          </div>
        )}
      </div>

      {!inModal && <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />}
    </div>
  );
}

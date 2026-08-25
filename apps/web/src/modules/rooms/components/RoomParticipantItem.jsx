import { useState, useCallback, useMemo, memo } from "react";
import { privateAxios } from "../../../utils/AxiosInstance";

// ── Memoized mic indicator icons ──────────────────────────────────────────────
const MicOnIndicator = memo(function MicOnIndicator() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    </svg>
  );
});

const MicOffIndicator = memo(function MicOffIndicator() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    </svg>
  );
});

const AllowSpeakIcon = memo(function AllowSpeakIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    </svg>
  );
});

const RemoveSpeakIcon = memo(function RemoveSpeakIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    </svg>
  );
});

const KickIcon = memo(function KickIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 2.25m0 0l4.5 5.25M12 2.25L7.5 7.5" />
    </svg>
  );
});

const SpinnerTiny = memo(function SpinnerTiny() {
  return <span className="spinner-tiny" />;
});

// ── Main component ────────────────────────────────────────────────────────────
function RoomParticipantItem({ user, is_admin, room_id, refresh }) {
  const [loadingToggleSpeak, setLoadingToggleSpeak] = useState(false);
  const [loadingKick, setLoadingKick] = useState(false);

  // useMemo: derived values computed once per render, not on every expression
  const role = user.role || user.roles || "";
  const isSpeaker = useMemo(
    () => role === "speaker" || (Array.isArray(role) && role.includes("speaker")),
    [role]
  );
  const isUserAdmin = useMemo(
    () => user.is_admin || user.is_host || (user.roles || []).includes("host"),
    [user.is_admin, user.is_host, user.roles]
  );
  const initials = useMemo(
    () =>
      (user.display_name || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [user.display_name]
  );

  // useCallback: stable handlers so this component doesn't cause re-renders
  // in any memoized parent that passes these down
  const toggleSpeak = useCallback(async () => {
    try {
      setLoadingToggleSpeak(true);
      const r = user.role || user.roles || "";
      const isSpeakerNow = r === "speaker" || (Array.isArray(r) && r.includes("speaker"));
      const newRole = isSpeakerNow ? "listener" : "speaker";

      await privateAxios.patch(`/api/rooms/assign-role`, {
        room_id,
        target_user_id: user.user_id,
        new_role: newRole,
      });
      await privateAxios.patch(`/api/rooms/toggle-mute`, {
        room_id,
        target_user_id: user.user_id,
        is_mic_on: !isSpeakerNow,
      });
      await refresh();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update speaker status");
    } finally {
      setLoadingToggleSpeak(false);
    }
  }, [room_id, user.user_id, user.role, user.roles, refresh]);

  const kickParticipant = useCallback(async () => {
    try {
      setLoadingKick(true);
      await privateAxios.delete(`/api/rooms/kick`, {
        data: { room_id, target_user_id: user.user_id },
      });
      await refresh();
      window.dispatchEvent(new Event("room-updated"));
    } catch (err) {
      console.error("Kick error:", err.response?.data || err.message);
      alert("Failed to kick participant");
    } finally {
      setLoadingKick(false);
    }
  }, [room_id, user.user_id, refresh]);

  // Hosts are never rendered (same logic as original)
  if (user.role === "host" || user.roles?.[0] === "host") return null;

  return (
    <div className="participant-item">
      <div className="participant-avatar">{initials}</div>

      <div className="participant-info">
        <span className="participant-name">
          {user.display_name}
          {isUserAdmin && <span className="participant-crown">👑</span>}
        </span>
        <span className={`participant-role ${isSpeaker ? "role-speaker" : "role-listener"}`}>
          {isSpeaker ? "Speaker" : "Listener"}
        </span>
      </div>

      <div className="participant-status">
        {user.is_hand_raised && <span className="hand-indicator">✋</span>}
        {isSpeaker && (
          <span className={`mic-indicator ${user.is_mic_on ? "mic-on" : "mic-off"}`}>
            {user.is_mic_on ? <MicOnIndicator /> : <MicOffIndicator />}
          </span>
        )}
      </div>

      {is_admin && !isUserAdmin && (
        <div className="participant-actions">
          {/* Toggle Speaker */}
          <button
            onClick={toggleSpeak}
            disabled={loadingToggleSpeak}
            className={`action-btn ${isSpeaker ? "action-btn--warn" : "action-btn--success"} ${loadingToggleSpeak ? "loading" : ""}`}
            title={isSpeaker ? "Remove speaker" : "Allow speak"}
          >
            {loadingToggleSpeak ? (
              <SpinnerTiny />
            ) : isSpeaker ? (
              <RemoveSpeakIcon />
            ) : (
              <AllowSpeakIcon />
            )}
          </button>

          {/* Kick */}
          <button
            onClick={kickParticipant}
            disabled={loadingKick}
            className={`action-btn action-btn--danger ${loadingKick ? "loading" : ""}`}
            title="Kick participant"
          >
            {loadingKick ? <SpinnerTiny /> : <KickIcon />}
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(RoomParticipantItem);

import { useState, useCallback, memo } from "react";
import { privateAxios } from "../../../utils/AxiosInstance";

// ── Memoized SVG icons to avoid re-creating JSX on every render ──────────────
const MicOnIcon = memo(function MicOnIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
});

const MicOffIcon = memo(function MicOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
});

const CamOnIcon = memo(function CamOnIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
});

const CamOffIcon = memo(function CamOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h3a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
    </svg>
  );
});

const MuteAllIcon = memo(function MuteAllIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2" />
    </svg>
  );
});

const LinkIcon = memo(function LinkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
});

const CheckIcon = memo(function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
});

const EndRoomIcon = memo(function EndRoomIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
});

const Spinner = memo(function Spinner() {
  return <span className="spinner-small" />;
});

// ── Main component ────────────────────────────────────────────────────────────
function RoomActionBar({
  room,
  clientRef,
  localTracks,
  is_admin,
  roomId,
  refresh,
  onEndRoom,
  roomType = "video_room",
  inviteLink = "",
}) {
  if (!is_admin) return null;

  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [loadingMic, setLoadingMic] = useState(false);
  const [loadingCam, setLoadingCam] = useState(false);
  const [loadingMuteAll, setLoadingMuteAll] = useState(false);
  const [loadingEndRoom, setLoadingEndRoom] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);

  // useCallback: stable handler refs — avoids unnecessary child re-renders
  const toggleAdminMic = useCallback(async () => {
    try {
      setLoadingMic(true);
      const audioTrack = localTracks.current.audio;
      const client = clientRef.current;
      if (!audioTrack) return;

      if (audioTrack.__muted) {
        await client.publish([audioTrack]);
        audioTrack.__muted = false;
        setMicMuted(false);
      } else {
        await client.unpublish([audioTrack]);
        audioTrack.__muted = true;
        setMicMuted(true);
      }
    } catch (err) {
      console.error("Mic toggle error:", err);
    } finally {
      setLoadingMic(false);
    }
  }, [clientRef, localTracks]);

  const toggleAdminCamera = useCallback(async () => {
    if (roomType === "voice_room") return;
    try {
      setLoadingCam(true);
      const videoTrack = localTracks.current.video;
      if (!videoTrack) return;
      await videoTrack.setEnabled(!videoTrack.enabled);
      const myUid = clientRef.current.uid;
      const slotEl = document.getElementById(`slot-${myUid}`);
      if (slotEl) {
        const ph = slotEl.querySelector(".video-tile-placeholder");
        if (videoTrack.enabled) {
          if (ph) ph.style.display = "none";
        } else {
          if (ph) ph.style.display = "flex";
        }
      }
      setCamOff(!videoTrack.enabled);
    } catch (err) {
      console.error("Camera toggle error:", err);
    } finally {
      setLoadingCam(false);
    }
  }, [clientRef, localTracks, roomType]);

  const muteAll = useCallback(async () => {
    try {
      setLoadingMuteAll(true);
      await privateAxios.post(`/api/rooms/mute-all`, { room_id: roomId });
      refresh && refresh();
    } catch (err) {
      console.error("Mute all error:", err.response?.data || err.message);
    } finally {
      setLoadingMuteAll(false);
    }
  }, [roomId, refresh]);

  const handleEndRoom = useCallback(async () => {
    try {
      setLoadingEndRoom(true);
      await privateAxios.delete(`/api/rooms/stop/${roomId}`);
      if (onEndRoom) onEndRoom();
    } catch (err) {
      console.error("End room error:", err);
      alert("Failed to end room. Please try again.");
    } finally {
      setLoadingEndRoom(false);
    }
  }, [roomId, onEndRoom]);

  const handleCopyLink = useCallback(() => {
    if (!inviteLink) {
      alert("Invite link not available");
      return;
    }
    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        setCopyNotification(true);
        setTimeout(() => setCopyNotification(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert("Failed to copy link");
      });
  }, [inviteLink]);

  return (
    <div className="controls-bar">
      <div className="controls-group">
        {/* Mic */}
        <button
          onClick={toggleAdminMic}
          disabled={loadingMic}
          className={`control-btn ${micMuted ? "control-btn--off" : "control-btn--on"} ${loadingMic ? "loading" : ""}`}
          title={micMuted ? "Unmute mic" : "Mute mic"}
        >
          <span className="control-btn-icon">
            {loadingMic ? <Spinner /> : micMuted ? <MicOffIcon /> : <MicOnIcon />}
          </span>
          <span className="control-btn-label">{micMuted ? "Unmute" : "Mute"}</span>
        </button>

        {/* Camera — only show for video_room */}
        {roomType === "video_room" && (
          <button
            onClick={toggleAdminCamera}
            disabled={loadingCam}
            className={`control-btn ${camOff ? "control-btn--off" : "control-btn--on"} ${loadingCam ? "loading" : ""}`}
            title={camOff ? "Turn on camera" : "Turn off camera"}
          >
            <span className="control-btn-icon">
              {loadingCam ? <Spinner /> : camOff ? <CamOffIcon /> : <CamOnIcon />}
            </span>
            <span className="control-btn-label">{camOff ? "Cam On" : "Cam Off"}</span>
          </button>
        )}

        {/* Mute all */}
        <button
          onClick={muteAll}
          disabled={loadingMuteAll}
          className={`control-btn control-btn--neutral ${loadingMuteAll ? "loading" : ""}`}
          title="Mute all participants"
        >
          <span className="control-btn-icon">{loadingMuteAll ? <Spinner /> : <MuteAllIcon />}</span>
          <span className="control-btn-label">Mute All</span>
        </button>

        {/* Copy Invite Link */}
        <button
          onClick={handleCopyLink}
          disabled={!inviteLink}
          className="control-btn control-btn--neutral"
          title="Copy invite link"
        >
          <span className="control-btn-icon">
            {copyNotification ? <CheckIcon /> : <LinkIcon />}
          </span>
          <span className="control-btn-label">{copyNotification ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      {/* End Room Button */}
      <button
        onClick={handleEndRoom}
        disabled={loadingEndRoom}
        className={`end-room-btn ${loadingEndRoom ? "loading" : ""}`}
        title="End room for all participants"
      >
        {loadingEndRoom ? (
          <>
            <Spinner />
            Ending...
          </>
        ) : (
          <>
            <EndRoomIcon />
            End Room
          </>
        )}
      </button>
    </div>
  );
}

export default memo(RoomActionBar);

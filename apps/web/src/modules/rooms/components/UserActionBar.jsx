import { useState, useEffect } from "react";
import axios from "axios";
import AgoraRTC from "agora-rtc-sdk-ng";
import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";
const baseURL = (import.meta.env.VITE_BASE_URL || "https://filmyfrolic-api.onrender.com").replace(/\/+$/, "");

export default function UserActionBar({
  localTracks,
  clientRef,
  is_speaker,
  roomId,
  roomType = "video_room",
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [loadingMic, setLoadingMic] = useState(false);
  const [loadingCam, setLoadingCam] = useState(false);
  const [loadingHand, setLoadingHand] = useState(false);

  const token = localStorage.getItem("accessToken");

  // ── Raise/Lower Hand (available to all users) ──────────────────────────────
  const toggleHand = async () => {
    try {
      setLoadingHand(true);
      const newState = !handRaised;
      await privateAxios.patch(`/api/rooms/raise-hand`, {
        room_id: roomId,
        is_hand_raised: newState,
      });
      setHandRaised(newState);
      window.dispatchEvent(new Event("room-updated"));
    } catch (err) {
      console.error("Raise hand error:", err);
      alert("Failed to update hand status");
    } finally {
      setLoadingHand(false);
    }
  };

  // ── Mic toggle (only for speakers) ──────────────────────────────────────────
  const toggleMic = async () => {
    try {
      setLoadingMic(true);
      let track = localTracks.current.audio;
      if (!track || track._closed) {
        track = await AgoraRTC.createMicrophoneAudioTrack();
        localTracks.current.audio = track;
      }
      const isEnabled = track.enabled;
      const newMicState = !isEnabled;

      if (isEnabled) {
        await clientRef.current.unpublish([track]);
        await track.setEnabled(false);
      } else {
        await track.setEnabled(true);
        await new Promise((res) => setTimeout(res, 100));
        await clientRef.current.publish([track]);
      }
      await privateAxios.patch(`/api/rooms/toggle-media`, {
        room_id: roomId,
        is_mic_on: newMicState,
      });
      setMicOn(newMicState);
    } catch (err) {
      console.error("User mic error:", err);
      alert("Failed to toggle microphone");
    } finally {
      setLoadingMic(false);
    }
  };

  // ── Camera toggle (only for speakers and video_room) ──────────────────────
  const toggleCamera = async () => {
    if (roomType === "voice_room") return;

    try {
      setLoadingCam(true);
      let track = localTracks.current.video;
      const isEnabled = track?.enabled ?? false;
      const newCamState = !isEnabled;

      if (isEnabled && track) {
        await clientRef.current.unpublish([track]);
        await track.setEnabled(false);
        const myUid = clientRef.current.uid;
        const slotEl = document.getElementById(`slot-${myUid}`);
        if (slotEl) {
          const ph = slotEl.querySelector(".video-tile-placeholder");
          if (ph) ph.style.display = "flex";
        }
      } else {
        if (!track || track._closed) {
          track = await AgoraRTC.createCameraVideoTrack();
          localTracks.current.video = track;
        }
        await track.setEnabled(true);
        await new Promise((res) => setTimeout(res, 100));
        await clientRef.current.publish([track]);
      }
      await privateAxios.patch(`/api/rooms/toggle-media`, {
        room_id: roomId,
        is_video_on: newCamState,
      });
      setCamOn(newCamState);
    } catch (err) {
      console.error("User camera error:", err);
      alert("Failed to toggle camera");
    } finally {
      setLoadingCam(false);
    }
  };

  return (
    <div className="controls-bar">
      <div className="controls-group">
        {/* Mic — only show for speakers */}
        {is_speaker && (
          <button
            onClick={toggleMic}
            disabled={loadingMic}
            className={`control-btn ${micOn ? "control-btn--on" : "control-btn--off"} ${loadingMic ? "loading" : ""}`}
            title={micOn ? "Mute mic" : "Unmute mic"}
          >
            <span className="control-btn-icon">
              {loadingMic ? (
                <span className="spinner-small"></span>
              ) : micOn ? (
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
              ) : (
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
              )}
            </span>
            <span className="control-btn-label">{micOn ? "Mute" : "Unmute"}</span>
          </button>
        )}

        {/* Camera — only show for speakers in video_room */}
        {is_speaker && roomType === "video_room" && (
          <button
            onClick={toggleCamera}
            disabled={loadingCam}
            className={`control-btn ${camOn ? "control-btn--on" : "control-btn--off"} ${loadingCam ? "loading" : ""}`}
            title={camOn ? "Turn off camera" : "Turn on camera"}
          >
            <span className="control-btn-icon">
              {loadingCam ? (
                <span className="spinner-small"></span>
              ) : camOn ? (
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
              ) : (
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
              )}
            </span>
            <span className="control-btn-label">{camOn ? "Cam Off" : "Cam On"}</span>
          </button>
        )}

        {/* Raise Hand — show for ALL users (speakers and listeners) */}
        {is_speaker && (
          <button
            onClick={toggleHand}
            disabled={loadingHand}
            className={`control-btn ${handRaised ? "control-btn--warn" : "control-btn--on"} ${loadingHand ? "loading" : ""}`}
            title={handRaised ? "Lower hand" : "Raise hand"}
          >
            <span className="control-btn-icon" style={{ fontSize: "20px" }}>
              {loadingHand ? <span className="spinner-small"></span> : "✋"}
            </span>
            <span className="control-btn-label">{handRaised ? "Lower" : "Raise"}</span>
          </button>
        )}

        {/* Screen Share for Desktop Watch Parties */}
        {is_speaker && roomType === "watch_party" && (
          <button
            onClick={async () => {
              try {
                if (!screenSharing) {
                  const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: "1080p_1" });
                  if (localTracks.current.video) {
                    await clientRef.current.unpublish([localTracks.current.video]);
                  }
                  await clientRef.current.publish([screenTrack]);
                  localTracks.current.screen = screenTrack;
                  setScreenSharing(true);
                  screenTrack.on("track-ended", async () => {
                    await clientRef.current.unpublish([screenTrack]);
                    setScreenSharing(false);
                  });
                } else {
                  if (localTracks.current.screen) {
                    await clientRef.current.unpublish([localTracks.current.screen]);
                    localTracks.current.screen.close();
                    localTracks.current.screen = null;
                  }
                  setScreenSharing(false);
                }
              } catch (err) {
                console.error("Screen share error:", err);
              }
            }}
            className={`control-btn ${screenSharing ? "control-btn--warn" : "control-btn--on"}`}
            title={screenSharing ? "Stop Sharing Screen" : "Share Screen"}
          >
            <span className="control-btn-icon" style={{ fontSize: "18px" }}>
              📺
            </span>
            <span className="control-btn-label">{screenSharing ? "Stop Share" : "Share Screen"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

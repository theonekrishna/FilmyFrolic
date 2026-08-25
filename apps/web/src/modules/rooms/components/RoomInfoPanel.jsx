import { useState, useEffect, useCallback, memo } from "react";
import RoomParticipantItem from "./RoomParticipantItem";
import { privateAxios } from "../../../utils/AxiosInstance";

const Toast = memo(function Toast({ message, type = "error" }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        left: "auto",
        zIndex: 9999,
        background: type === "error" ? "rgba(239,68,68,0.95)" : "rgba(34,197,94,0.95)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        animation: "toastIn 0.25s ease",
      }}
    >
      {type === "error" ? "⚠️ " : "✓ "}
      {message}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
});

function RoomInfoPanel({ room, roomId, refresh, is_admin, onClose }) {
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [roomHostId, setRoomHostId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 3000);
  }, []);

  useEffect(() => {
    const fetchRoomHost = async () => {
      try {
        const res = await privateAxios.get(`/api/rooms/${roomId}`);
        const hostId = res.data.data.owner_id || res.data.host_id;
        if (hostId) {
          setRoomHostId(hostId);
          const followRes = await privateAxios.get(`/api/follow/${hostId}/is-following`);
          if (followRes.data.success) setIsFollowing(followRes.data.isFollowing);
        }
      } catch (err) {
        console.error("Error fetching room host:", err);
      }
    };
    fetchRoomHost();
  }, [roomId]);

  const leave = useCallback(async () => {
    try {
      setLoadingLeave(true);
      await privateAxios.post(`/api/rooms/exit`, { room_id: roomId });
      window.dispatchEvent(new Event("room-updated"));
      window.location.href = "/social/rooms";
    } catch (err) {
      console.error("Leave error:", err);
      window.location.href = "/social/rooms";
    } finally {
      setLoadingLeave(false);
    }
  }, [roomId]);

  const handleFollowToggle = useCallback(async () => {
    if (!roomHostId) return;
    try {
      setLoadingFollow(true);
      if (isFollowing) {
        await privateAxios.delete(`/api/follow/${roomHostId}`);
        setIsFollowing(false);
      } else {
        await privateAxios.post(`/api/follow/${roomHostId}`);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      showToast(err.response.data.message || "You cannot follow this user");
    } finally {
      setLoadingFollow(false);
    }
  }, [roomHostId, isFollowing, showToast]);

  const MAX_SHOWN = 4;
  const visibleParticipants = room.participants.slice(0, MAX_SHOWN);
  const hiddenCount = Math.max(0, room.participants.length - MAX_SHOWN);

  return (
    <>
      <Toast message={toast.message} type={toast.type} />
      <div className="info-panel">
        <div className="panel-header">
          <div className="panel-header-left">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Participants</span>
            <span className="participant-badge">{room.participants.length}</span>
          </div>
          {onClose && (
            <button className="panel-close-btn" onClick={onClose} aria-label="Close panel">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="panel-room-info">
          <h2 className="panel-room-title">{room.title}</h2>
          {room.subtitle && <p className="panel-room-subtitle">{room.subtitle}</p>}
        </div>

        {/* Follow/Unfollow Button — only for non-admin */}
        {!is_admin && roomHostId && (
          <div className="panel-follow-section">
            <button
              onClick={handleFollowToggle}
              disabled={loadingFollow}
              className={`follow-btn ${isFollowing ? "follow-btn--following" : "follow-btn--follow"} ${loadingFollow ? "loading" : ""}`}
            >
              {loadingFollow ? (
                <>
                  <span className="spinner-tiny-white"></span>
                  {isFollowing ? "Unfollowing..." : "Following..."}
                </>
              ) : isFollowing ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.15a2.988 2.988 0 0 0-5.7 0H4a1 1 0 0 0 0 2h2.15a2.988 2.988 0 0 0 5.7 0H20a1 1 0 0 0 0-2zm0 6h-2.15a2.988 2.988 0 0 0-5.7 0H4a1 1 0 0 0 0 2h2.15a2.988 2.988 0 0 0 5.7 0H20a1 1 0 0 0 0-2zm0 6h-2.15a2.988 2.988 0 0 0-5.7 0H4a1 1 0 0 0 0 2h2.15a2.988 2.988 0 0 0 5.7 0H20a1 1 0 0 0 0-2z" />
                  </svg>
                  Following
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Follow Host
                </>
              )}
            </button>
          </div>
        )}

        <div className="participants-list">
          {room.participants.length === 0 ? (
            <div className="no-participants">No participants yet</div>
          ) : (
            <>
              {visibleParticipants.map((p) => (
                <RoomParticipantItem
                  key={p.user_id + JSON.stringify(p.roles) + p.is_mic_on}
                  user={p}
                  is_admin={is_admin}
                  room_id={roomId}
                  refresh={refresh}
                />
              ))}
              {hiddenCount > 0 && (
                <div className="participant-item participant-item--others">
                  <div className="participant-avatar-group">
                    {room.participants
                      .slice(MAX_SHOWN, Math.min(MAX_SHOWN + 3, room.participants.length))
                      .map((p, idx) => (
                        <div
                          key={p.user_id}
                          className="participant-avatar participant-avatar--small"
                          style={{ marginLeft: idx > 0 ? "-12px" : "0" }}
                          title={p.display_name}
                        >
                          {(p.display_name || "?")
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      ))}
                  </div>
                  <span className="participant-others-text">
                    {hiddenCount} other{hiddenCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="panel-footer">
          <button
            onClick={leave}
            disabled={loadingLeave}
            className={`leave-btn ${loadingLeave ? "loading" : ""}`}
          >
            {loadingLeave ? (
              <>
                <span className="spinner-small"></span>Leaving...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Leave Room
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(RoomInfoPanel);

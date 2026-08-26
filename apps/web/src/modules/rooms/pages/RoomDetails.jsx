import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import "../styles/rooms.css";
import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";
import RoomMediaSection from "../components/RoomMediaSection";
import RoomInfoPanel from "../components/RoomInfoPanel";
import RoomActionBar from "../components/RoomActionBar";
import UserActionBar from "../components/UserActionBar";
import ReportButton from "../../Reports/components/ReportButton";

const baseURL = (import.meta.env.VITE_BASE_URL || "https://filmy-frolic-new-backend.onrender.com").replace(/\/+$/, "");

const SLOTS_DESKTOP = 9;
const SLOTS_MOBILE = 6;
const getSPP = () => (window.innerWidth <= 768 ? SLOTS_MOBILE : SLOTS_DESKTOP);

export default function RoomDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code"); // Extract invite code from URL

  const [isSpeaker, setIsSpeaker] = useState(false);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [is_a_host, setIsHost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roomType, setRoomType] = useState("video_room");
  const [inviteLink, setInviteLink] = useState(""); // Store invite link for copy

  const clientRef = useRef(null);
  const localTracks = useRef({ audio: null, video: null });
  const roomRef = useRef(null);
  const tilesRef = useRef([]);
  const pageRef = useRef(0);
  const isAdminRef = useRef(false);

  const token = localStorage.getItem("accessToken");

  // ── helpers ────────────────────────────────────────────────────────────────
  const getNameByUid = (agoraUid) => {
    const p = (roomRef.current?.participants || []).find((u) => u.agora_uid === agoraUid);
    return p?.display_name || `User ${agoraUid}`;
  };

  const mkInitials = (name) =>
    (name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ── grid render ───────────────────────────────────────────────────────────
  const renderGrid = (page) => {
    const grid = document.getElementById("video-grid");
    if (!grid) return;

    const spp = getSPP();
    const tiles = tilesRef.current;
    const pages = Math.max(1, Math.ceil(tiles.length / spp));
    const safe = Math.min(page ?? pageRef.current, pages - 1);

    pageRef.current = safe;
    setCurrentPage(safe);
    setTotalPages(pages);

    const slice = tiles.slice(safe * spp, safe * spp + spp);
    const count = slice.length;

    grid.className =
      "video-grid " +
      (count === 1
        ? "grid-1"
        : count === 2
          ? "grid-2"
          : count <= 3
            ? "grid-3"
            : count <= 6
              ? "grid-6"
              : "grid-9");

    const wantedIds = new Set(slice.map((t) => `slot-${t.uid}`));
    Array.from(grid.children).forEach((el) => {
      if (!wantedIds.has(el.id)) grid.removeChild(el);
    });

    slice.forEach(({ uid, name }, idx) => {
      const slotId = `slot-${uid}`;
      let slot = document.getElementById(slotId);

      if (!slot) {
        slot = document.createElement("div");
        slot.className = "video-slot";
        slot.id = slotId;

        const ph = document.createElement("div");
        ph.className = "video-tile-placeholder";
        ph.innerHTML = `
          <div class="avatar-initials">${mkInitials(name)}</div>
          <span class="avatar-name">${name}</span>
        `;
        slot.appendChild(ph);
      }

      const existing = grid.children[idx];
      if (existing !== slot) {
        grid.insertBefore(slot, existing || null);
      }
    });

    if (roomType === "video_room") {
      reattachTracks();
    }
  };

  const reattachTracks = () => {
    if (roomType === "voice_room") return;

    const client = clientRef.current;
    if (!client) return;

    if (localTracks.current.video && !localTracks.current.video.isPlaying) {
      const myUid = client.uid;
      const mySlot = document.getElementById(`slot-${myUid}`);
      if (mySlot) {
        localTracks.current.video.play(mySlot, { fit: "cover", mirror: true });
        const ph = mySlot.querySelector(".video-tile-placeholder");
        if (ph) ph.style.display = "none";
      }
    }

    for (const user of client.remoteUsers) {
      if (user.videoTrack) {
        const slotEl = document.getElementById(`slot-${user.uid}`);
        if (slotEl && !user.videoTrack.isPlaying) {
          user.videoTrack.play(slotEl, { fit: "cover", mirror: true });
          const ph = slotEl.querySelector(".video-tile-placeholder");
          if (ph) ph.style.display = "none";
        }
      }
      if (user.audioTrack && !user.audioTrack.isPlaying) {
        try {
          user.audioTrack.play();
        } catch (_) {}
      }
    }
  };

  const addTile = (uid, name) => {
    if (tilesRef.current.find((t) => t.uid === uid)) return;
    tilesRef.current = [...tilesRef.current, { uid, name }];
    renderGrid(pageRef.current);
  };

  const removeTile = (uid) => {
    tilesRef.current = tilesRef.current.filter((t) => t.uid !== uid);
    const spp = getSPP();
    const pages = Math.max(1, Math.ceil(tilesRef.current.length / spp));
    renderGrid(Math.min(pageRef.current, pages - 1));
  };

  const goToPage = (p) => renderGrid(p);

  // ── lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    init();
    const onResize = () => renderGrid(pageRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      leaveAgora();
    };
  }, [id]);

  useEffect(() => {
    const onEnded = () => {
      window.location.href = "/social/rooms";
    };
    const onUpdate = () => {
      fetchRoom();
    };
    window.addEventListener("room-ended", onEnded);
    window.addEventListener("room-updated", onUpdate);
    return () => {
      window.removeEventListener("room-ended", onEnded);
      window.removeEventListener("room-updated", onUpdate);
    };
  }, []);

  // ── init ──────────────────────────────────────────────────────────────────
  const init = async () => {
    try {
      // 🔥 INCLUDE INVITE CODE IF PRESENT
      const joinPayload = { room_id: id };
      if (inviteCode) {
        joinPayload.invite_code = inviteCode;
      }

      const joinRes = await privateAxios.post(`/api/rooms/join`, joinPayload);
      const joinData = joinRes.data.data;

      const roomRes = await privateAxios.get(`/api/rooms/${id}`);
      const isHost = roomRes.data.is_admin;
      const type = joinData.room_type || joinData.room?.room_type || "video_room";

      // 🔥 EXTRACT AND STORE INVITE LINK
      const roomInviteLink = joinData.room?.invite_link || "";
      setInviteLink(roomInviteLink);

      setRoomType(type);
      await fetchRoom();

      setTimeout(() => {
        initAgora({ ...joinData, isHost, roomType: type });
      }, 0);
    } catch (err) {
      console.error("INIT ERROR:", err);
    }
  };

  // ── agora ─────────────────────────────────────────────────────────────────
  const initAgora = async (data) => {
    document.addEventListener(
      "click",
      () => {
        try {
          AgoraRTC.resumeAudioContext();
        } catch (_) {}
      },
      { once: true }
    );

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    await client.join(data.agora_app_id, data.room?.id, data.agora_token, data.agora_uid);

    const roomInterval = setInterval(() => {
      fetchRoom();
    }, 3000);
    client.__roomInterval = roomInterval;

    const isAdmin =
      data.isHost ||
      data.role === "host" ||
      (Array.isArray(data.role) && data.role.includes("host"));

    isAdminRef.current = isAdmin;

    // ── ROLE POLLER (non-admin) ────────────────────────────────────────────
    const roleInterval = setInterval(async () => {
      try {
        const res = await privateAxios.get(`/api/rooms/${data.room_id}/users`);
        const allUsers = res.data.data || [];

        // ── FIX 1: KICK DETECTION ─────────────────────────────────────────
        const me = allUsers.find(
          (u) =>
            u.user_id === data.user_id || u.id === data.user_id || u.agora_uid === data.agora_uid
        );

        if (!me) {
          clearInterval(roleInterval);
          clearInterval(client.__roomInterval);
          await leaveAgora();
          window.location.href = "/social/rooms";
          return;
        }

        const role = me.role || me.roles || "";
        const canSpeak =
          role === "speaker" ||
          role === "host" ||
          (Array.isArray(role) && (role.includes("speaker") || role.includes("host")));

        setIsSpeaker(canSpeak);

        // gain mic
        if (!isAdmin && canSpeak && !localTracks.current.audio) {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localTracks.current.audio = audioTrack;
          await client.publish([audioTrack]);
        }

        // gain cam (only for video_room)
        if (
          data.roomType === "video_room" &&
          !isAdmin &&
          canSpeak &&
          !localTracks.current.video &&
          !localTracks.current.__creatingVideo
        ) {
          try {
            localTracks.current.__creatingVideo = true;
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            localTracks.current.video = videoTrack;
            await client.publish([videoTrack]);
            addTile(data.agora_uid, data.display_name || getNameByUid(data.agora_uid));
            await new Promise((r) => setTimeout(r, 100));
            const slotEl = document.getElementById(`slot-${data.agora_uid}`);
            if (slotEl) {
              try {
                videoTrack.stop();
              } catch (_) {}
              videoTrack.play(slotEl, { fit: "cover", mirror: true });
            }
          } finally {
            localTracks.current.__creatingVideo = false;
          }
        }

        // lose media
        if (!isAdmin && !canSpeak) {
          if (localTracks.current.audio) {
            await client.unpublish([localTracks.current.audio]);
            localTracks.current.audio.close();
            localTracks.current.audio = null;
          }
          await privateAxios.patch(`/api/rooms/toggle-media`, {
            room_id: data.room_id,
            is_mic_on: false,
          });
          if (data.roomType === "video_room" && localTracks.current.video) {
            await client.unpublish([localTracks.current.video]);
            localTracks.current.video.close();
            localTracks.current.video = null;
          }
        }
      } catch (err) {
        // ── FIX 2: ROOM ENDED DETECTION (via 404/403) ────────────────────
        if (!isAdminRef.current && (err.response?.status === 404 || err.response?.status === 403)) {
          clearInterval(roleInterval);
          clearInterval(client.__roomInterval);
          await leaveAgora();
          window.location.href = "/social/rooms";
          return;
        }
        console.error("Role error:", err.message);
      }
    }, 2000);

    client.__interval = roleInterval;

    setIsHost(isAdmin);

    // ── ADMIN ────────────────────────────────────────────────────────────
    if (isAdmin) {
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        let videoTrack = null;

        if (data.roomType === "video_room") {
          videoTrack = await AgoraRTC.createCameraVideoTrack();
        }

        localTracks.current = { audio: audioTrack, video: videoTrack };

        const tracksToPublish = videoTrack ? [audioTrack, videoTrack] : [audioTrack];
        await client.publish(tracksToPublish);

        const myUid = client.uid;
        const name = data.display_name || "You (Host)";

        addTile(myUid, name);

        let grid = document.getElementById("video-grid");

        if (!grid) {
          console.error("❌ video-grid not found");
        }

        let slotEl = document.getElementById(`slot-${myUid}`);

        if (!slotEl) {
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          slotEl = document.createElement("div");
          slotEl.className = "video-slot";
          slotEl.id = `slot-${myUid}`;

          const ph = document.createElement("div");
          ph.className = "video-tile-placeholder";
          ph.innerHTML = `
        <div class="avatar-initials">${initials}</div>
        <span class="avatar-name">${name}</span>
      `;

          slotEl.appendChild(ph);
          grid.appendChild(slotEl);
        }

        if (data.roomType === "video_room" && videoTrack) {
          videoTrack.play(slotEl, {
            fit: "cover",
            mirror: true,
          });

          const ph = slotEl.querySelector(".video-tile-placeholder");
          if (ph) ph.style.display = "none";
        }

        audioTrack.setEnabled(true);
        audioTrack.setMuted(false);

        const mediaUpdate = {
          room_id: data.room_id,
          is_mic_on: true,
        };
        if (data.roomType === "video_room") {
          mediaUpdate.is_video_on = true;
        }
        await privateAxios.patch(`/api/rooms/toggle-media`, mediaUpdate);
      } catch (err) {
        console.error("Camera error:", err.message);
      }
    }

    // ── SPEAKER (non-admin) ───────────────────────────────────────────────
    if (!isAdmin && data.role?.includes("speaker")) {
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTracks.current.audio = audioTrack;
        await client.publish([audioTrack]);
        addTile(data.agora_uid, data.display_name || getNameByUid(data.agora_uid));
      } catch (err) {
        console.error("Speaker mic error:", err.message);
      }
    }

    // ── EXISTING REMOTE USERS ─────────────────────────────────────────────
    const handleExisting = async () => {
      try {
        const usersRes = await privateAxios.get(`/api/rooms/${id}/users`);
        const allUsers = usersRes.data.data || [];

        allUsers.forEach((u) => {
          if (u.agora_uid) {
            addTile(u.agora_uid, u.display_name);
          }
        });

        const client = clientRef.current;

        for (const user of client.remoteUsers) {
          if (data.roomType === "video_room" && user.videoTrack) {
            await client.subscribe(user, "video");

            const tryPlay = (attempts = 0) => {
              const slotEl = document.getElementById(`slot-${user.uid}`);
              if (!slotEl) {
                if (attempts < 10) {
                  setTimeout(() => tryPlay(attempts + 1), 100);
                }
                return;
              }
              user.videoTrack.play(slotEl, { fit: "cover", mirror: true });
              const ph = slotEl.querySelector(".video-tile-placeholder");
              if (ph) ph.style.display = "none";
            };
            tryPlay();
          }

          if (user.hasAudio) {
            await client.subscribe(user, "audio");
            try {
              user.audioTrack.play();
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("handleExisting error:", err);
      }
    };
    setTimeout(handleExisting, 500);
    setTimeout(handleExisting, 1500);

    // ── EVENTS ────────────────────────────────────────────────────────────
    client.on("user-joined", async () => {
      await fetchRoom();

      (roomRef.current?.participants || []).forEach((p) => {
        if (p.agora_uid) {
          addTile(p.agora_uid, p.display_name);
        }
      });
    });

    client.on("user-published", async (user, mediaType) => {
      if (data.roomType === "voice_room" && mediaType === "video") {
        return;
      }

      await client.subscribe(user, mediaType);

      if (mediaType === "video" && data.roomType === "video_room") {
        if (!tilesRef.current.find((t) => t.uid === user.uid)) {
          addTile(user.uid, getNameByUid(user.uid));
        }
        const tryPlay = (attempts = 0) => {
          const slotEl = document.getElementById(`slot-${user.uid}`);
          if (slotEl) {
            user.videoTrack.play(slotEl, { fit: "cover", mirror: true });
            const ph = slotEl.querySelector(".video-tile-placeholder");
            if (ph) ph.style.display = "none";
          } else if (attempts < 10) {
            setTimeout(() => tryPlay(attempts + 1), 100);
          }
        };
        tryPlay();
      }

      if (mediaType === "audio") {
        const roomUsers = await publicAxios.get(`/api/rooms/${id}/users`);
        const cu = roomUsers.data.data.find((u) => u.agora_uid === user.uid);
        if (cu?.is_mic_on) {
          try {
            user.audioTrack.play();
          } catch (_) {}
        }
      }
    });

    client.on("user-unpublished", (user, mediaType) => {
      if (mediaType === "video" && data.roomType === "video_room") {
        const slotEl = document.getElementById(`slot-${user.uid}`);

        if (slotEl) {
          const ph = slotEl.querySelector(".video-tile-placeholder");
          if (ph) ph.style.display = "flex";

          const n = slotEl.querySelector(".avatar-name");
          if (n) n.textContent = getNameByUid(user.uid);
        }
      }
    });

    client.on("user-left", async (user) => {
      removeTile(user.uid);
      fetchRoom();
      window.dispatchEvent(new Event("room-updated"));

      const isHostUser = user.uid === data.agora_uid;
      if (isHostUser && !isAdmin) {
        const grid = document.getElementById("video-grid");
        if (grid) {
          grid.className = "video-grid grid-1";
          grid.innerHTML = `<div class="host-ended-msg">Host ended the stream</div>`;
        }
        setTimeout(() => {
          window.location.href = "/social/rooms";
        }, 2000);
      }
    });
  };

  // ── leave ─────────────────────────────────────────────────────────────────
  const leaveAgora = async () => {
    try {
      if (clientRef.current?.__interval) clearInterval(clientRef.current.__interval);
      if (clientRef.current?.__roomInterval) clearInterval(clientRef.current.__roomInterval);
      localTracks.current.audio?.close();
      localTracks.current.video?.close();
      await clientRef.current?.leave();
    } catch (_) {}
  };

  // ── fetch room ────────────────────────────────────────────────────────────
  const fetchRoom = async () => {
    try {
      const [roomRes, usersRes] = await Promise.all([
        privateAxios.get(`/api/rooms/${id}`),
        privateAxios.get(`/api/rooms/${id}/users`),
      ]);

      const status = roomRes.data.status;
      const isEnded = roomRes.data.is_ended;
      if (
        !isAdminRef.current &&
        (isEnded === true || status === "ended" || status === "inactive" || status === "stopped")
      ) {
        window.location.href = "/social/rooms";
        return;
      }

      const roomData = {
        id: roomRes.data.id,
        title: roomRes.data.title,
        subtitle: roomRes.data.subtitle,
        is_host: roomRes.data.is_host,
        participants: usersRes.data.data || [],
      };
      setRoom(roomData);
      roomRef.current = roomData;
      setLoading(false);
    } catch (err) {
      if (!isAdminRef.current && (err.response?.status === 404 || err.response?.status === 403)) {
        window.location.href = "/social/rooms";
        return;
      }
      console.error(err);
    }
  };

  // ── end room (admin) ──────────────────────────────────────────────────────
  const handleEndRoom = async () => {
    try {
      await privateAxios.delete(`/api/rooms/stop/${id}`);

      window.dispatchEvent(new Event("room-ended"));

      if (clientRef.current?.__interval) {
        clearInterval(clientRef.current.__interval);
      }

      if (clientRef.current?.__roomInterval) {
        clearInterval(clientRef.current.__roomInterval);
      }

      if (localTracks.current.audio) {
        localTracks.current.audio.stop?.();
        localTracks.current.audio.close();
      }

      if (localTracks.current.video) {
        localTracks.current.video.stop?.();
        localTracks.current.video.close();
      }

      await clientRef.current?.leave();

      const grid = document.getElementById("video-grid");
      if (grid) {
        grid.className = "video-grid grid-1";
        grid.innerHTML = `<div class="host-ended-msg">You ended the room</div>`;
      }

      setTimeout(() => {
        window.location.href = "/social/rooms";
      }, 800);
    } catch (err) {
      console.error("Stop room error:", err);
      window.location.href = "/social/rooms";
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (loading || !room) {
    return (
      <div className="room-loading">
        <div className="loading-spinner" />
        <p>Joining room...</p>
      </div>
    );
  }

  return (
    <>
      <div className="room-layout">
        <div className="room-main">
          {/* Header */}
          <header className="room-header">
            <div className="room-header-left">
              <div className="room-live-badge">
                <span className="live-dot" />
                LIVE
              </div>
              <div className="room-title-group">
                <h1 className="room-title">
                  {room.title}
                  {is_a_host && <span className="host-crown">👑</span>}
                </h1>
                {room.subtitle && <p className="room-subtitle">{room.subtitle}</p>}
              </div>
            </div>
            <div className="room-header-right">
              <div className="participant-count">
                <svg
                  width="16"
                  height="16"
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
                {room.participants.length}
              </div>
              <ReportButton
                moduleType="room"
                targetId={id}
                contentPreview={room.title}
                isOwner={is_a_host}
                size="md"
                variant="icon"
                style={{
                  padding: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  marginLeft: "10px",
                  marginRight: "10px",
                }}
              />
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          {/* Video */}
          <div className="video-area">
            <RoomMediaSection
              is_admin={is_a_host}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => goToPage(currentPage - 1)}
              onNext={() => goToPage(currentPage + 1)}
              roomType={roomType}
            />
          </div>

          {/* Controls */}
          <div className="controls-area">
            <RoomActionBar
              room={room}
              clientRef={clientRef}
              localTracks={localTracks}
              is_admin={is_a_host}
              roomId={id}
              refresh={fetchRoom}
              onEndRoom={handleEndRoom}
              roomType={roomType}
              inviteLink={inviteLink}
            />
            <UserActionBar
              clientRef={clientRef}
              localTracks={localTracks}
              is_speaker={isSpeaker && !is_a_host}
              roomId={id}
              roomType={roomType}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className={`room-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          <RoomInfoPanel
            room={room}
            roomId={id}
            refresh={fetchRoom}
            is_admin={is_a_host}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>

        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      </div>
      <div className="h-10 md:h-0" />
    </>
  );
}

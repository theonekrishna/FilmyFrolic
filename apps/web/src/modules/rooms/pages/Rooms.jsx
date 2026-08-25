import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import TopBar from "../../../layout/TopBar";
import { Plus, PanelRight, X, Search } from "lucide-react";
import LiveRoomCard from "../components/LiveRoomCard";
import ScheduledRoomCard from "../components/ScheduledRoomCard";
import WatchPartyCard from "../components/WatchPartyCard";
import HostRoomModel from "../components/HostRoomModel";
import VoiceRoomCard from "../components/VoiceRoomCard";
import DiscussionCard from "../components/DiscussionCard";
import VideoRoomCard from "../components/VideoRoomCard";
import AuthPromptModal from "../components/Authpromptmoda";
import { publicAxios, privateAxios } from "../../../utils/AxiosInstance";

const ACCENT = "#3b82f6";
const RED = "#e84545";

// ─────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────
const isLive = (r) => r.status === "live";
const isScheduled = (r) =>
  r.scheduled_time && r.status !== "live" && r.status !== "ended" && r.status !== "stopped";
const isEnded = (r) => r.status === "ended" || r.status === "stopped";

function sortByStatus(arr) {
  const order = (r) => (isLive(r) ? 0 : isScheduled(r) ? 1 : 2);
  return [...arr].sort((a, b) => order(a) - order(b));
}

function roomMatchesQuery(raw, query) {
  if (!query || query.trim() === "") return true;
  const q = query.toLowerCase().trim();
  const fields = [
    raw.title,
    raw.subtitle,
    raw.media_title,
    raw.room_type,
    raw.status,
    raw.privacy,
    raw.owner_details?.display_name,
    raw.owner_details?.username,
    raw.owner_details?.name,
  ];
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

// ─────────────────────────────────────────────
// MEMOIZED STATUS BADGE
// ─────────────────────────────────────────────
const StatusBadge = memo(function StatusBadge({ room }) {
  if (isLive(room)) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
        style={{
          background: "rgba(232,69,69,0.15)",
          border: "1px solid rgba(232,69,69,0.35)",
          color: "#fc8181",
        }}
      >
        <span
          className="w-[5px] h-[5px] rounded-full bg-[#e84545]"
          style={{ animation: "pulse 1.5s infinite" }}
        />
        LIVE
      </div>
    );
  }
  if (isScheduled(room)) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
        style={{
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.35)",
          color: "#93c5fd",
        }}
      >
        📅 UPCOMING
      </div>
    );
  }
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(240,240,248,0.35)",
      }}
    >
      ⏹ ENDED
    </div>
  );
});

// ─────────────────────────────────────────────
// MEMOIZED ENDED CARD
// ─────────────────────────────────────────────
const EndedCard = memo(function EndedCard({ room }) {
  return (
    <div className="bg-[#12121e] border border-white/5 rounded-[14px] overflow-hidden opacity-60">
      <div className="relative h-[100px] bg-gradient-to-br from-[#1a1a2e] to-[#0d0d18] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <div className="text-2xl mb-1">⏹</div>
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase">
            Room Ended
          </p>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-white/40 line-clamp-1">
            {room.topic || room.title}
          </p>
          {room.movie && <p className="text-[11px] text-white/25 mt-0.5">{room.movie}</p>}
        </div>
        <div
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            color: "rgba(240,240,248,0.25)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ENDED
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
// MEMOIZED SCHEDULED BLOCKER
// ─────────────────────────────────────────────
const ScheduledBlocker = memo(function ScheduledBlocker({ room }) {
  const scheduledAt = useMemo(
    () =>
      room.scheduled_time
        ? new Date(room.scheduled_time).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    [room.scheduled_time]
  );

  return (
    <div className="bg-[#12121e] border border-[rgba(59,130,246,0.2)] rounded-[14px] overflow-hidden">
      <div className="relative h-[120px] bg-gradient-to-br from-[#0d1a2e] to-[#12121e] flex items-center justify-center">
        <div className="text-center z-10 relative px-4">
          <div className="text-2xl mb-1.5">📅</div>
          <p className="text-[11px] font-bold tracking-widest text-[#93c5fd] uppercase">
            Scheduled Room
          </p>
          {scheduledAt && <p className="text-[11px] text-[#60a5fa]/70 mt-1">{scheduledAt}</p>}
        </div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "linear-gradient(135deg, #3b82f6, transparent)",
          }}
        />
      </div>
      <div className="px-4 py-3">
        <p className="text-[13px] font-semibold text-white/70 line-clamp-1 mb-0.5">
          {room.topic || room.title}
        </p>
        {room.movie && <p className="text-[11px] text-white/35 mb-2">{room.movie}</p>}
        <div
          className="w-full rounded-[9px] py-[9px] text-[12px] font-bold text-center"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#93c5fd",
          }}
        >
          Opens {scheduledAt || "soon"}
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
// MEMOIZED SMART CARD
// ─────────────────────────────────────────────
const SmartCard = memo(function SmartCard({ room, cardType, rawRoom }) {
  if (isEnded(rawRoom)) return <EndedCard room={room} />;
  if (isScheduled(rawRoom) && cardType !== "scheduled") return <ScheduledBlocker room={room} />;

  switch (cardType) {
    case "live":
      return <LiveRoomCard room={room} />;
    case "scheduled":
      return <ScheduledRoomCard room={room} />;
    case "watchparty":
      return <WatchPartyCard party={room} />;
    case "voice":
      return <VoiceRoomCard room={room} />;
    case "discussion":
      return <DiscussionCard room={room} />;
    case "video_room":
      return <VideoRoomCard room={room} />;
    default:
      return <LiveRoomCard room={room} />;
  }
});

// ─────────────────────────────────────────────
// MAPPER (pure function — no memo needed)
// ─────────────────────────────────────────────
function mapRawToCards(data) {
  const ownerGradient = (r) =>
    r.owner_details?.avatar_color || "linear-gradient(135deg,#f5c518,#e84545)";
  const ownerInitials = (r) => r.owner_details?.display_name?.slice(0, 2).toUpperCase() || "ME";
  const ownerName = (r) => r.owner_details?.display_name || "You";

  const live = data
    .filter((r) => r.status === "live")
    .map((r) => ({
      id: r.id,
      topic: r.title,
      description: r.subtitle,
      backdrop: r.image_url,
      viewers: r.participant_count || 0,
      hostAvatars: [{ initials: ownerInitials(r), gradient: ownerGradient(r) }],
      extraHosts: 0,
      movie: r.media_title,
      tags: [r.room_type],
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  const scheduled = data
    .filter((r) => r.scheduled_time)
    .map((r) => ({
      id: r.id,
      title: r.title,
      movie: r.media_title,
      backdrop: r.image_url,
      scheduledAt: new Date(r.scheduled_time).toLocaleString(),
      rsvpCount: r.participant_count || 0,
      host: {
        initials: ownerInitials(r),
        name: ownerName(r),
        gradient: ownerGradient(r),
      },
      tags: [r.room_type],
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  const watchparty = data
    .filter((r) => r.room_type === "watch_party")
    .map((r) => ({
      id: r.id,
      title: r.title,
      movie: r.media_title,
      backdrop: r.image_url,
      platform: "Custom",
      platformColor: "#e84545",
      viewers: r.participant_count || 0,
      syncStatus: r.status === "live" ? "Live" : "Scheduled",
      host: {
        initials: ownerInitials(r),
        name: ownerName(r),
        gradient: ownerGradient(r),
      },
      progress: 50,
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  const voice = data
    .filter((r) => r.room_type === "voice_room")
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.subtitle,
      backdrop: r.image_url,
      speakers: r.participant_count || 0,
      tags: ["Voice"],
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  const discussion = data
    .filter((r) => r.room_type === "discussion")
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.subtitle,
      participants: r.participant_count || 0,
      tags: ["Discussion"],
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  const video_room = data
    .filter((r) => r.room_type === "video_room")
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.subtitle,
      backdrop: r.image_url,
      participants: r.participant_count || 0,
      tags: ["Video"],
      isMyRoom: r.is_my_room ?? false,
      _raw: r,
    }));

  return { live, scheduled, watchparty, voice, discussion, video_room };
}

// ─────────────────────────────────────────────
// MEMOIZED SECTION LABEL
// ─────────────────────────────────────────────
const SectionLabel = memo(function SectionLabel({ emoji, label, count, color }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <span className="text-[11px] font-bold tracking-[1.5px] uppercase" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-[1px]" style={{ background: `${color}25` }} />
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{
          background: `${color}15`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        {count}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────
// MEMOIZED ROOM LIST
// ─────────────────────────────────────────────
const RoomList = memo(function RoomList({ rooms, cardType, searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery) return rooms;
    return rooms.filter((r) => roomMatchesQuery(r._raw || {}, searchQuery));
  }, [rooms, searchQuery]);

  const { liveRooms, upcomingRooms, endedRooms } = useMemo(() => {
    const sorted = sortByStatus(filtered);
    return {
      liveRooms: sorted.filter((r) => isLive(r._raw)),
      upcomingRooms: sorted.filter((r) => isScheduled(r._raw)),
      endedRooms: sorted.filter((r) => isEnded(r._raw)),
    };
  }, [filtered]);

  if (!filtered || filtered.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-[14px] text-white/40 font-medium">
            No {cardType.replace("_", " ")} rooms match &ldquo;{searchQuery}
            &rdquo;
          </p>
          <p className="text-[12px] text-white/25">
            Try a different keyword or switch to another tab
          </p>
        </div>
      );
    }
    return <EmptyState label={`No ${cardType.replace("_", " ")} rooms`} />;
  }

  if (cardType === "scheduled") {
    const upcomingScheduled = filtered.filter((r) => !isEnded(r._raw));
    const endedScheduled = filtered.filter((r) => isEnded(r._raw));

    return (
      <div className="flex flex-col gap-1">
        {searchQuery && (
          <p className="text-[12px] text-white/30 mb-3">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
            <span style={{ color: ACCENT }}>&ldquo;{searchQuery}&rdquo;</span>
          </p>
        )}
        {upcomingScheduled.length > 0 && (
          <div className="mb-2">
            <SectionLabel
              emoji="📅"
              label="Upcoming"
              count={upcomingScheduled.length}
              color="#3b82f6"
            />
            <div className="flex flex-col gap-3">
              {upcomingScheduled.map((room) => (
                <SmartCard
                  key={room.id}
                  room={room}
                  cardType={cardType}
                  rawRoom={room._raw || {}}
                />
              ))}
            </div>
          </div>
        )}
        {endedScheduled.length > 0 && (
          <div className="mb-2">
            <SectionLabel
              emoji="⏹"
              label="Ended"
              count={endedScheduled.length}
              color="rgba(240,240,248,0.25)"
            />
            <div className="flex flex-col gap-3">
              {endedScheduled.map((room) => (
                <SmartCard
                  key={room.id}
                  room={room}
                  cardType={cardType}
                  rawRoom={room._raw || {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {searchQuery && (
        <p className="text-[12px] text-white/30 mb-3">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
          <span style={{ color: ACCENT }}>&ldquo;{searchQuery}&rdquo;</span>
        </p>
      )}
      {liveRooms.length > 0 && (
        <div className="mb-2">
          <SectionLabel emoji="🔴" label="Live Now" count={liveRooms.length} color="#e84545" />
          <div className="grid gap-3">
            {liveRooms.map((room) => (
              <SmartCard key={room.id} room={room} cardType={cardType} rawRoom={room._raw || {}} />
            ))}
          </div>
        </div>
      )}
      {upcomingRooms.length > 0 && (
        <div className="mb-2">
          <SectionLabel emoji="📅" label="Upcoming" count={upcomingRooms.length} color="#3b82f6" />
          <div className="grid gap-3">
            {upcomingRooms.map((room) => (
              <SmartCard key={room.id} room={room} cardType={cardType} rawRoom={room._raw || {}} />
            ))}
          </div>
        </div>
      )}
      {endedRooms.length > 0 && (
        <div className="mb-2">
          <SectionLabel
            emoji="⏹"
            label="Ended"
            count={endedRooms.length}
            color="rgba(240,240,248,0.25)"
          />
          <div className="grid gap-3">
            {endedRooms.map((room) => (
              <SmartCard key={room.id} room={room} cardType={cardType} rawRoom={room._raw || {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────
// Tab badge count (memoized in parent via useMemo)
// ─────────────────────────────────────────────
function tabMatchCount(rooms, searchQuery) {
  if (!searchQuery) return rooms.length;
  return rooms.filter((r) => roomMatchesQuery(r._raw || {}, searchQuery)).length;
}

// ─────────────────────────────────────────────
// EMPTY STATE (memoized)
// ─────────────────────────────────────────────
const EmptyState = memo(function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-2">
      <span className="text-4xl">🪹</span>
      <p className="text-sm">{label}</p>
    </div>
  );
});

// ─────────────────────────────────────────────
// MAIN ROOMS COMPONENT
// ─────────────────────────────────────────────
export default function Rooms() {
  const [activeTab, setActiveTab] = useState("live");
  const [hostModalOpen, setHostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [sidebarMounted, setSidebarMounted] = useState(false);

  // ── Search: debounced query ────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // ── Raw data ───────────────────────────────────────────────────────────────
  const [allRoomsRaw, setAllRoomsRaw] = useState([]);
  const [myRoomsRaw, setMyRoomsRaw] = useState([]);

  // ── Auth prompt ────────────────────────────────────────────────────────────
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });
  const isLoggedIn = useMemo(() => !!localStorage.getItem("accessToken"), []);

  const requireAuth = useCallback(
    (message, action) => {
      if (!isLoggedIn) {
        setAuthPrompt({ open: true, message });
        return false;
      }
      action?.();
      return true;
    },
    [isLoggedIn]
  );

  // ── Mapped cards (memoized from raw data) ─────────────────────────────────
  const myRoomsCards = useMemo(() => mapRawToCards(myRoomsRaw), [myRoomsRaw]);
  const allRoomsCards = useMemo(() => mapRawToCards(allRoomsRaw), [allRoomsRaw]);

  const [category, setCategory] = useState("watchparty");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ── Sidebar open/close ────────────────────────────────────────────────────
  const openSidebar = useCallback(() => {
    setSidebarMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setRightSidebarOpen(true));
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setRightSidebarOpen(false);
    setTimeout(() => setSidebarMounted(false), 350);
  }, []);

  // ── Debounced search input ─────────────────────────────────────────────────
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 200);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchRooms();
    return () => clearTimeout(debounceRef.current);
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setAllRoomsRaw([]);
      setMyRoomsRaw([]);
      const allRes = await privateAxios.get("/api/rooms");
      setAllRoomsRaw(allRes.data.data || []);

      const myRes = await privateAxios.get("/api/rooms/my_rooms");

      console.log("all rooms raw", allRes.data.data || []);
      setMyRoomsRaw(myRes.data.data || []);
    } catch (err) {
      console.error("Fetch rooms error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cards = showMyRooms ? myRoomsCards : allRoomsCards;
  const getRooms = useCallback((type) => cards[type] || [], [cards]);

  // Clear search only on toggle
  const handleToggleMyRooms = useCallback(() => {
    setShowMyRooms((prev) => !prev);
    setSearchInput("");
    setSearchQuery("");
  }, []);

  // ── Per-tab match counts (memoized) ───────────────────────────────────────
  const matchCounts = useMemo(() => {
    if (!searchQuery) return null;
    return {
      live: tabMatchCount(getRooms("live"), searchQuery),
      scheduled: tabMatchCount(getRooms("scheduled"), searchQuery),
      watchparty: tabMatchCount(getRooms("watchparty"), searchQuery),
      voice: tabMatchCount(getRooms("voice"), searchQuery),
      discussion: tabMatchCount(getRooms("discussion"), searchQuery),
      video_room: tabMatchCount(getRooms("video_room"), searchQuery),
    };
  }, [searchQuery, getRooms]);

  // ── Sidebar stats (memoized) ───────────────────────────────────────────────
  const sidebarStats = useMemo(() => {
    if (showMyRooms) {
      return [
        { label: "My Live Rooms", value: myRoomsCards.live.length },
        { label: "My Watch Parties", value: myRoomsCards.watchparty.length },
        { label: "My Scheduled", value: myRoomsCards.scheduled.length },
      ];
    }
    return [
      { label: "Active Rooms", value: allRoomsCards.live.length },
      { label: "Total Viewers", value: "—" },
      { label: "Watch Parties", value: allRoomsCards.watchparty.length },
    ];
  }, [showMyRooms, myRoomsCards, allRoomsCards]);

  // ── Sidebar content (memoized component) ──────────────────────────────────
  const SidebarContent = useCallback(
    () => (
      <>
        <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-[18px]">
          <div className="flex items-center gap-[7px] mb-[14px]">
            <div
              className="w-[7px] h-[7px] rounded-full bg-[#e84545]"
              style={{
                animation: "pulse 1.5s infinite",
                boxShadow: "0 0 6px #e84545",
              }}
            />
            <h4 className="font-['Bebas_Neue',cursive] text-[17px] tracking-[1.5px] text-[#f0f0f8] m-0">
              {showMyRooms ? "My Stats" : "Live Right Now"}
            </h4>
          </div>
          {sidebarStats.map((stat) => (
            <div
              key={stat.label}
              className="flex justify-between items-center py-[8px] border-b border-[rgba(255,255,255,0.05)]"
            >
              <span className="text-[12px] text-[rgba(240,240,248,0.4)]">{stat.label}</span>
              <span className="font-['Bebas_Neue',cursive] text-[18px] text-[#e84545]">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="rounded-[14px] p-[18px]"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,92,252,0.06))",
            border: "1px solid #3b82f625",
          }}
        >
          <div className="text-[28px] mb-[10px]">🎙️</div>
          <h4 className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1.5px] text-[#f0f0f8] mb-[8px]">
            Host Your First Room
          </h4>
          <p className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.45)] mb-[14px]">
            Invite the community for a watch-along, debate, or live session.
          </p>
          <button
            onClick={() =>
              requireAuth(
                "Sign in to host a room and invite the community for a watch-along, debate, or live session!",
                () => {
                  setHostModalOpen(true);
                  closeSidebar();
                }
              )
            }
            className="w-full rounded-[8px] py-[10px] text-white font-semibold text-[13px]"
            style={{ background: "#3b82f6", boxShadow: "0 4px 16px #3b82f640" }}
          >
            Start a Room
          </button>
        </div>
      </>
    ),
    [showMyRooms, sidebarStats, requireAuth, closeSidebar]
  );

  return (
    <div className="min-h-screen bg-[#080810]">
      <style>{`
        @keyframes sidebarIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .sidebar-panel {
          transition: transform 320ms cubic-bezier(0.32, 0, 0.18, 1),
                      opacity  320ms cubic-bezier(0.32, 0, 0.18, 1);
        }
        .sidebar-overlay { transition: opacity 320ms ease; }
        .search-bar-input::placeholder { color: rgba(240,240,248,0.28); }
        .search-bar-input:focus { outline: none; }
        .tab-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 16px; padding: 0 4px; border-radius: 999px;
          font-size: 9px; font-weight: 800; margin-left: 5px; line-height: 1;
        }
      `}</style>

      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />

      {hostModalOpen && (
        <HostRoomModel
          onClose={() => {
            setHostModalOpen(false);
            fetchRooms();
          }}
        />
      )}

      <TopBar title="Live Rooms" subtitle="Watch together, react together" />

      {loading && (
        <div className="fixed inset-0 z-[30] bg-[#080810]/80 backdrop-blur-[4px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[40px] h-[40px] border-4 border-white/10 border-t-[#3b82f6] rounded-full animate-spin" />
            <p className="text-white/60 text-[13px] tracking-wide">Loading Rooms...</p>
          </div>
        </div>
      )}

      {sidebarMounted && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeSidebar} />
          <div
            className="sidebar-panel absolute top-0 right-0 h-full w-[290px] bg-[#0d0d18] border-l border-white/10 flex flex-col gap-3 p-4 overflow-y-auto z-10"
            style={{
              transform: rightSidebarOpen ? "translateX(0)" : "translateX(100%)",
              opacity: rightSidebarOpen ? 1 : 0,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Bebas_Neue',cursive] text-[18px] tracking-[2px] text-[#f0f0f8]">
                Room Info
              </span>
              <button
                onClick={closeSidebar}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <X size={15} color="rgba(240,240,248,0.6)" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 pt-6 pb-16 px-4 sm:px-6 lg:px-[28px]">
        <div className="flex-1 min-w-0">
          {/* ── Rooms Control Sub-Bar ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-[#12121e] border border-white/10 rounded-2xl p-3 px-4">
            {/* Toggle My Rooms vs All Rooms */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMyRooms(false)}
                className={`px-4 py-1.5 rounded-xl font-['Outfit'] text-[13px] font-medium transition-all ${
                  !showMyRooms
                    ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-[#f0f0f8]/60 hover:text-white hover:bg-white/5"
                }`}
              >
                All Rooms
              </button>
              <button
                onClick={() => setShowMyRooms(true)}
                className={`px-4 py-1.5 rounded-xl font-['Outfit'] text-[13px] font-medium transition-all ${
                  showMyRooms
                    ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20 font-semibold"
                    : "text-[#f0f0f8]/60 hover:text-white hover:bg-white/5"
                }`}
              >
                My Rooms ({myRoomsRaw.length})
              </button>
            </div>

            {/* Right actions: Stats toggle & Host a Room */}
            <div className="flex items-center gap-2">
              <button
                onClick={openSidebar}
                className="lg:hidden flex items-center gap-2 rounded-xl py-2 px-3 text-[13px] font-semibold transition-all active:scale-95 bg-white/5 border border-white/10 text-white/70"
              >
                <PanelRight size={15} />
                <span>Stats</span>
              </button>

              <button
                onClick={() =>
                  requireAuth(
                    "Sign in to host a room and invite the community for a watch-along, debate, or live session!",
                    () => setHostModalOpen(true)
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: RED }}
              >
                <Plus size={15} />
                <span>Host a Room</span>
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex mb-[28px] bg-[#12121e] p-[4px] rounded-[12px] relative">
            {/* Live tab */}
            <button
              onClick={() => setActiveTab("live")}
              className={`flex-1 py-[10px] text-white text-sm rounded-[10px] transition-all flex items-center justify-center gap-1 ${activeTab === "live" ? "bg-white/10" : ""}`}
            >
              🔴 Live
              {matchCounts && (
                <span
                  className="tab-badge"
                  style={{
                    background:
                      matchCounts.live > 0 ? "rgba(232,69,69,0.25)" : "rgba(255,255,255,0.06)",
                    color: matchCounts.live > 0 ? "#fc8181" : "rgba(240,240,248,0.25)",
                  }}
                >
                  {matchCounts.live}
                </span>
              )}
            </button>

            {/* Scheduled tab */}
            <button
              onClick={() => setActiveTab("scheduled")}
              className={`flex-1 py-[10px] text-white text-sm rounded-[10px] transition-all flex items-center justify-center gap-1 ${activeTab === "scheduled" ? "bg-white/10" : ""}`}
            >
              📅 Scheduled
              {matchCounts && (
                <span
                  className="tab-badge"
                  style={{
                    background:
                      matchCounts.scheduled > 0
                        ? "rgba(59,130,246,0.25)"
                        : "rgba(255,255,255,0.06)",
                    color: matchCounts.scheduled > 0 ? "#93c5fd" : "rgba(240,240,248,0.25)",
                  }}
                >
                  {matchCounts.scheduled}
                </span>
              )}
            </button>

            {/* Categories dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-full py-[10px] text-white text-sm flex items-center justify-center gap-2 rounded-[10px] transition-all ${activeTab === "category" ? "bg-white/10" : ""}`}
              >
                Categories ▼
                {matchCounts &&
                  (() => {
                    const catTotal =
                      matchCounts.watchparty +
                      matchCounts.voice +
                      matchCounts.discussion +
                      matchCounts.video_room;
                    return (
                      <span
                        className="tab-badge"
                        style={{
                          background:
                            catTotal > 0 ? "rgba(245,197,24,0.2)" : "rgba(255,255,255,0.06)",
                          color: catTotal > 0 ? "#f5c518" : "rgba(240,240,248,0.25)",
                        }}
                      >
                        {catTotal}
                      </span>
                    );
                  })()}
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-[220px] bg-[#12121e] border border-white/10 rounded-[12px] overflow-hidden z-50 shadow-lg">
                  {[
                    {
                      key: "watchparty",
                      label: "🎬 Watch Party",
                      countKey: "watchparty",
                    },
                    { key: "voice", label: "🎙️ Voice Room", countKey: "voice" },
                    {
                      key: "discussion",
                      label: "💬 Discussion",
                      countKey: "discussion",
                    },
                    {
                      key: "video_room",
                      label: "🎥 Video Room",
                      countKey: "video_room",
                    },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setCategory(item.key);
                        setActiveTab("category");
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 sm:py-2.5 text-white text-sm hover:bg-white/5 active:bg-white/10 transition"
                    >
                      <span className="text-[16px]">{item.label.split(" ")[0]}</span>
                      <span className="truncate flex-1 text-left">
                        {item.label.replace(item.label.split(" ")[0] + " ", "")}
                      </span>
                      {matchCounts && (
                        <span
                          className="tab-badge ml-auto"
                          style={{
                            background:
                              matchCounts[item.countKey] > 0
                                ? "rgba(245,197,24,0.18)"
                                : "rgba(255,255,255,0.05)",
                            color:
                              matchCounts[item.countKey] > 0 ? "#f5c518" : "rgba(240,240,248,0.2)",
                          }}
                        >
                          {matchCounts[item.countKey]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Tab content ── */}
          {activeTab === "live" && (
            <RoomList rooms={getRooms("live")} cardType="live" searchQuery={searchQuery} />
          )}
          {activeTab === "scheduled" && (
            <RoomList
              rooms={getRooms("scheduled")}
              cardType="scheduled"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "category" && category === "watchparty" && (
            <RoomList
              rooms={getRooms("watchparty")}
              cardType="watchparty"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "category" && category === "voice" && (
            <RoomList rooms={getRooms("voice")} cardType="voice" searchQuery={searchQuery} />
          )}
          {activeTab === "category" && category === "discussion" && (
            <RoomList
              rooms={getRooms("discussion")}
              cardType="discussion"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "category" && category === "video_room" && (
            <RoomList
              rooms={getRooms("video_room")}
              cardType="video_room"
              searchQuery={searchQuery}
            />
          )}
        </div>

        <div className="hidden lg:flex w-[248px] flex-shrink-0 flex-col gap-[14px]">
          <SidebarContent />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Users, ChevronRight, Loader2, Wifi, Video, Mic, Lock, Play } from "lucide-react";
import { getAllRooms, joinRoom } from "../services/feedService";

export default function RoomsTab({ toast }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joiningRoomId, setJoiningRoomId] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllRooms();
      // API returns { message, count, data } or just array
      const roomsData = result?.data || result || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError(err.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinRoom = async (room) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const privacy = room.privacy || "public";

    // Info toast for invite-only rooms
    if (privacy === "invite_only") {
      toast.info("Invite Only", "You need an invite code to join this room.");
      return;
    }

    // Warning toast for followers-only rooms
    if (privacy === "friends_only" || privacy === "friends_and_followers") {
      const isFollowing = room.is_following_owner || room.owner?.is_following;
      if (isFollowing === false) {
        toast.warning("Followers Only", "Follow the host to join this room!");
        return;
      }
    }

    setJoiningRoomId(room.id);
    try {
      const result = await joinRoom(room.id);
      toast.success("Joined!", "Room joined successfully");
      navigate(`/social/rooms/${room.id}`);
    } catch (err) {
      console.error("Failed to join room:", err);
      const errorMsg =
        err.message ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to join room";
      // Determine appropriate title and toast type based on error message
      const lowerMsg = errorMsg.toLowerCase();
      let title = "Join Failed";
      let isRestriction = false;
      if (lowerMsg.includes("follower")) {
        title = "Followers Only";
        isRestriction = true;
      } else if (lowerMsg.includes("invite")) {
        title = "Invite Required";
        isRestriction = true;
      }
      // Use warning for restrictions, error for actual errors
      if (isRestriction) {
        toast.warning(title, errorMsg);
      } else {
        toast.error(title, errorMsg);
      }
    } finally {
      setJoiningRoomId(null);
    }
  };

  // Generate avatar color based on string
  const getAvatarColor = (str) => {
    const colors = [
      "linear-gradient(135deg, #f5c518, #e84545)",
      "linear-gradient(135deg, #3b82f6, #9b59b6)",
      "linear-gradient(135deg, #2ecc71, #27ae60)",
      "linear-gradient(135deg, #e74c3c, #c0392b)",
      "linear-gradient(135deg, #9b59b6, #8e44ad)",
      "linear-gradient(135deg, #1abc9c, #16a085)",
    ];
    let hash = 0;
    for (let i = 0; i < str?.length || 0; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.slice(0, 2).toUpperCase();
  };

  // Format participant count (e.g., 2400 -> 2.4k)
  const formatCount = (count) => {
    if (!count && count !== 0) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Get room type icon and label
  const getRoomTypeInfo = (roomType) => {
    if (roomType?.includes("video")) return { icon: Video, label: "Video", color: "#3b82f6" };
    if (roomType?.includes("audio")) return { icon: Mic, label: "Audio", color: "#8b5cf6" };
    return { icon: Radio, label: "Live", color: "#e84545" };
  };

  // Generate avatar from owner_id
  const getOwnerAvatar = (ownerId) => {
    if (!ownerId) return { initials: "?", color: "linear-gradient(135deg, #6b7280, #4b5563)" };
    return {
      initials: ownerId.slice(0, 2).toUpperCase(),
      color: getAvatarColor(ownerId),
    };
  };

  // Format capacity: "5/50"
  const formatCapacity = (current, max) => {
    const currentVal = current || 0;
    const maxVal = max || 50;
    return `${currentVal}/${maxVal}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 size={32} className="text-[#3b82f6] animate-spin mb-4" />
        <span className="font-['Outfit'] text-sm text-[#f0f0f8]/50">Loading rooms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-[#e84545]/10 flex items-center justify-center mb-4">
          <Wifi size={28} className="text-[#e84545]" />
        </div>
        <p className="text-[#e84545] text-sm font-medium mb-3 text-center">{error}</p>
        <button
          onClick={fetchRooms}
          className="px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] rounded-full text-sm font-medium hover:bg-[#3b82f6]/20 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#e84545] animate-pulse" />
          <span className="font-['Outfit'] text-[11px] font-bold text-[#e84545] uppercase tracking-wider">
            Live Now
          </span>
        </div>
        <span className="font-['Outfit'] text-[11px] text-[#f0f0f8]/40">
          {rooms.length} {rooms.length === 1 ? "room" : "rooms"} active
        </span>
      </div>

      {/* Rooms List */}
      <div className="flex flex-col gap-3 p-4">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mb-4">
              <Radio size={28} className="text-[#3b82f6]" />
            </div>
            <p className="font-['Outfit'] text-sm text-[#f0f0f8]/50 text-center">
              No live rooms at the moment.
            </p>
            <p className="font-['Outfit'] text-xs text-[#f0f0f8]/30 text-center mt-1">
              Check back later or create your own!
            </p>
          </div>
        ) : (
          rooms.slice(0, 6).map((room) => {
            const roomInfo = getRoomTypeInfo(room.room_type);
            const RoomIcon = roomInfo.icon;
            const owner = getOwnerAvatar(room.owner_id);

            return (
              <div
                key={room.id}
                className="group relative overflow-hidden rounded-2xl bg-[#0d0d18] border border-white/5 hover:border-[#3b82f6]/40 transition-all hover:shadow-lg hover:shadow-[#3b82f6]/5"
              >
                {/* Top Section with Image/Gradient */}
                <div className="relative h-24">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${roomInfo.color}20, ${roomInfo.color}05)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <RoomIcon size={48} style={{ color: roomInfo.color }} />
                      </div>
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d18] via-[#0d0d18]/60 to-transparent" />

                  {/* Top Row: Live Badge + Privacy + Count */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Live Badge */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#e84545]/90 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="font-['Outfit'] text-[10px] font-bold text-white uppercase">
                          Live
                        </span>
                      </div>
                      {/* Privacy Badge */}
                      {room.privacy !== "public" && room.privacy && (
                        <div
                          className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border"
                          style={{
                            background:
                              room.privacy === "invite_only"
                                ? "rgba(232, 69, 69, 0.2)"
                                : "rgba(245, 197, 24, 0.2)",
                            borderColor:
                              room.privacy === "invite_only"
                                ? "rgba(232, 69, 69, 0.3)"
                                : "rgba(245, 197, 24, 0.3)",
                          }}
                        >
                          <Lock
                            size={10}
                            style={{
                              color: room.privacy === "invite_only" ? "#e84545" : "#f5c518",
                            }}
                          />
                          <span
                            className="font-['Outfit'] text-[10px] font-bold"
                            style={{
                              color: room.privacy === "invite_only" ? "#e84545" : "#f5c518",
                            }}
                          >
                            {room.privacy === "invite_only" ? "Invite Only" : "Followers Only"}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Participant Count */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <Users size={12} className="text-[#f0f0f8]/80" />
                      <span className="font-['Outfit'] text-[11px] font-semibold text-[#f0f0f8]/90">
                        {formatCapacity(room.participant_count, room.max_participants)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative p-4 pt-2">
                  {/* Title & Subtitle */}
                  <div className="mb-3">
                    <h3 className="font-['Outfit'] text-[16px] font-bold text-white mb-1 line-clamp-1">
                      {room.title || "Untitled Room"}
                    </h3>
                    {room.subtitle && (
                      <p className="font-['Outfit'] text-[12px] text-[#f0f0f8]/50 line-clamp-1">
                        {room.subtitle}
                      </p>
                    )}
                    {room.media_title && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Play size={10} className="text-[#3b82f6]" />
                        <span className="font-['Outfit'] text-[11px] text-[#3b82f6]">
                          {room.media_title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Host + Type + Join */}
                  <div className="flex items-center justify-between">
                    {/* Host Info */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: owner.color }}
                        title={`Host: ${room.owner_id?.slice(0, 8) || "Unknown"}`}
                      >
                        {owner.initials}
                      </div>
                      <span className="font-['Outfit'] text-[11px] text-[#f0f0f8]/60">Host</span>
                    </div>

                    {/* Type Tag & Join Button */}
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                        style={{
                          background: `${roomInfo.color}15`,
                          borderColor: `${roomInfo.color}30`,
                          color: roomInfo.color,
                        }}
                      >
                        {roomInfo.label}
                      </span>

                      <button
                        onClick={() => handleJoinRoom(room)}
                        disabled={joiningRoomId === room.id}
                        className="px-5 py-2 rounded-full bg-[#3b82f6] text-white text-[12px] font-bold hover:bg-[#2563eb] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-[#3b82f6]/20"
                      >
                        {joiningRoomId === room.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Play size={14} />
                            Join
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Browse All Button */}
      {rooms.length > 6 && (
        <div className="px-4 pb-6">
          <button
            onClick={() => navigate("/social/rooms")}
            className="w-full py-3.5 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] font-['Outfit'] text-[13px] font-semibold hover:bg-[#3b82f6]/20 hover:border-[#3b82f6]/50 transition-all flex items-center justify-center gap-2 group"
          >
            Browse All Rooms
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

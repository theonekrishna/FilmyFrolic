import { useState, useCallback, useMemo, memo } from "react";
import { Calendar, Users } from "lucide-react";
import { TAG_COLORS } from "../data/rooms";
import { joinRoomAPI } from "../data/roomApi";
import { HostAvatar, FeaturedBadge, featuredCardStyle } from "./Roomhelpers";

const ACCENT = "#3b82f6";

// ── Memoized tag pill — re-renders only if tag string changes ─────────────────
const TagPill = memo(function TagPill({ tag }) {
  return (
    <span
      className="text-[9px] sm:text-[10px] font-semibold rounded-full px-[8px] sm:px-[9px] py-[3px]"
      style={{
        color: TAG_COLORS[tag] || "#f0f0f8",
        background: `${TAG_COLORS[tag] || "#f0f0f8"}15`,
        border: `1px solid ${TAG_COLORS[tag] || "#f0f0f8"}30`,
      }}
    >
      {tag}
    </span>
  );
});

// ── Main component ────────────────────────────────────────────────────────────
function ScheduledRoomCard({ room }) {
  const [rsvpd, setRsvpd] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // useMemo: parse user once, not on every render
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const host = room.host || room.owner || {};
  const owner = room._raw.owner_details || {};

  // useCallback: stable handler reference
  const handleRSVP = useCallback(
    async (e) => {
      e.stopPropagation();
      try {
        await joinRoomAPI({ room_id: room.id, user_id: user._id });
        setRsvpd(true);
      } catch (err) {
        console.error(err);
      }
    },
    [room.id, user._id]
  );

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);
  const handleImgError = useCallback(() => setImgError(true), []);

  // useMemo: attending count derived value
  const attendingCount = useMemo(
    () => (rsvpd ? room.rsvpCount + 1 : room.rsvpCount),
    [rsvpd, room.rsvpCount]
  );

  return (
    <div
      className="flex flex-wrap bg-[#12121e] border border-white/10 rounded-[14px] overflow-hidden cursor-pointer transition-colors duration-200 hover:border-white/20"
      style={featuredCardStyle(room._raw.featured)}
    >
      {/* Backdrop thumb */}
      <div className="w-full sm:w-[140px] flex-shrink-0 relative">
        {/* Skeleton / fallback */}
        {!room.backdrop || imgError || !imgLoaded ? (
          <div className="w-full h-[140px] sm:h-full bg-gradient-to-br from-[#1a1a2e] to-[#12121e] flex items-center justify-center animate-pulse">
            <span className="text-white/20 text-[11px]">📷</span>
          </div>
        ) : null}

        {/* Image — lazy loaded */}
        {room.backdrop && !imgError && (
          <img
            src={room.backdrop}
            alt={room.movie}
            loading="lazy"
            decoding="async"
            className={`w-full h-[140px] sm:h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(8,8,16,0.4)]" />

        {/* Featured badge */}
        {room._raw.featured && <FeaturedBadge />}
      </div>

      {/* Content */}
      <div className="flex-1 px-[16px] sm:px-[20px] py-[14px] sm:py-[18px] min-w-0">
        {/* Title + RSVP */}
        <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3 mb-2">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#f0f0f8] leading-[1.3]">
            {room.title}
          </h3>

          <button
            onClick={handleRSVP}
            className="flex items-center gap-[6px] flex-shrink-0 rounded-[7px] px-[12px] sm:px-[14px] py-[6px] sm:py-[7px] text-[11px] sm:text-[12px] font-bold transition-all duration-200"
            style={{
              background: rsvpd ? "rgba(59,130,246,0.12)" : ACCENT,
              border: `1px solid ${rsvpd ? ACCENT + "50" : ACCENT}`,
              color: rsvpd ? ACCENT : "#fff",
            }}
          >
            <Calendar size={12} />
            {rsvpd ? "RSVP'd" : "RSVP"}
          </button>
        </div>

        {/* Date + Attending */}
        <div className="flex flex-wrap items-center gap-2 mb-[10px]">
          <span
            className="rounded-full px-[8px] sm:px-[10px] py-[3px] text-[10px] sm:text-[11px] font-semibold"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: ACCENT,
            }}
          >
            📅 {room.scheduledAt}
          </span>

          <span className="text-[11px] sm:text-[12px] text-white/40">
            <Users size={11} className="inline mr-1" />
            {attendingCount} attending
          </span>
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2">
          <HostAvatar
            avatarUrl={owner.avatar_url}
            initials={(owner.display_name || owner.username || "?").slice(0, 2).toUpperCase()}
            gradient={owner.avatar_color}
            size={24}
          />
          <span className="text-[11px] sm:text-[12px] text-white/50">
            Hosted by {owner.display_name}
          </span>
        </div>

        {/* Tags */}
        <div className="flex gap-[6px] mt-[10px] flex-wrap">
          {room.tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ScheduledRoomCard);

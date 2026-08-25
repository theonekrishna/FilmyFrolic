import { useEffect, useRef, useCallback, memo } from "react";

/**
 * RoomMediaSection
 * ─ Renders the #video-grid container (Agora tiles injected by RoomDetails)
 * ─ After each render, decorates every .video-slot with:
 *     • a name-tag overlay (bottom-left)
 *     • a mic-off badge (top-right, when applicable)
 * ─ Exposes pagination arrows + page dots
 * ─ Adds a .speaking class to the slot whose audio level is highest
 *
 * Optimizations added:
 *   • memo          — skips re-render when props are unchanged
 *   • useCallback   — stable decorateSlots reference for MutationObserver
 *   • PageDots      — memoized sub-component, avoids re-rendering dot list
 *
 * Props:
 *   is_admin       – boolean
 *   currentPage    – number
 *   totalPages     – number
 *   onPrev / onNext – callbacks
 *   roomType       – "video_room" | "voice_room"
 *   participants   – array from room.participants (for name + mic status)
 */

// ── Memoized page dots — only re-renders when totalPages/currentPage change ──
const PageDots = memo(function PageDots({ totalPages, currentPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="grid-page-dots">
      {Array.from({ length: totalPages }).map((_, i) => (
        <span key={i} className={`grid-page-dot ${i === currentPage ? "active" : ""}`} />
      ))}
    </div>
  );
});

// ── Memoized nav arrow — stable, no internal state ───────────────────────────
const NavArrow = memo(function NavArrow({ direction, onClick }) {
  const isPrev = direction === "prev";
  return (
    <button
      className={`grid-nav grid-nav--${isPrev ? "prev" : "next"}`}
      onClick={onClick}
      aria-label={isPrev ? "Previous page" : "Next page"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points={isPrev ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
      </svg>
    </button>
  );
});

function RoomMediaSection({
  is_admin,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  roomType = "video_room",
  participants = [],
}) {
  const showPrev = currentPage > 0;
  const showNext = currentPage < totalPages - 1;
  const decorateTimerRef = useRef(null);

  // useCallback: stable reference so MutationObserver closure doesn't capture
  // a stale copy of `participants`
  const decorateSlots = useCallback(() => {
    const grid = document.getElementById("video-grid");
    if (!grid) return;

    Array.from(grid.querySelectorAll(".video-slot")).forEach((slot) => {
      if (slot.classList.contains("video-slot--others")) return;

      const uid = slot.id?.replace("slot-", "");
      const participant = uid
        ? participants.find(
            (p) => String(p.agora_uid) === String(uid) || String(p.uid) === String(uid)
          )
        : null;

      // ── Name tag ──────────────────────────────────────────────────────────
      if (!slot.querySelector(".slot-name-tag")) {
        const tag = document.createElement("div");
        tag.className = "slot-name-tag";
        const avatarName = slot.querySelector(".avatar-name");
        tag.textContent = participant?.display_name || avatarName?.textContent || `User ${uid}`;
        slot.appendChild(tag);
      } else if (participant?.display_name) {
        slot.querySelector(".slot-name-tag").textContent = participant.display_name;
      }

      // ── Mic-off badge ─────────────────────────────────────────────────────
      const existingBadge = slot.querySelector(".slot-mic-badge");
      const micIsOff = participant && participant.is_mic_on === false;

      if (micIsOff && !existingBadge) {
        const badge = document.createElement("div");
        badge.className = "slot-mic-badge";
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12
                     M15 9.34V4a3 3 0 0 0-5.94-.6"/>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2
                     m14 0v2a7 7 0 0 1-.11 1.23"/>
          </svg>`;
        slot.appendChild(badge);
      } else if (!micIsOff && existingBadge) {
        existingBadge.remove();
      }
    });
  }, [participants]); // re-create only when participants array changes

  // Re-decorate whenever participants list or page changes
  useEffect(() => {
    decorateTimerRef.current = setTimeout(decorateSlots, 120);
    return () => clearTimeout(decorateTimerRef.current);
  }, [participants, currentPage, decorateSlots]);

  // MutationObserver so new slots get decorated immediately
  useEffect(() => {
    const grid = document.getElementById("video-grid");
    if (!grid) return;

    const obs = new MutationObserver(() => {
      clearTimeout(decorateTimerRef.current);
      decorateTimerRef.current = setTimeout(decorateSlots, 80);
    });
    obs.observe(grid, { childList: true, subtree: false });
    return () => obs.disconnect();
  }, [decorateSlots]); // stable because decorateSlots is memoized

  return (
    <div className="media-section">
      <div className="video-grid-wrapper">
        {/* Agora tiles are injected here by RoomDetails */}
        <div id="video-grid" className="video-grid grid-1" />

        {/* Pagination arrows */}
        {showPrev && <NavArrow direction="prev" onClick={onPrev} />}
        {showNext && <NavArrow direction="next" onClick={onNext} />}

        {/* Page dots — memoized */}
        <PageDots totalPages={totalPages} currentPage={currentPage} />

        {/* Badges */}
        <div className="stream-badge stream-badge--live">
          <span className="live-dot" />
          LIVE
        </div>

        {roomType === "video_room" && (
          <div className="stream-badge stream-badge--label">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Stream
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(RoomMediaSection);

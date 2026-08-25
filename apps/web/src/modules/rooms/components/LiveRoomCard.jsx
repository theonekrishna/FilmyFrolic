import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { privateAxios } from "../../../utils/AxiosInstance";
import { TAG_COLORS } from "../data/rooms";
import { subscribeFollow, setFollowCache, getFollowCache } from "./followCache";
import { HostAvatar, FeaturedBadge, featuredCardStyle } from "./Roomhelpers";
import AuthPromptModal from "./Authpromptmoda";

const ACCENT = "#3b82f6";

// ── Toast (memoized) ──────────────────────────────────────────────────────────
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

// ── Follow button skeleton (memoized) ─────────────────────────────────────────
const FollowButtonSkeleton = memo(function FollowButtonSkeleton() {
  return (
    <div
      className="w-full rounded-[9px] h-[36px] mb-2 overflow-hidden relative"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
          animation: "ffShimmer 1.4s infinite",
        }}
      />
      <style>{`@keyframes ffShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  );
});

// ── Participant avatars (memoized + lazy images) ───────────────────────────────
const ParticipantAvatars = memo(function ParticipantAvatars({ participants = [] }) {
  if (!participants.length) return null;
  const visible = participants.slice(0, 3);
  const extra = participants.length - visible.length;
  return (
    <div className="absolute bottom-[12px] left-[12px] flex items-center" style={{ zIndex: 10 }}>
      {visible.map((p, i) => {
        const initials = (p.display_name || p.username || "?")[0].toUpperCase();
        return (
          <div
            key={p.user_id}
            className="w-[28px] h-[28px] rounded-full border-[2px] border-[#12121e] overflow-hidden flex items-center justify-center flex-shrink-0 text-[9px] font-black"
            style={{
              background: p.avatar_color || "#333",
              marginLeft: i === 0 ? 0 : -8,
              zIndex: visible.length - i,
              position: "relative",
              color: "#080810",
            }}
          >
            {p.avatar_url ? (
              <img
                src={p.avatar_url}
                alt={p.display_name || p.username}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.textContent = initials;
                  }
                }}
              />
            ) : (
              initials
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className="w-[28px] h-[28px] rounded-full border-[2px] border-[#12121e] flex items-center justify-center text-[9px] font-bold flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.13)",
            color: "rgba(240,240,248,0.75)",
            marginLeft: -8,
            position: "relative",
            zIndex: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
});

// ── Tag pill (memoized) ───────────────────────────────────────────────────────
const TagPill = memo(function TagPill({ tag }) {
  return (
    <span
      className="text-[10px] font-semibold rounded-full px-[9px] py-[3px]"
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
function LiveRoomCard({ room }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [followDataReady, setFollowDataReady] = useState(false);
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });
  const [toast, setToast] = useState({ message: "", type: "error" });

  const isOwner = room.isMyRoom === true;
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const participants = room._raw?.participants || [];

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code");

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 3000);
  }, []);

  useEffect(() => {
    if (isOwner || !isLoggedIn) {
      setFollowDataReady(true);
      return;
    }
    const token = localStorage.getItem("accessToken");
    const ownerId = room._raw?.owner_id;
    if (!token || !ownerId) {
      setFollowDataReady(true);
      return;
    }
    setRoomOwnerId(ownerId);
    const cached = getFollowCache(ownerId);
    if (cached !== undefined) {
      setIsFollowing(cached);
      setFollowDataReady(true);
      return;
    }
    privateAxios
      .get(`/api/follow/${ownerId}/is-following`)
      .then((res) => {
        if (res.data.success) {
          setFollowCache(ownerId, res.data.isFollowing);
          setIsFollowing(res.data.isFollowing);
        }
      })
      .catch(() => {})
      .finally(() => setFollowDataReady(true));
  }, [room.id, isOwner, isLoggedIn]);

  useEffect(() => {
    if (!roomOwnerId) return;
    return subscribeFollow(roomOwnerId, (value) => setIsFollowing(value));
  }, [roomOwnerId]);

  const handleFollowToggle = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!roomOwnerId || loadingFollow) return;
      try {
        setLoadingFollow(true);
        if (isFollowing) {
          await privateAxios.delete(`/api/follow/${roomOwnerId}`);
          setFollowCache(roomOwnerId, false);
        } else {
          await privateAxios.post(`/api/follow/${roomOwnerId}`);
          setFollowCache(roomOwnerId, true);
        }
      } catch (err) {
        showToast(err.response.data.message || "You cannot follow this user");
      } finally {
        setLoadingFollow(false);
      }
    },
    [roomOwnerId, loadingFollow, isFollowing, showToast]
  );

  const handleJoin = useCallback(async () => {
    if (!isLoggedIn) {
      setAuthPrompt({
        open: true,
        message: "Sign in to join this room and watch together with the community!",
      });
      return;
    }
    if (loading) return;
    try {
      setLoading(true);
      const joinPayload = { room_id: room.id };
      if (inviteCode) joinPayload.invite_code = inviteCode;
      const res = await privateAxios.post(`/api/rooms/join`, joinPayload, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.success === false) {
        setErrorMessage(res.data.message);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      navigate(
        inviteCode ? `/social/rooms/${room.id}?code=${inviteCode}` : `/social/rooms/${room.id}`
      );
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || "Failed to join room ❌";
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loading, room.id, inviteCode, navigate]);

  // Stable image handlers
  const handleImgLoad = useCallback(() => setImgLoaded(true), []);
  const handleImgError = useCallback(() => setImgError(true), []);
  const handleAuthClose = useCallback(() => setAuthPrompt({ open: false, message: "" }), []);

  const owner = room._raw?.owner_details || {};

  return (
    <>
      <Toast message={toast.message} type={toast.type} />
      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={handleAuthClose}
        message={authPrompt.message}
      />

      <div
        className="bg-[#12121e] border border-white/10 rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={featuredCardStyle(room._raw?.featured)}
      >
        {/* ── Thumbnail ── */}
        <div className="relative h-[180px]">
          {errorMessage ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-900/30 text-red-400 text-center px-4">
              <div>
                <p className="text-lg font-bold mb-1">⚠️ Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <>
              {(!room.backdrop || imgError || !imgLoaded) && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#12121e] flex items-center justify-center">
                  <span className="text-white/20 text-[12px]">🎬</span>
                </div>
              )}
              {room.backdrop && !imgError && (
                <img
                  src={room.backdrop}
                  alt={room.movie}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={handleImgLoad}
                  onError={handleImgError}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,8,16,0.2)] to-[rgba(8,8,16,0.8)]" />
            </>
          )}

          {/* LIVE pill */}
          <div
            className="absolute top-[11px] left-[11px] flex items-center gap-[5px] rounded-full px-[10px] py-[4px]"
            style={{
              background: "rgba(232,69,69,0.92)",
              backdropFilter: "blur(4px)",
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full bg-white"
              style={{ animation: "livePulse 1.2s ease infinite" }}
            />
            <span
              className="text-[10px] font-black text-white tracking-[1px]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              LIVE
            </span>
          </div>

          {/* Viewer count */}
          <div
            className="absolute top-[11px] right-[11px] flex items-center gap-[5px] rounded-full px-[10px] py-[4px]"
            style={{
              background: "rgba(0,0,0,0.62)",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(240,240,248,0.8)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span
              className="text-[11px] font-semibold"
              style={{
                color: "rgba(240,240,248,0.9)",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              {room._raw?.participant_count ?? participants.length}
            </span>
          </div>

          {room._raw?.featured && <FeaturedBadge />}
          <ParticipantAvatars participants={participants} />

          <style>{`@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>

        {/* ── Card body ── */}
        <div className="px-4 pt-[14px] pb-4">
          <h3
            className="text-[18px] tracking-[1px] text-[#f0f0f8] mb-[6px] leading-[1.2] font-bold"
            style={{ fontFamily: "Bebas Neue, cursive" }}
          >
            {room.topic}
          </h3>
          <p className="text-[12px] text-white/45 mb-3 leading-[1.5] font-light line-clamp-2">
            {room.description}
          </p>

          {/* Tags */}
          <div className="flex gap-[6px] mb-[12px] flex-wrap">
            {room.tags?.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>

          {/* Host row */}
          <div className="flex items-center gap-[8px] mb-[12px]">
            <HostAvatar
              avatarUrl={owner.avatar_url}
              initials={(owner.display_name || owner.username || "?").slice(0, 2).toUpperCase()}
              gradient={owner.avatar_color}
              size={24}
            />
            <span className="text-[11px] text-white/50">
              Hosted by{" "}
              <span className="text-[#f0f0f8] font-semibold">
                {owner.display_name || owner.username}
              </span>
            </span>
          </div>

          {/* Follow button */}
          {!isOwner && isLoggedIn && (
            <>
              {!followDataReady ? (
                <FollowButtonSkeleton />
              ) : roomOwnerId ? (
                <button
                  onClick={handleFollowToggle}
                  disabled={loadingFollow}
                  className="w-full rounded-[9px] py-[9px] text-[12px] font-semibold mb-2 flex items-center justify-center gap-[6px] transition-all duration-200"
                  style={{
                    background: isFollowing ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.18)",
                    border: `1px solid ${isFollowing ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.55)"}`,
                    color: isFollowing ? "rgba(147,197,253,0.7)" : "#93c5fd",
                    opacity: loadingFollow ? 0.65 : 1,
                  }}
                >
                  {loadingFollow ? (
                    <>
                      <span
                        className="w-[11px] h-[11px] rounded-full border-2 border-[#93c5fd]/30 border-t-[#93c5fd] inline-block"
                        style={{ animation: "ffSpin 0.7s linear infinite" }}
                      />
                      <style>{`@keyframes ffSpin{to{transform:rotate(360deg)}}`}</style>
                      {isFollowing ? "Unfollowing..." : "Following..."}
                    </>
                  ) : isFollowing ? (
                    "✓ Following Host"
                  ) : (
                    "+ Follow Host"
                  )}
                </button>
              ) : null}
            </>
          )}

          {/* Join button */}
          <button
            className="w-full rounded-[9px] py-[11px] text-[13px] font-bold text-white transition-transform duration-150 hover:-translate-y-[1px]"
            style={{
              background: ACCENT,
              boxShadow: `0 4px 16px ${ACCENT}35`,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleJoin}
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(LiveRoomCard);

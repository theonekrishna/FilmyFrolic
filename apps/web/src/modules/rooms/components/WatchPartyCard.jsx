import { useState, useEffect, useCallback, memo } from "react";
import { Eye, Play } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { privateAxios } from "../../../utils/AxiosInstance";
import { subscribeFollow, setFollowCache, getFollowCache } from "./followCache";
import { HostAvatar, FeaturedBadge, featuredCardStyle } from "./Roomhelpers";
import AuthPromptModal from "./Authpromptmoda";

// ─────────────────────────────────────────────
// TOAST (memoized)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// FOLLOW BUTTON SKELETON (memoized)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// PARTICIPANT AVATARS (memoized + lazy imgs)
// ─────────────────────────────────────────────
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
                  if (e.currentTarget.parentElement)
                    e.currentTarget.parentElement.textContent = initials;
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

// ─────────────────────────────────────────────
// WATCH PARTY CARD
// ─────────────────────────────────────────────
function WatchPartyCard({ party }) {
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

  const isOwner = party.isMyRoom === true;
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const participants = party._raw?.participants || [];

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    const ownerId = party._raw?.owner_id;
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
  }, [party.id, isOwner, isLoggedIn]);

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
    const token = localStorage.getItem("accessToken");
    if (!isLoggedIn || !token) {
      setAuthPrompt({
        open: true,
        message: "Sign in to join this watch party and enjoy films with the community!",
      });
      return;
    }
    try {
      setLoading(true);
      const joinPayload = { room_id: party.id };
      if (inviteCode) joinPayload.invite_code = inviteCode;
      const res = await privateAxios.post(`/api/rooms/join`, joinPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success === false) {
        setErrorMessage(res.data.message);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      navigate(
        inviteCode ? `/social/rooms/${party.id}?code=${inviteCode}` : `/social/rooms/${party.id}`
      );
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to join ❌";
      setErrorMessage(msg);
      if (err.response?.status === 401 || msg.includes("Unauthorized")) {
        window.dispatchEvent(new CustomEvent("auth-expired"));
      }
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, party.id, inviteCode, navigate]);

  const owner = party._raw.owner_details || {};

  return (
    <>
      <Toast message={toast.message} type={toast.type} />
      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />
      <div
        className="bg-[#12121e] border border-[rgba(245,197,24,0.18)] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[rgba(245,197,24,0.32)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        style={featuredCardStyle(party._raw.featured)}
      >
        {/* Backdrop */}
        <div className="relative h-[160px]">
          {errorMessage ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-900/30 text-red-400 text-center px-4">
              <div>
                <p className="text-lg font-bold mb-1">⚠️ Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <>
              {!party.backdrop || imgError || !imgLoaded ? (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#12121e] flex items-center justify-center animate-pulse">
                  <span className="text-white/20 text-[12px]">🎬</span>
                </div>
              ) : null}
              {party.backdrop && !imgError && (
                <img
                  src={party.backdrop}
                  alt={party.movie}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,8,16,0.1)_0%,rgba(8,8,16,0.85)_100%)]" />
              <div
                className="absolute top-[12px] left-[12px] rounded-[6px] px-[10px] py-[4px]"
                style={{ background: party.platformColor }}
              >
                <span className="text-[10px] font-extrabold text-white">{party.platform}</span>
              </div>
              <div className="absolute top-[12px] right-[12px] flex items-center gap-[5px] bg-black/60 rounded-full px-[10px] py-[4px]">
                <Eye size={11} className="text-white/80" />
                <span className="text-[11px] font-semibold text-white/90">
                  {party.viewers || 0}
                </span>
              </div>
            </>
          )}
          {party._raw.featured && <FeaturedBadge />}
          <ParticipantAvatars participants={participants} />
        </div>

        {/* Content */}
        <div className="px-[16px] pt-[14px] pb-[16px]">
          <h3 className="text-[18px] text-[#f0f0f8] mb-[8px]">{party.title}</h3>
          <div className="flex items-center gap-[8px] mb-[10px]">
            <HostAvatar
              avatarUrl={owner.avatar_url}
              initials={(owner.display_name || owner.username || "?").slice(0, 2).toUpperCase()}
              gradient={owner.avatar_color}
              size={24}
            />
            <span className="text-[11px] text-white/50">
              Hosted by <span className="text-[#f0f0f8] font-semibold">{owner.display_name}</span>
            </span>
          </div>

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
                    background: isFollowing ? "rgba(245,197,24,0.08)" : "rgba(245,197,24,0.12)",
                    border: `1px solid ${isFollowing ? "rgba(245,197,24,0.3)" : "rgba(245,197,24,0.45)"}`,
                    color: isFollowing ? "rgba(245,197,24,0.6)" : "rgba(245,197,24,0.9)",
                    opacity: loadingFollow ? 0.65 : 1,
                  }}
                >
                  {loadingFollow ? (
                    <>
                      <span
                        className="w-[11px] h-[11px] rounded-full border-2 border-[#f5c518]/30 border-t-[#f5c518] inline-block"
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

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-[7px] border border-[rgba(245,197,24,0.3)] rounded-[9px] py-[11px] text-[13px] font-bold text-[#f5c518] transition hover:bg-[rgba(245,197,24,0.18)] bg-[rgba(245,197,24,0.1)]"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            <Play size={13} fill="#f5c518" />
            {loading ? "Joining..." : "Join Watch Party"}
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(WatchPartyCard);

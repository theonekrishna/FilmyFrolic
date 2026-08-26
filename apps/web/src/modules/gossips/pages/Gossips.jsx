import { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from "react";
import TopBar from "../../../layout/TopBar";
import { TRENDING_TAGS } from "../data/gossips";
import { privateAxios } from "../../../utils/AxiosInstance";
import {
  Bookmark,
  Plus,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit2,
  Menu,
  X,
  UserPlus,
  UserCheck,
  Search,
} from "lucide-react";

// ── Lazy modal imports ────────────────────────────────────────────────────────
const CreateGossipModal = lazy(() => import("../components/CreateGossipModal"));
const GossipDetailModal = lazy(() => import("../components/Gossipdetailmodal"));
const AuthPromptModal = lazy(() => import("../components/Authpromptmodal"));

const ACCENT = "#f5c518";

const HEAT_CONFIG = {
  hot: {
    label: "🔥 HOT",
    color: "#e84545",
    bg: "rgba(232,69,69,0.12)",
    border: "rgba(232,69,69,0.3)",
    accentBorder: "#e84545",
  },
  trending: {
    label: "📢 TRENDING",
    color: ACCENT,
    bg: "rgba(245,197,24,0.1)",
    border: "rgba(245,197,24,0.25)",
    accentBorder: ACCENT,
  },
  rumor: {
    label: "🤔 RUMOR",
    color: "#f39c12",
    bg: "rgba(243,156,18,0.1)",
    border: "rgba(243,156,18,0.25)",
    accentBorder: "#f39c12",
  },
};

const CATS_FILTER = [
  { value: "all", label: "All Topics" },
  { value: "rumor", label: "🚨 Rumors" },
  { value: "speculation", label: "🔮 Speculation" },
  { value: "fan_theory", label: "🧩 Fan Theories" },
  { value: "opinion", label: "💬 Opinions & Discussion" },
  { value: "confirmed_news", label: "✅ Confirmed News" },
  { value: "question", label: "❓ Questions" },
];

function getHeatLevel(category) {
  if (!category) return "rumor";
  const cat = category.toLowerCase();
  if (cat === "breaking") return "hot";
  if (cat === "interview" || cat === "paparazzi") return "trending";
  return "rumor";
}

function fmtCount(n) {
  const num = parseInt(n, 10) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return String(num);
}

function getInitials(username) {
  if (!username) return "?";
  const parts = username.replace(/_/g, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return parts
    .slice(0, 3)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// ── useDebounce ───────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── LazyImage ─────────────────────────────────────────────────────────────────
const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  style,
  onError,
  wrapperClassName,
  wrapperStyle,
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src || !imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          imgRef.current.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  if (errored) return null;

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      {!loaded && <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />}
      <img
        ref={imgRef}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
      />
    </div>
  );
});

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = memo(function Toast({ message, type = "error" }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: type === "error" ? "rgba(239,68,68,0.95)" : "rgba(34,197,94,0.95)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
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
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
});

// ── OwnerAvatar ───────────────────────────────────────────────────────────────
const OwnerAvatar = memo(function OwnerAvatar({ profile }) {
  const [imgError, setImgError] = useState(false);
  if (!profile) return null;

  const { avatar, username, dispaly_name } = profile;
  const displayLabel = dispaly_name || username || "";
  const initials = getInitials(username || dispaly_name || "");
  const showImage = avatar && !imgError;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-[#1e1e30] relative">
        {showImage ? (
          <LazyImage
            src={avatar}
            alt={displayLabel}
            className="w-full h-full object-cover"
            wrapperClassName="relative w-full h-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[8px] font-black tracking-tight"
            style={{ color: ACCENT, background: `${ACCENT}18` }}
          >
            {initials}
          </div>
        )}
      </div>
      <span className="text-[11px] font-semibold text-white/40 truncate max-w-[100px]">
        @{username || dispaly_name}
      </span>
    </div>
  );
});

// ── GossipCardItem ────────────────────────────────────────────────────────────
const GossipCardItem = memo(function GossipCardItem({
  gossip,
  onCardClick,
  onDelete,
  onReactionChange,
  onEdit,
  isMyGossip = false,
  isFollowing = false,
  onFollowToggle,
  onRequireAuth,
  onToast,
}) {
  const heatLevel = useMemo(
    () => gossip.heatLevel || getHeatLevel(gossip.category),
    [gossip.heatLevel, gossip.category]
  );
  const cfg = HEAT_CONFIG[heatLevel] || HEAT_CONFIG.rumor;

  const [fireCount, setFireCount] = useState(() => parseInt(gossip.fire, 10) || 0);
  const [shockedCount, setShockedCount] = useState(() => parseInt(gossip.shocked, 10) || 0);
  const [firedByMe, setFiredByMe] = useState(() => gossip.userFired || false);
  const [shockedByMe, setShockedByMe] = useState(() => gossip.userShocked || false);
  const [loadingFire, setLoadingFire] = useState(false);
  const [loadingShocked, setLoadingShocked] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Sync when parent gossip prop changes
  useEffect(() => {
    setFireCount(parseInt(gossip.fire, 10) || 0);
    setShockedCount(parseInt(gossip.shocked, 10) || 0);
    setFiredByMe(gossip.userFired || false);
    setShockedByMe(gossip.userShocked || false);
  }, [gossip.fire, gossip.shocked, gossip.userFired, gossip.userShocked]);

  const imageUrl = gossip.image_url || gossip.image || null;
  const creatorId = gossip.owners_id;

  const handleFire = useCallback(
    async (e) => {
      e.stopPropagation();
      if (onRequireAuth?.("Sign in to react to gossips and show what's 🔥!")) return;
      if (loadingFire) return;
      const wasOn = firedByMe;
      const newFiredByMe = !wasOn;
      const newFireCount = wasOn ? Math.max(0, fireCount - 1) : fireCount + 1;
      setFiredByMe(newFiredByMe);
      setFireCount(newFireCount);
      setLoadingFire(true);
      try {
        await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
          reaction: "fire",
        });
        onReactionChange?.(gossip.id, {
          userFired: newFiredByMe,
          fire: newFireCount,
        });
      } catch {
        setFiredByMe(wasOn);
        setFireCount(wasOn ? Math.max(0, newFireCount + 1) : Math.max(0, newFireCount - 1));
      } finally {
        setLoadingFire(false);
      }
    },
    [firedByMe, fireCount, loadingFire, gossip.id, onRequireAuth, onReactionChange]
  );

  const handleShocked = useCallback(
    async (e) => {
      e.stopPropagation();
      if (onRequireAuth?.("Sign in to react to gossips — are you 😱 shocked?")) return;
      if (loadingShocked) return;
      const wasOn = shockedByMe;
      const newShockedByMe = !wasOn;
      const newShockedCount = wasOn ? Math.max(0, shockedCount - 1) : shockedCount + 1;
      setShockedByMe(newShockedByMe);
      setShockedCount(newShockedCount);
      setLoadingShocked(true);
      try {
        await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
          reaction: "shocked",
        });
        onReactionChange?.(gossip.id, {
          userShocked: newShockedByMe,
          shocked: newShockedCount,
        });
      } catch {
        setShockedByMe(wasOn);
        setShockedCount(
          wasOn ? Math.max(0, newShockedCount + 1) : Math.max(0, newShockedCount - 1)
        );
      } finally {
        setLoadingShocked(false);
      }
    },
    [shockedByMe, shockedCount, loadingShocked, gossip.id, onRequireAuth, onReactionChange]
  );

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      setDeleting(true);
      try {
        await privateAxios.delete(`/api/gossips/${gossip.id}`);
        onDelete?.(gossip.id);
      } catch (err) {
        onToast?.(err.response?.data?.message || "Failed to delete gossip");
      } finally {
        setDeleting(false);
      }
    },
    [gossip.id, onDelete, onToast]
  );

  const handleFollowClick = useCallback(
    async (e) => {
      e.stopPropagation();
      if (onRequireAuth?.("Sign in to follow creators and stay up to date with their gossips!"))
        return;
      if (followLoading || !creatorId) return;
      setFollowLoading(true);
      try {
        if (isFollowing) await privateAxios.delete(`/api/follow/${creatorId}`);
        else await privateAxios.post(`/api/follow/${creatorId}`);
        onFollowToggle?.(creatorId, !isFollowing);
      } catch (err) {
        onToast?.(err.response?.data?.message || "Failed to update follow status");
      } finally {
        setFollowLoading(false);
      }
    },
    [followLoading, creatorId, isFollowing, onRequireAuth, onFollowToggle, onToast]
  );

  const handleCardClick = useCallback(() => onCardClick?.(gossip), [onCardClick, gossip]);
  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit?.(gossip);
    },
    [onEdit, gossip]
  );

  return (
    <div
      className={`group bg-[#12121e] border-r border-t border-b border-white/[0.07] rounded-r-2xl overflow-hidden transition-all duration-300 hover:bg-[#151525] hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)] cursor-pointer relative ${deleting ? "opacity-50 pointer-events-none" : ""}`}
      style={{ borderLeft: `5px solid ${cfg.accentBorder}` }}
      onClick={handleCardClick}
    >
      {/* Lazy card image */}
      {imageUrl && (
        <LazyImage
          src={imageUrl}
          alt={gossip.headline || ""}
          className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.02]"
          wrapperClassName="h-[180px] overflow-hidden bg-white/[0.03] relative"
        />
      )}

      {isMyGossip && (
        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
          <button
            onClick={handleEdit}
            className="bg-blue-500/80 hover:bg-blue-600 rounded-full p-2 transition-colors"
            title="Edit gossip"
          >
            <Edit2 size={13} className="text-white" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500/80 hover:bg-red-600 rounded-full p-2 transition-colors disabled:opacity-60"
            title="Delete gossip"
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin text-white" />
            ) : (
              <Trash2 size={13} className="text-white" />
            )}
          </button>
        </div>
      )}

      <div className="pl-4 pr-6 py-5">
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <span
            className="rounded-md px-2.5 py-1 text-[9px] font-black tracking-widest uppercase"
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>

          {gossip.verified && (
            <span
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-black tracking-widest uppercase"
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 12 12"
                fill="none"
                style={{ display: "inline-block", flexShrink: 0 }}
              >
                <path
                  d="M2 6.5L4.5 9L10 3"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified
            </span>
          )}

          {Array.isArray(gossip.tags) &&
            gossip.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={`${gossip.id}-tag-${idx}`}
                className="text-[10px] font-bold text-white/20 uppercase tracking-tighter"
              >
                #{tag}
              </span>
            ))}
          <span className="ml-auto text-[10px] font-bold text-white/10 tracking-widest uppercase">
            {gossip.timeAgo}
          </span>
        </div>

        {gossip.profile && (
          <div className="mb-3">
            <OwnerAvatar profile={gossip.profile} />
          </div>
        )}

        <h3 className="font-['Outfit'] text-[17px] font-bold text-white mb-2 leading-snug">
          {gossip.headline}
        </h3>
        <p className="font-['Outfit'] text-sm text-white/40 mb-4 leading-relaxed font-light line-clamp-2">
          {gossip.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Fire */}
            <button
              onClick={handleFire}
              disabled={loadingFire}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all border text-[10px] sm:text-[11px] select-none disabled:opacity-70 ${
                firedByMe
                  ? "bg-[rgba(232,69,69,0.12)] border-[rgba(232,69,69,0.35)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
              }`}
            >
              {loadingFire ? (
                <Loader2 size={12} className="animate-spin" style={{ color: "#e84545" }} />
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1,
                    display: "inline-block",
                    filter: firedByMe ? "drop-shadow(0 0 4px #e84545)" : "none",
                    transform: firedByMe ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s, filter 0.15s",
                  }}
                >
                  🔥
                </span>
              )}
              <span
                className={`font-black tabular-nums ${firedByMe ? "text-[#e84545]" : "text-white/30"}`}
              >
                {fmtCount(fireCount)}
              </span>
            </button>

            {/* Shocked */}
            <button
              onClick={handleShocked}
              disabled={loadingShocked}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all border text-[10px] sm:text-[11px] select-none disabled:opacity-70 ${
                shockedByMe
                  ? "bg-[rgba(245,197,24,0.1)] border-[rgba(245,197,24,0.3)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
              }`}
            >
              {loadingShocked ? (
                <Loader2 size={12} className="animate-spin" style={{ color: "#f5c518" }} />
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1,
                    display: "inline-block",
                    transform: shockedByMe ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                >
                  😱
                </span>
              )}
              <span
                className={`font-black tabular-nums ${shockedByMe ? "text-[#f5c518]" : "text-white/30"}`}
              >
                {fmtCount(shockedCount)}
              </span>
            </button>

            {/* Follow */}
            {!isMyGossip && creatorId && (
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all border text-[10px] sm:text-[11px] select-none disabled:opacity-70 ${
                  isFollowing
                    ? "bg-[rgba(245,197,24,0.1)] border-[rgba(245,197,24,0.3)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                }`}
                title={isFollowing ? "Unfollow" : "Follow"}
              >
                {followLoading ? (
                  <Loader2
                    size={12}
                    className="animate-spin"
                    style={{ color: isFollowing ? "#f5c518" : "currentColor" }}
                  />
                ) : isFollowing ? (
                  <UserCheck size={12} style={{ color: "#f5c518" }} />
                ) : (
                  <UserPlus size={12} className="text-white/30" />
                )}
                <span
                  className={`font-black tabular-nums ${isFollowing ? "text-[#f5c518]" : "text-white/30"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-white/20">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span className="text-[11px] font-bold tabular-nums">
                {fmtCount(gossip.comments)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── HeatList ──────────────────────────────────────────────────────────────────
const HeatList = memo(function HeatList({ items }) {
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between mb-2">
            <span className="text-[13px] font-bold text-white/60 truncate max-w-[160px]">
              {item.label}
            </span>
            <span className="text-xs font-black" style={{ color: item.color }}>
              {item.heat}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${item.heat}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = memo(function Sidebar({
  heatItems,
  breakdownStats,
  bookmarkedGossips,
  onGossipClick,
}) {
  return (
    <>
      <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <TrendingUp size={20} />
          </div>
          <h4 className="text-xl md:text-2xl font-['Bebas_Neue'] tracking-widest text-white uppercase">
            Heat Index
          </h4>
        </div>
        <HeatList items={heatItems} />
      </div>

      <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
        <h4 className="text-lg md:text-xl font-['Bebas_Neue'] tracking-widest text-white/40 uppercase mb-6 md:mb-8">
          Breakdown
        </h4>
        <div className="space-y-3">
          {breakdownStats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <span className="text-xs font-bold text-white/60">
                {stat.icon} {stat.label}
              </span>
              <span className="font-['Bebas_Neue'] text-lg" style={{ color: stat.color }}>
                {stat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <Bookmark size={20} className="text-[#f5c518]" />
          <h4 className="text-xl md:text-2xl font-['Bebas_Neue'] tracking-widest text-white uppercase">
            Saved
          </h4>
        </div>
        {bookmarkedGossips.length === 0 ? (
          <p className="text-xs text-white/40 font-medium">Bookmark gossips to find them here.</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {bookmarkedGossips.map((g) => (
              <div
                key={g.id}
                className="p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors"
                onClick={() => onGossipClick(g)}
              >
                <p className="text-xs text-white/70 line-clamp-3">{g.headline}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
});

// ── MobileDrawer ──────────────────────────────────────────────────────────────
const MobileDrawer = memo(function MobileDrawer({
  isOpen,
  onClose,
  heatItems,
  breakdownStats,
  bookmarkedGossips,
  onGossipClick,
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 bottom-9 sm:bottom-16 w-[85vw] max-w-sm bg-[#080810] border-l border-white/10 shadow-2xl z-40 overflow-y-auto transition-transform duration-300 lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-white/5 bg-[#080810]/95 backdrop-blur-sm">
          <h3 className="font-['Bebas_Neue'] text-lg tracking-widest text-white">INSIGHTS</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <Sidebar
            heatItems={heatItems}
            breakdownStats={breakdownStats}
            bookmarkedGossips={bookmarkedGossips}
            onGossipClick={(g) => {
              onGossipClick(g);
              onClose();
            }}
          />
        </div>
      </div>
    </>
  );
});

// ── FeedSkeleton ──────────────────────────────────────────────────────────────
const FeedSkeleton = memo(function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-[#12121e] border-r border-t border-b border-white/[0.07] rounded-r-2xl overflow-hidden animate-pulse"
          style={{ borderLeft: "5px solid rgba(255,255,255,0.06)" }}
        >
          <div className="pl-4 pr-6 py-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-5 w-16 bg-white/[0.06] rounded-md" />
              <div className="h-3 w-12 bg-white/[0.04] rounded ml-auto" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/[0.06]" />
              <div className="h-3 w-20 bg-white/[0.04] rounded" />
            </div>
            <div className="h-5 bg-white/[0.06] rounded w-4/5 mb-2" />
            <div className="h-4 bg-white/[0.04] rounded w-full mb-1.5" />
            <div className="h-4 bg-white/[0.04] rounded w-2/3 mb-4" />
            <div className="flex gap-2 pt-4 border-t border-white/[0.04]">
              <div className="h-8 w-20 bg-white/[0.04] rounded-xl" />
              <div className="h-8 w-20 bg-white/[0.04] rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// ── SearchBar ─────────────────────────────────────────────────────────────────
const SearchBar = memo(function SearchBar({ value, onChange, onClear, placeholder }) {
  return (
    <div className="relative flex items-center w-full">
      <Search
        size={15}
        className="absolute left-3.5 text-white/30 pointer-events-none flex-shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#12121e] border border-white/[0.08] rounded-xl pl-10 pr-9 py-2.5 text-[13px] text-white/80 placeholder-white/20 outline-none focus:border-[#f5c518]/40 focus:bg-[#14142a] transition-all font-['Outfit']"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 text-white/20 hover:text-white/50 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});

// ── Main Gossips Page ─────────────────────────────────────────────────────────
export default function Gossips() {
  const [gossips, setGossips] = useState([]);
  const [myGossips, setMyGossips] = useState([]);
  const [bookmarkedGossips, setBookmarkedGossips] = useState([]);
  const [trendingTags, setTrendingTags] = useState(TRENDING_TAGS);
  const [activeTab, setActiveTab] = useState("feed");
  const [activecat, setActivecat] = useState("all");
  const [creating, setCreating] = useState(false);
  const [editingGossip, setEditingGossip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGossip, setSelectedGossip] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [followMap, setFollowMap] = useState({});
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [searchQuery, setSearchQuery] = useState("");
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const isLoggedIn = useMemo(() => !!localStorage.getItem("accessToken"), []);
  const isMounted = useRef(true);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "error" }), 3000);
  }, []);

  const requireAuth = useCallback(
    (message) => {
      if (!isLoggedIn) {
        setAuthPrompt({ open: true, message });
        return true;
      }
      return false;
    },
    [isLoggedIn]
  );

  // ── Search filter ─────────────────────────────────────────────────────────
  const applySearch = useCallback((list, query) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (g) =>
        (g.headline || "").toLowerCase().includes(q) ||
        (g.excerpt || "").toLowerCase().includes(q) ||
        (g.category || "").toLowerCase().includes(q) ||
        (g.source || "").toLowerCase().includes(q) ||
        (Array.isArray(g.tags) && g.tags.some((t) => t.toLowerCase().includes(q))) ||
        (g.profile?.username || "").toLowerCase().includes(q) ||
        (g.profile?.dispaly_name || "").toLowerCase().includes(q)
    );
  }, []);

  // ── Follow map builder ────────────────────────────────────────────────────
  const buildFollowMap = useCallback(async (gossipList) => {
    const creatorIds = [
      ...new Set(gossipList.filter((g) => !g.is_my_gossip && g.owners_id).map((g) => g.owners_id)),
    ];
    if (creatorIds.length === 0) return;

    const results = await Promise.allSettled(
      creatorIds.map((id) =>
        privateAxios.get(`/api/follow/${id}/is-following`).then((res) => ({
          id,
          isFollowing:
            res.data?.isFollowing ?? res.data?.data?.isFollowing ?? res.data?.following ?? false,
        }))
      )
    );

    const map = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") map[r.value.id] = r.value.isFollowing;
    });
    if (isMounted.current) setFollowMap((prev) => ({ ...prev, ...map }));
  }, []);

  // ── API fetchers ──────────────────────────────────────────────────────────
  const fetchAllGossips = useCallback(
    async (category = null) => {
      setCategoryLoading(true);
      try {
        const url =
          category && category !== "all" ? `/api/gossips?category=${category}` : `/api/gossips`;
        const response = await privateAxios.get(url);
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        if (isMounted.current) {
          setGossips(data);
          buildFollowMap(data);
        }
      } catch {
        if (isMounted.current) setGossips([]);
      } finally {
        if (isMounted.current) setCategoryLoading(false);
      }
    },
    [buildFollowMap]
  );

  const fetchMyGossips = useCallback(async () => {
    try {
      const response = await privateAxios.get(`/api/gossips/my`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      if (isMounted.current) setMyGossips(data);
    } catch {
      if (isMounted.current) setMyGossips([]);
    }
  }, []);

  const fetchBookmarkedGossips = useCallback(async () => {
    try {
      const response = await privateAxios.get(`/api/gossips/bookmarked`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      if (isMounted.current) setBookmarkedGossips(data);
    } catch {
      if (isMounted.current) setBookmarkedGossips([]);
    }
  }, []);

  const fetchTrendingTags = useCallback(async () => {
    try {
      const response = await privateAxios.get(`/api/gossips/trending-tags?limit=7`);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || TRENDING_TAGS;
      if (isMounted.current) setTrendingTags(data);
    } catch {
      if (isMounted.current) setTrendingTags(TRENDING_TAGS);
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAllGossips(),
          fetchMyGossips(),
          fetchBookmarkedGossips(),
          fetchTrendingTags(),
        ]);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchAllGossips, fetchMyGossips, fetchBookmarkedGossips, fetchTrendingTags]);

  // ── Category change ───────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "feed") {
      fetchAllGossips(activecat !== "all" ? activecat : null);
    }
  }, [activecat, activeTab, fetchAllGossips]);

  // ── Clear search on tab switch ────────────────────────────────────────────
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  // ── Event handlers ────────────────────────────────────────────────────────
  const handleCardClick = useCallback((gossip) => setSelectedGossip(gossip), []);

  const handleGossipDeleted = useCallback((gossipId) => {
    setGossips((prev) => prev.filter((g) => g.id !== gossipId));
    setMyGossips((prev) => prev.filter((g) => g.id !== gossipId));
    setSelectedGossip((prev) => (prev?.id === gossipId ? null : prev));
  }, []);

  const handleReactionChange = useCallback((gossipId, updates) => {
    const applyUpdate = (list) => list.map((g) => (g.id === gossipId ? { ...g, ...updates } : g));
    setGossips((prev) => applyUpdate(prev));
    setMyGossips((prev) => applyUpdate(prev));
    setSelectedGossip((prev) => (prev?.id === gossipId ? { ...prev, ...updates } : prev));
  }, []);

  const handleFollowToggle = useCallback((creatorId, nowFollowing) => {
    setFollowMap((prev) => ({ ...prev, [creatorId]: nowFollowing }));
  }, []);

  const handleGossipCreated = useCallback(
    (newGossip) => {
      if (!newGossip) {
        fetchAllGossips(activecat !== "all" ? activecat : null);
        fetchMyGossips();
        return;
      }
      const normalised = {
        ...newGossip,
        timeAgo: newGossip.timeAgo || "just now",
      };
      setGossips((prev) => [normalised, ...prev]);
      setMyGossips((prev) => [normalised, ...prev]);
    },
    [activecat, fetchAllGossips, fetchMyGossips]
  );

  const handleGossipUpdated = useCallback((updatedGossip) => {
    if (!updatedGossip) return;
    const patch = (list) =>
      list.map((g) => (g.id === updatedGossip.id ? { ...g, ...updatedGossip } : g));
    setGossips((prev) => patch(prev));
    setMyGossips((prev) => patch(prev));
    setSelectedGossip((prev) =>
      prev?.id === updatedGossip.id ? { ...prev, ...updatedGossip } : prev
    );
    setEditingGossip(null);
  }, []);

  const handleCategoryClick = useCallback(
    (cat) => {
      setActivecat(cat.value);
      fetchAllGossips(cat.value !== "all" ? cat.value : null);
    },
    [fetchAllGossips]
  );

  // ── Derived data (memoised) ───────────────────────────────────────────────
  const baseList = useMemo(() => {
    if (activeTab !== "feed") return myGossips;
    return activecat === "all" ? gossips : gossips.filter((g) => g.category === activecat);
  }, [activeTab, activecat, gossips, myGossips]);

  const filtered = useMemo(
    () => applySearch(baseList, debouncedSearch),
    [baseList, debouncedSearch, applySearch]
  );

  const heatItems = useMemo(() => {
    const sorted = [...gossips]
      .sort((a, b) => (parseInt(b.fire, 10) || 0) - (parseInt(a.fire, 10) || 0))
      .slice(0, 5);
    const maxFire = gossips.reduce((max, x) => Math.max(max, parseInt(x.fire, 10) || 0), 1);
    const items = sorted.map((g) => {
      const heat = Math.round(((parseInt(g.fire, 10) || 0) / maxFire) * 100);
      const color = heat > 85 ? "#e84545" : heat > 65 ? "#f5c518" : "#f39c12";
      const label = (g.headline || "").slice(0, 22) + (g.headline?.length > 22 ? "…" : "");
      return { label, heat, color };
    });
    if (items.length > 0) return items;
    return [
      { label: "Realm of Ash", heat: 92, color: "#e84545" },
      { label: "Obsidian Protocol", heat: 84, color: "#e84545" },
      { label: "Nexus Rising", heat: 71, color: "#f5c518" },
      { label: "Ghost Frequency", heat: 68, color: "#f5c518" },
      { label: "Sakura Protocol", heat: 61, color: "#f39c12" },
    ];
  }, [gossips]);

  const breakdownStats = useMemo(
    () => [
      {
        label: "Confirmed Hot",
        count: gossips.filter((g) => g.category === "breaking" && g.verified).length,
        icon: "🔥",
        color: "#e84545",
      },
      {
        label: "Trending",
        count: gossips.filter((g) => g.category === "paparazzi" || g.category === "interview")
          .length,
        icon: "📢",
        color: "#f5c518",
      },
      {
        label: "Unverified",
        count: gossips.filter((g) => !g.verified).length,
        icon: "🤔",
        color: "#f39c12",
      },
    ],
    [gossips]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080810]">
      <Toast message={toast.message} type={toast.type} />

      {/* Lazy modals — only mount when needed */}
      <Suspense fallback={null}>
        {authPrompt.open && (
          <AuthPromptModal
            isOpen={authPrompt.open}
            onClose={() => setAuthPrompt({ open: false, message: "" })}
            message={authPrompt.message}
          />
        )}
        {creating && (
          <CreateGossipModal onClose={() => setCreating(false)} onCreate={handleGossipCreated} />
        )}
        {editingGossip && (
          <CreateGossipModal
            gossipToEdit={editingGossip}
            onClose={() => setEditingGossip(null)}
            onUpdate={handleGossipUpdated}
          />
        )}
        {selectedGossip && (
          <GossipDetailModal
            gossip={selectedGossip}
            onClose={() => setSelectedGossip(null)}
            onBookmarkToggle={fetchBookmarkedGossips}
            onGossipDeleted={handleGossipDeleted}
            onReactionChange={handleReactionChange}
            followMap={followMap}
            onFollowChange={handleFollowToggle}
          />
        )}
      </Suspense>

      <TopBar title="Gossip" subtitle="Hot takes & industry buzz" />

      {loading ? (
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-5 md:pt-8 pb-32 sm:pb-24 md:pb-16">
          <div className="mb-8 p-4 md:p-6 rounded-[24px] bg-[#12121e] border-l-8 border-white/10 flex gap-4 items-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/[0.06] rounded w-40" />
              <div className="h-3 bg-white/[0.04] rounded w-72" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="col-span-1 lg:col-span-8 xl:col-span-9">
              <div className="flex items-center justify-between mb-6 animate-pulse">
                <div>
                  <div className="h-8 bg-white/[0.06] rounded w-48 mb-2" />
                  <div className="h-3 bg-white/[0.04] rounded w-64" />
                </div>
                <div className="h-9 w-32 bg-white/[0.06] rounded-lg" />
              </div>
              <div className="flex gap-2 mb-6 animate-pulse">
                <div className="h-9 w-24 bg-white/[0.06] rounded-full" />
                <div className="h-9 w-36 bg-white/[0.04] rounded-full" />
              </div>
              <FeedSkeleton />
            </div>
            <aside className="hidden lg:flex flex-col col-span-1 lg:col-span-4 xl:col-span-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-[24px] bg-[#12121e] border border-white/5 animate-pulse"
                >
                  <div className="h-5 bg-white/[0.06] rounded w-28 mb-6" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 bg-white/[0.04] rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-5 md:pt-8 pb-32 sm:pb-24 md:pb-16">
          {/* Rumor & Safety Protocol Alert */}
          <div className="mb-8 p-4 md:p-6 rounded-[24px] bg-[#12121e] border-l-8 border-[#f5c518] flex gap-4 md:gap-6 items-start md:items-center shadow-2xl">
            <AlertTriangle size={28} className="text-[#f5c518] shrink-0 md:size-[32px]" />
            <div className="flex-1">
              <h4 className="text-[#f5c518] font-black uppercase tracking-widest text-xs md:text-sm mb-1 flex items-center gap-2">
                UNVERIFIED COMMUNITY RUMORS & SPECULATION <span className="bg-white/10 text-white font-mono px-2 py-0.5 rounded text-[10px]">UGC Protocol</span>
              </h4>
              <p className="text-xs text-white/50 font-medium leading-relaxed">
                All posts below are user-generated rumors, fan theories, and speculation. Content is governed by automated safety screening, PII protection, and community moderation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* ── Main column ── */}
            <div className="col-span-1 lg:col-span-8 xl:col-span-9 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h1 className="font-['Bebas_Neue'] text-[28px] sm:text-[36px] tracking-[2px] text-[#f0f0f8] m-0 leading-none">
                    {activeTab === "feed" ? "Gossip Feed" : "My Gossips"}
                  </h1>
                  <p className="font-sans text-xs sm:text-sm text-[rgba(240,240,248,0.4)] mt-[6px] mb-0 font-light">
                    {activeTab === "feed"
                      ? "Hot takes, casting buzz, industry drama — fresh every hour"
                      : "Your spilled tea — manage & showcase"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (requireAuth("Sign in to drop your own gossip and join the conversation!"))
                      return;
                    setCreating(true);
                  }}
                  className="flex items-center gap-2 flex-shrink-0 rounded-lg px-3 sm:px-4 py-2 font-sans text-[12px] sm:text-[13px] font-bold text-[#080810] cursor-pointer w-full sm:w-auto justify-center sm:justify-start transition-transform"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 4px 16px ${ACCENT}40`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <Plus size={14} /> Drop Gossip
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setActiveTab("feed");
                    setActivecat("all");
                  }}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "feed" ? "bg-[#f5c518] text-[#080810]" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  🔥 Feed
                </button>
                <button
                  onClick={() => {
                    if (requireAuth("Sign in to manage your own gossips and see your spilled tea!"))
                      return;
                    setActiveTab("my-gossips");
                  }}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "my-gossips" ? "bg-[#f5c518] text-[#080810]" : "bg-white/10 text-white hover:bg-white/20"}`}
                >
                  ✍️ My Gossips ({myGossips.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  placeholder={
                    activeTab === "feed"
                      ? "Search gossips by headline, tag, category, source…"
                      : "Search your gossips…"
                  }
                />
              </div>

              {/* Category filter — feed only */}
              {activeTab === "feed" && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {CATS_FILTER.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryClick(cat)}
                      disabled={categoryLoading}
                      className={`rounded-full px-3 py-[5px] text-[11px] whitespace-nowrap transition-all duration-150 font-sans cursor-pointer flex items-center gap-1.5 ${activecat === cat.value ? "font-bold" : "font-normal"} ${categoryLoading && activecat === cat.value ? "opacity-80" : ""}`}
                      style={{
                        background:
                          activecat === cat.value ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${activecat === cat.value ? ACCENT + "50" : "rgba(255,255,255,0.09)"}`,
                        color: activecat === cat.value ? ACCENT : "rgba(240,240,248,0.55)",
                      }}
                    >
                      {categoryLoading && activecat === cat.value ? (
                        <>
                          <Loader2 size={11} className="animate-spin" />
                          <span>{cat.label}</span>
                        </>
                      ) : (
                        cat.label
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Search result hint */}
              {debouncedSearch.trim() && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-[11px] text-white/30 font-medium">
                    {filtered.length === 0
                      ? "No results"
                      : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}{" "}
                    for <span className="text-[#f5c518]/70 font-bold">"{debouncedSearch}"</span>
                  </span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[10px] text-white/20 hover:text-white/50 underline underline-offset-2 transition-colors"
                  >
                    clear
                  </button>
                </div>
              )}

              {/* Feed */}
              <div className="flex flex-col gap-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-16 text-white/30 text-sm font-medium">
                    {debouncedSearch.trim()
                      ? `No gossips found matching "${debouncedSearch}".`
                      : activeTab === "feed"
                        ? "No gossips found in this category."
                        : "You haven't dropped any gossips yet. Create one!"}
                  </div>
                ) : (
                  filtered.map((g) => (
                    <GossipCardItem
                      key={g.id}
                      gossip={g}
                      onCardClick={handleCardClick}
                      onDelete={handleGossipDeleted}
                      onReactionChange={handleReactionChange}
                      onEdit={(gossip) => setEditingGossip(gossip)}
                      isMyGossip={activeTab === "my-gossips" || !!g.is_my_gossip || !!g.is_mine}
                      isFollowing={g.owners_id ? (followMap[g.owners_id] ?? false) : false}
                      onFollowToggle={handleFollowToggle}
                      onRequireAuth={requireAuth}
                      onToast={showToast}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Desktop Sticky Sidebar */}
            <aside className="hidden lg:flex flex-col col-span-1 lg:col-span-4 xl:col-span-3 gap-6 sticky top-[120px] h-fit max-h-[calc(100vh-140px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <Sidebar
                heatItems={heatItems}
                breakdownStats={breakdownStats}
                bookmarkedGossips={bookmarkedGossips}
                onGossipClick={handleCardClick}
              />
            </aside>

            {/* Mobile Drawer Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden fixed bottom-24 sm:bottom-20 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-[#f5c518] to-[#eab308] text-[#080810] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-20"
              title="Open insights panel"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      )}

      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        heatItems={heatItems}
        breakdownStats={breakdownStats}
        bookmarkedGossips={bookmarkedGossips}
        onGossipClick={handleCardClick}
      />
    </div>
  );
}

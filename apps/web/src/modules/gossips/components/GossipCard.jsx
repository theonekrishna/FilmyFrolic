import { useState, useEffect, useCallback, useRef, memo } from "react";
import { CAT_CONFIG } from "../data/gossips";
import { MessageSquare, Share2, Bookmark, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { privateAxios } from "../../../utils/AxiosInstance";
import { ReportButton } from "../../Reports";

const ACCENT = "#f5c518";
const DEFAULT_CAT = { label: "Gossip", emoji: "💬", color: "#9333ea" };

function fmtCount(n) {
  const num = parseInt(n, 10) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return String(num);
}

// ── LazyImage ─────────────────────────────────────────────────────────────────
const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  style,
  onError,
  containerClassName,
  containerStyle,
}) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src || !imgRef.current) return;
    const el = imgRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  if (errored) return null;

  return (
    <div className={containerClassName} style={containerStyle}>
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

// ── GossipCard ────────────────────────────────────────────────────────────────
const GossipCard = memo(function GossipCard({
  gossip,
  onBookmark,
  onFire,
  onCardClick,
  onDelete,
  isMyGossip = false,
}) {
  if (!gossip) return null;

  const cfg = CAT_CONFIG[gossip?.category] || DEFAULT_CAT;

  const [fireCount, setFireCount] = useState(() => parseInt(gossip.fire, 10) || 0);
  const [shockedCount, setShockedCount] = useState(() => parseInt(gossip.shocked, 10) || 0);
  const [firedByMe, setFiredByMe] = useState(() => gossip.userFired || false);
  const [shockedByMe, setShockedByMe] = useState(() => gossip.userShocked || false);

  const [loadingFire, setLoadingFire] = useState(false);
  const [loadingShocked, setLoadingShocked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => gossip.bookmarked || false);
  const [shareToast, setShareToast] = useState(false);

  // Sync when gossip prop changes
  useEffect(() => {
    setFireCount(parseInt(gossip.fire, 10) || 0);
    setShockedCount(parseInt(gossip.shocked, 10) || 0);
    setFiredByMe(gossip.userFired || false);
    setShockedByMe(gossip.userShocked || false);
    setBookmarked(gossip.bookmarked || false);
  }, [
    gossip.id,
    gossip.fire,
    gossip.shocked,
    gossip.bookmarked,
    gossip.userFired,
    gossip.userShocked,
  ]);

  const handleFire = useCallback(
    async (e) => {
      e.stopPropagation();
      if (loadingFire) return;
      const wasOn = firedByMe;
      setFiredByMe(!wasOn);
      setFireCount((prev) => (wasOn ? Math.max(0, prev - 1) : prev + 1));
      setLoadingFire(true);
      try {
        await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
          reaction: "fire",
        });
        onFire?.(gossip.id);
      } catch {
        setFiredByMe(wasOn);
        setFireCount((prev) => (wasOn ? prev + 1 : Math.max(0, prev - 1)));
      } finally {
        setLoadingFire(false);
      }
    },
    [firedByMe, loadingFire, gossip.id, onFire]
  );

  const handleShocked = useCallback(
    async (e) => {
      e.stopPropagation();
      if (loadingShocked) return;
      const wasOn = shockedByMe;
      setShockedByMe(!wasOn);
      setShockedCount((prev) => (wasOn ? Math.max(0, prev - 1) : prev + 1));
      setLoadingShocked(true);
      try {
        await privateAxios.post(`/api/gossips/${gossip.id}/react`, {
          reaction: "shocked",
        });
      } catch {
        setShockedByMe(wasOn);
        setShockedCount((prev) => (wasOn ? prev + 1 : Math.max(0, prev - 1)));
      } finally {
        setLoadingShocked(false);
      }
    },
    [shockedByMe, loadingShocked, gossip.id]
  );

  const handleBookmark = useCallback(
    async (e) => {
      e.stopPropagation();
      if (loadingBookmark) return;
      const wasBookmarked = bookmarked;
      setBookmarked(!wasBookmarked);
      setLoadingBookmark(true);
      try {
        await privateAxios.post(`/api/gossips/${gossip.id}/bookmark`);
        onBookmark?.(gossip.id);
      } catch {
        setBookmarked(wasBookmarked);
      } finally {
        setLoadingBookmark(false);
      }
    },
    [bookmarked, loadingBookmark, gossip.id, onBookmark]
  );

  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();
      setDeleting(true);
      try {
        await privateAxios.delete(`/api/gossips/${gossip.id}`);
        onDelete?.(gossip.id);
      } catch (err) {
        console.error("Delete failed:", err.message);
        alert("Failed to delete gossip");
      } finally {
        setDeleting(false);
      }
    },
    [gossip.id, onDelete]
  );

  const handleShare = useCallback(
    async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/gossips/${gossip.id}`);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      } catch (err) {
        console.error("Share failed:", err.message);
      }
    },
    [gossip.id]
  );

  const handleCardClick = useCallback(() => onCardClick?.(gossip), [onCardClick, gossip]);

  const imageUrl = gossip.image_url || gossip.image || null;

  return (
    <article
      className="relative bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] overflow-hidden cursor-pointer"
      style={{ transition: "border-color 0.15s, transform 0.15s" }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${cfg.color}30`;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Category accent bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}44)`,
        }}
      />

      {/* Lazy image */}
      {imageUrl && (
        <LazyImage
          src={imageUrl}
          alt={gossip.headline || ""}
          className="w-full h-full object-cover block"
          containerClassName="h-[180px] overflow-hidden bg-white/[0.03] relative"
        />
      )}

      {/* Delete button for my gossips */}
      {isMyGossip && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 rounded-full p-2 transition-colors z-10"
          title="Delete"
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin text-white" />
          ) : (
            <Trash2 size={14} className="text-white" />
          )}
        </button>
      )}

      <div className="p-[14px_16px]">
        {/* Category + verified + time */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span
            className="flex items-center gap-1.5 rounded-full px-[10px] py-[3px] font-[Outfit] text-[10px] font-bold"
            style={{
              background: `${cfg.color}15`,
              border: `1px solid ${cfg.color}40`,
              color: cfg.color,
            }}
          >
            {cfg.emoji} {cfg.label.toUpperCase()}
          </span>
          {gossip.verified && (
            <span className="flex items-center gap-[3px] font-[Outfit] text-[10px] font-semibold text-[#2ecc71]">
              <CheckCircle size={11} fill="#2ecc71" color="#2ecc71" /> VERIFIED
            </span>
          )}
          <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.3)] ml-auto">
            {gossip.timeAgo || "recently"}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-[Outfit] text-[15px] font-bold text-[#f0f0f8] mb-2 leading-[1.4]">
          {gossip.headline || "Untitled Gossip"}
        </h3>

        {/* Excerpt */}
        <p
          className="font-[Outfit] text-[13px] font-light text-[rgba(240,240,248,0.55)] mb-3 leading-[1.6]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {gossip.excerpt || gossip.headline || "No description available"}
        </p>

        {/* Tags */}
        {gossip.tags && gossip.tags.length > 0 && (
          <div className="flex flex-wrap gap-[5px] mb-3">
            {gossip.tags.map((t, index) => (
              <span
                key={index}
                className="font-[Outfit] text-[10px] rounded-full px-[8px] py-[2px]"
                style={{
                  color: ACCENT,
                  background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}25`,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Source */}
        {gossip.source && (
          <div className="font-[Outfit] text-[11px] italic text-[rgba(240,240,248,0.28)] mb-3">
            {gossip.source}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center border-t border-[rgba(255,255,255,0.06)] pt-2.5">
          {/* 🔥 Fire */}
          <button
            onClick={handleFire}
            disabled={loadingFire}
            className="flex-1 flex items-center justify-center gap-1 h-8 bg-transparent border-none cursor-pointer font-[Outfit] text-[12px] select-none transition-colors"
            style={{ color: firedByMe ? "#e84545" : "rgba(240,240,248,0.4)" }}
          >
            {loadingFire ? (
              <Loader2 size={13} className="animate-spin" style={{ color: "#e84545" }} />
            ) : (
              <span
                style={{
                  fontSize: 15,
                  lineHeight: 1,
                  display: "inline-block",
                  filter: firedByMe ? "drop-shadow(0 0 5px #e84545)" : "none",
                  transform: firedByMe ? "scale(1.25)" : "scale(1)",
                  transition: "transform 0.15s, filter 0.15s",
                }}
              >
                🔥
              </span>
            )}
            <span className="font-black tabular-nums">{fmtCount(fireCount)}</span>
          </button>

          {/* 😱 Shocked */}
          <button
            onClick={handleShocked}
            disabled={loadingShocked}
            className="flex-1 flex items-center justify-center gap-1 h-8 bg-transparent border-none cursor-pointer font-[Outfit] text-[12px] select-none transition-colors"
            style={{ color: shockedByMe ? "#f5c518" : "rgba(240,240,248,0.4)" }}
          >
            {loadingShocked ? (
              <Loader2 size={13} className="animate-spin" style={{ color: "#f5c518" }} />
            ) : (
              <span
                style={{
                  fontSize: 15,
                  lineHeight: 1,
                  display: "inline-block",
                  transform: shockedByMe ? "scale(1.25)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              >
                😱
              </span>
            )}
            <span className="font-black tabular-nums">{fmtCount(shockedCount)}</span>
          </button>

          {/* 💬 Comments */}
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 h-8 bg-transparent border-none cursor-pointer font-[Outfit] text-[12px] text-[rgba(240,240,248,0.4)]"
          >
            <MessageSquare size={14} />
            <span className="tabular-nums">{fmtCount(gossip.comments)}</span>
          </button>

          {/* 🔗 Share */}
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center h-8 bg-transparent border-none cursor-pointer font-[Outfit] text-[12px] text-[rgba(240,240,248,0.4)] hover:text-[#f5c518] transition-colors"
          >
            <Share2 size={14} />
          </button>

          {/* 🔖 Bookmark */}
          <button
            onClick={handleBookmark}
            disabled={loadingBookmark}
            className="flex-1 flex items-center justify-center h-8 bg-transparent border-none cursor-pointer transition-all"
            style={{ color: bookmarked ? ACCENT : "rgba(240,240,248,0.4)" }}
          >
            {loadingBookmark ? (
              <Loader2 size={13} className="animate-spin" style={{ color: ACCENT }} />
            ) : (
              <Bookmark
                size={14}
                fill={bookmarked ? ACCENT : "none"}
                color={bookmarked ? ACCENT : "rgba(240,240,248,0.4)"}
                style={{
                  transform: bookmarked ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              />
            )}
          </button>

          {/* 🚩 Report */}
          {!isMyGossip && (
            <div className="flex-1 flex items-center justify-center h-8">
              <ReportButton
                moduleType="gossip"
                targetId={String(gossip.id)}
                targetUserId={gossip.owners_id ? String(gossip.owners_id) : undefined}
                contentPreview={gossip.headline}
                isLoggedIn={true}
                size="sm"
                variant="icon"
              />
            </div>
          )}
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="absolute top-3 right-3 bg-[#2ecc71] text-[#12121e] px-3 py-1.5 rounded-lg font-[Outfit] text-[12px] font-semibold flex items-center gap-1.5 shadow-lg z-50">
          <CheckCircle size={13} />
          Link copied!
        </div>
      )}
    </article>
  );
});

export default GossipCard;

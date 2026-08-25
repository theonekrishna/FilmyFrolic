import { History, Trash2, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import SettingsLoader from "../components/SettingsLoader";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";

const ACCENT = "#f5c518";

// ── LazyImage ─────────────────────────────────────────────────────────────────
const LazyImage = memo(function LazyImage({ src, alt, style, containerStyle, onError }) {
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

  if (errored) {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Film size={20} style={{ opacity: 0.3 }} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", ...containerStyle }}>
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.04)",
            animation: "pulse 2s infinite",
          }}
        />
      )}
      <img
        ref={imgRef}
        alt={alt}
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

// ── formatters (module-level, avoid recreation) ─────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatProgress(progress) {
  if (!progress) return "";
  return `${Math.round(progress)}% watched`;
}

// ── HistoryItem ───────────────────────────────────────────────────────────────
const HistoryItem = memo(function HistoryItem({ item, isLast, onDelete }) {
  const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);

  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LazyImage
          src={item.poster_url}
          alt={item.movie_title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          containerStyle={{
            width: 60,
            height: 90,
            borderRadius: 8,
            overflow: "hidden",
            background: "#1a1a2a",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              color: "#f0f0f8",
            }}
          >
            {item.movie_title || "Unknown Title"}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.5)",
              marginTop: 4,
            }}
          >
            Watched on {formatDate(item.watched_at)}
          </div>
          {item.progress > 0 && (
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 11,
                color: ACCENT,
                marginTop: 4,
              }}
            >
              {formatProgress(item.progress)}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          padding: "8px",
          background: hovered ? "rgba(232,69,69,0.1)" : "transparent",
          border: "none",
          borderRadius: 6,
          color: hovered ? "#e84545" : "rgba(240,240,248,0.4)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});

export default function WatchHistoryPage({ inModal = false, onClose }) {
  const toastApi = useToast();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      // Only cache first page (offset === 0)
      const cacheKey = offset === 0 ? CACHE_KEYS.WATCH_HISTORY : null;
      const cached = cacheKey ? settingsCache.get(cacheKey) : null;

      if (cached && offset === 0) {
        setLoading(false);
        const historyData = cached?.history || cached;
        const items = Array.isArray(historyData) ? historyData : [];
        setHistory(items);
        setHasMore(items.length === limit);
      } else {
        setLoading(true);
      }

      const res = cacheKey
        ? await settingsCache.fetchWithCache(
            cacheKey,
            () => settingsService.getWatchHistory(limit, offset),
            { staleWhileRevalidate: offset === 0 }
          )
        : await settingsService.getWatchHistory(limit, offset);
      const historyData = res?.history || res;
      const items = Array.isArray(historyData) ? historyData : [];
      setHistory(items);
      setHasMore(items.length === limit);
    } catch (err) {
      console.error("Error loading watch history:", err);
      toastApi.error("Error", "Failed to load watch history", 3000);
    } finally {
      setLoading(false);
    }
  }, [offset, limit, toastApi]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!window.confirm("Remove this item from your watch history?")) return;

      try {
        await settingsService.deleteHistoryRecord(itemId);
        setHistory((prev) => prev.filter((item) => item.id !== itemId));
        toastApi.success("Item Removed", "The item has been removed from your history.", 3000);
      } catch (err) {
        console.error("Error deleting history item:", err);
        toastApi.error("Error", "Failed to remove item", 3000);
      }
    },
    [toastApi]
  );

  const handleClearAll = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear ALL watch history? This cannot be undone."))
      return;

    try {
      setClearing(true);
      await settingsService.clearAllHistory();
      setHistory([]);
      toastApi.success("History Cleared", "Your watch history has been cleared.", 3000);
    } catch (err) {
      console.error("Error clearing history:", err);
      toastApi.error("Error", "Failed to clear history", 3000);
    } finally {
      setClearing(false);
    }
  }, [toastApi]);

  const handlePrevPage = useCallback(() => {
    setOffset((prev) => Math.max(0, prev - limit));
  }, [limit]);

  const handleNextPage = useCallback(() => {
    setOffset((prev) => (hasMore ? prev + limit : prev));
  }, [hasMore, limit]);

  if (loading && offset === 0) {
    return <SettingsLoader text="Loading watch history..." />;
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header - hidden in modal */}
      {!inModal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 20,
            padding: "16px 20px",
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}18`,
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <History size={20} color={ACCENT} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 20,
                  letterSpacing: 2,
                  color: "#f0f0f8",
                  lineHeight: 1,
                }}
              >
                Watch History
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.38)",
                  marginTop: 2,
                }}
              >
                Your viewing activity
              </div>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(232,69,69,0.5)",
                borderRadius: 8,
                color: "#e84545",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: clearing ? 0.6 : 1,
              }}
            >
              <Trash2 size={14} />
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          )}
        </div>
      )}

      {/* History List */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            <Film size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>No watch history</p>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                marginTop: 8,
                opacity: 0.6,
              }}
            >
              Movies and shows you watch will appear here
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.map((item, index) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  isLast={index === history.length - 1}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <button
                onClick={handlePrevPage}
                disabled={offset === 0 || loading}
                style={{
                  padding: "8px 16px",
                  background: offset === 0 ? "transparent" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: offset === 0 ? "rgba(240,240,248,0.3)" : "#f0f0f8",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  cursor: offset === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.5)",
                }}
              >
                Page {Math.floor(offset / limit) + 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!hasMore || loading}
                style={{
                  padding: "8px 16px",
                  background: !hasMore ? "transparent" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: !hasMore ? "rgba(240,240,248,0.3)" : "#f0f0f8",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  cursor: !hasMore ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {!inModal && <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />}
    </div>
  );
}

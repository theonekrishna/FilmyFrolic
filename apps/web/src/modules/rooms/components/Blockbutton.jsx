// ─────────────────────────────────────────────
// BlockButton.jsx
// Drop-in block/unblock button for any room card.
//
// Props:
//   ownerId   — string | null   the user to block
//   isOwner   — bool            hide when viewing own room
//   isLoggedIn — bool
//   onBlocked — fn(ownerId)     called after a successful block
//                               so parent (Rooms.jsx) can hide the card
// ─────────────────────────────────────────────
import { useState, useEffect } from "react";
import { privateAxios } from "../../../utils/AxiosInstance";
import { getBlockCache, setBlockCache, subscribeBlock } from "./Blockcache";

// ── Undo toast ────────────────────────────────
function UndoToast({ visible, onUndo, onDismiss }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        background: "rgba(18,18,30,0.97)",
        border: "1px solid rgba(232,69,69,0.4)",
        color: "#f0f0f8",
        padding: "11px 20px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        whiteSpace: "nowrap",
        animation: "undoToastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        pointerEvents: "auto",
      }}
    >
      <style>{`
        @keyframes undoToastIn {
          from { opacity:0; transform: translateX(-50%) translateY(10px) scale(0.95); }
          to   { opacity:1; transform: translateX(-50%) translateY(0)    scale(1);    }
        }
      `}</style>
      <span style={{ color: "rgba(240,240,248,0.6)", fontSize: "12px" }}>🚫 User blocked</span>
      <button
        onClick={onUndo}
        style={{
          background: "rgba(59,130,246,0.18)",
          border: "1px solid rgba(59,130,246,0.45)",
          color: "#93c5fd",
          padding: "4px 13px",
          borderRadius: "7px",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Undo
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────
export default function BlockButton({ ownerId, isOwner, isLoggedIn, onBlocked }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  // ── Hydrate from cache or API ──────────────
  useEffect(() => {
    if (isOwner || !isLoggedIn || !ownerId) {
      setDataReady(true);
      return;
    }
    const cached = getBlockCache(ownerId);
    if (cached !== undefined) {
      setIsBlocked(cached);
      setDataReady(true);
      return;
    }
    // No cache — fetch
    privateAxios
      .get(`/api/settings/blocked`)
      .then((res) => {
        const list = res.data?.data || res.data?.blocked || [];
        // list is an array of blocked user objects or IDs
        const blockedIds = list.map((u) =>
          typeof u === "string" ? u : u.user_id || u._id || u.id
        );
        const val = blockedIds.includes(ownerId);
        setBlockCache(ownerId, val);
        setIsBlocked(val);
      })
      .catch(() => {})
      .finally(() => setDataReady(true));
  }, [ownerId, isOwner, isLoggedIn]);

  // ── Subscribe to cross-card cache changes ──
  useEffect(() => {
    if (!ownerId) return;
    return subscribeBlock(ownerId, (val) => setIsBlocked(val));
  }, [ownerId]);

  // ── Block handler ──────────────────────────
  const handleBlock = async (e) => {
    e.stopPropagation();
    if (!ownerId || loading) return;
    try {
      setLoading(true);
      await privateAxios.post(`/api/settings/blocked`, { userId: ownerId });
      setBlockCache(ownerId, true);
      setIsBlocked(true);
      setShowUndo(true);
      onBlocked?.(ownerId); // tell Rooms.jsx to hide this card
    } catch (err) {
      console.error("Block error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Unblock handler (undo) ─────────────────
  const handleUnblock = async () => {
    if (!ownerId || loading) return;
    try {
      setLoading(true);
      await privateAxios.delete(`/api/settings/blocked/${ownerId}`);
      setBlockCache(ownerId, false);
      setIsBlocked(false);
      setShowUndo(false);
      // No need to call onBlocked — card will reappear via parent re-render
    } catch (err) {
      console.error("Unblock error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Don't render for own rooms or non-logged-in ──
  if (isOwner || !isLoggedIn || !ownerId || !dataReady) return null;

  // If already blocked (persisted from a previous session), show a small
  // "Blocked" pill instead of the full button — the card will normally be
  // hidden by the parent filter, but keep this as a safety fallback.
  if (isBlocked && !showUndo) return null;

  return (
    <>
      <UndoToast visible={showUndo} onUndo={handleUnblock} onDismiss={() => setShowUndo(false)} />

      {/* Only show the block button when user is NOT already blocked */}
      {!isBlocked && (
        <button
          onClick={handleBlock}
          disabled={loading}
          title="Block this user"
          className="flex items-center justify-center gap-[5px] rounded-[9px] py-[9px] text-[12px] font-semibold mb-2 w-full transition-all duration-200"
          style={{
            background: "rgba(232,69,69,0.07)",
            border: "1px solid rgba(232,69,69,0.22)",
            color: "rgba(252,129,129,0.7)",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,69,69,0.13)";
            e.currentTarget.style.borderColor = "rgba(232,69,69,0.38)";
            e.currentTarget.style.color = "#fc8181";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232,69,69,0.07)";
            e.currentTarget.style.borderColor = "rgba(232,69,69,0.22)";
            e.currentTarget.style.color = "rgba(252,129,129,0.7)";
          }}
        >
          {loading ? (
            <>
              <span
                className="w-[10px] h-[10px] rounded-full border-2 border-[#fc8181]/30 border-t-[#fc8181] inline-block"
                style={{ animation: "blkSpin 0.7s linear infinite" }}
              />
              <style>{`@keyframes blkSpin{to{transform:rotate(360deg)}}`}</style>
              Blocking…
            </>
          ) : (
            <>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Block User
            </>
          )}
        </button>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  BellOff,
  ShieldAlert,
  AlertTriangle,
  Shield,
  Megaphone,
  Info,
  RefreshCw,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchLatestNotifications,
  fetchWarningNotifications,
  fetchRemovedNotifications,
} from "./service";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const mergeAndSort = (all, warnings, removed) => {
  const seen = new Set();
  const combined = [];
  [...all, ...warnings, ...removed].forEach((n) => {
    if (!n?.id || seen.has(n.id)) return;
    seen.add(n.id);
    combined.push(n);
  });
  return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const resolveAccentHex = (rawAccent) => {
  const map = {
    red: "#ef4444",
    danger: "#ef4444",
    yellow: "#eab308",
    warning: "#f59e0b",
    blue: "#3b82f6",
    green: "#22c55e",
  };
  return map[(rawAccent || "").toLowerCase()] ?? "#a855f7";
};

const cardClass = (rawAccent) => {
  const a = (rawAccent || "").toLowerCase();
  if (a === "red" || a === "danger")
    return "bg-gradient-to-r from-[#1a0808] to-[#0c0c16] border-red-500/15 hover:border-red-500/30";
  if (a === "yellow" || a === "warning")
    return "bg-gradient-to-r from-[#1c1408] to-[#0c0c16] border-amber-500/15 hover:border-amber-500/30";
  if (a === "blue")
    return "bg-gradient-to-r from-[#08142c] to-[#0c0c16] border-blue-500/15 hover:border-blue-500/30";
  if (a === "green")
    return "bg-gradient-to-r from-[#082014] to-[#0c0c16] border-green-500/15 hover:border-green-500/30";
  return "bg-gradient-to-r from-[#141226] to-[#0c0c16] border-purple-500/15 hover:border-purple-500/30";
};

// ─────────────────────────────────────────────────────────────────────────────
// Panel — no TopBar, no outer shell. Composed by pages/Notifications.jsx
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelRef = useRef(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const load = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [all, warnings, removed] = await Promise.all([
        fetchLatestNotifications(20),
        fetchWarningNotifications(),
        fetchRemovedNotifications(),
      ]);
      setNotifications(
        mergeAndSort(
          Array.isArray(all) ? all : [],
          Array.isArray(warnings) ? warnings : [],
          Array.isArray(removed) ? removed : []
        )
      );
    } catch {
      setError("Failed to load admin notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Supabase Realtime — admin_notifications INSERT ───────────────────────
  useEffect(() => {
    if (!userId) return;
    channelRef.current = supabase
      .channel("admin-notifs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        (payload) => {
          const n = payload?.new;
          if (!n) return;
          const isTargeted = n.receiver_id === userId;
          const isPublic = !n.receiver_id;
          if (isTargeted || isPublic) {
            setNotifications((prev) => {
              if (prev.some((x) => x.id === n.id)) return prev;
              return [n, ...prev];
            });
          }
        }
      )
      .subscribe((status) => console.log("[Realtime] Admin notifications:", status));

    return () => {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [userId]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Sub-header */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-white/30 font-outfit">
          System alerts, warnings &amp; broadcasts from admins
        </p>
        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all disabled:opacity-40"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[76px] rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center py-14 px-4 rounded-2xl border border-dashed border-red-500/20 bg-red-500/[0.03]">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
            <AlertTriangle size={18} />
          </div>
          <p className="text-[13px] text-red-400/80 font-outfit font-medium text-center mb-3">
            {error}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] font-semibold font-outfit hover:bg-red-500/20 transition-all"
          >
            <RefreshCw size={12} /> Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center py-16 px-4 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
          <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30 mb-3">
            <BellOff size={18} />
          </div>
          <p className="text-[13px] text-white/40 font-outfit font-medium text-center">
            No admin notifications
          </p>
          <p className="text-[11px] text-white/25 font-outfit text-center mt-1">
            Warnings, announcements and system alerts will appear here.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const rawAccent = (n.accent || "purple").toLowerCase();
            const hex = resolveAccentHex(rawAccent);
            const isRead = n.is_read !== false;
            const isWarning = n.type === "warning";
            const isRemoved = n.type === "content_removed";
            const isBan = n.type === "ban";

            return (
              <div
                key={n.id}
                className={`relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border transform hover:scale-[1.01] ${cardClass(rawAccent)}`}
              >
                {/* Icon */}
                <div className="shrink-0">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl border overflow-hidden p-1.5"
                    style={{ background: `${hex}25`, borderColor: `${hex}50` }}
                  >
                    <img src="/favicon.svg" alt="Admin" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span
                        className={`text-[13.5px] font-outfit truncate ${isRead ? "text-white/60 font-medium" : "text-white font-semibold"}`}
                      >
                        {n.title}
                      </span>

                      {/* Admin badge — always shown */}
                      <span className="flex items-center gap-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                        <ShieldAlert size={9} /> Admin
                      </span>

                      {isWarning && (
                        <span className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                          <AlertTriangle size={9} /> Warning
                        </span>
                      )}
                      {isRemoved && (
                        <span className="flex items-center gap-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                          <Shield size={9} /> Removed
                        </span>
                      )}
                      {isBan && (
                        <span className="flex items-center gap-0.5 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                          <Shield size={9} /> Ban
                        </span>
                      )}
                      {n.type === "announcement" && (
                        <span className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                          <Megaphone size={9} /> Announcement
                        </span>
                      )}
                      {n.type === "info" && (
                        <span className="flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                          <Info size={9} /> Info
                        </span>
                      )}
                      {!isWarning &&
                        !isRemoved &&
                        !isBan &&
                        n.type &&
                        n.type !== "info" &&
                        n.type !== "announcement" && (
                          <span className="flex items-center gap-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-[1px] rounded-md shrink-0">
                            {n.type}
                          </span>
                        )}
                    </div>
                    <span className="text-[11px] text-white/30 shrink-0 font-outfit">
                      {getTimeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/45 leading-relaxed font-outfit font-normal break-words">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

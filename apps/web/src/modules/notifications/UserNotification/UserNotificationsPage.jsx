import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BellOff,
  CheckCheck,
  Trash2,
  X,
  RefreshCw,
  UserPlus,
  MessageSquare,
  MessageCircle,
  Heart,
  ThumbsUp,
  Trophy,
  Bell,
  Users,
  Shield,
  Megaphone,
  Radio,
  Hand,
  Smile,
  Flame,
  Reply,
  Sparkles,
  Zap,
  Info,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "./service";

// ─── Lucide icon resolver ─────────────────────────────────────────────────────
const ICON_MAP = {
  UserPlus,
  MessageSquare,
  MessageCircle,
  Heart,
  ThumbsUp,
  Trophy,
  Bell,
  Users,
  Shield,
  Megaphone,
  Radio,
  Hand,
  Smile,
  Flame,
  Reply,
  Sparkles,
  Zap,
  Info,
  AlertTriangle,
  Trash2,
};

const resolveIcon = (iconStr, type) => {
  if (iconStr && ICON_MAP[iconStr]) {
    const Icon = ICON_MAP[iconStr];
    return <Icon size={15} />;
  }
  const fallback = {
    follow: <UserPlus size={15} />,
    feed_comment: <MessageCircle size={15} />,
    feed_reply: <Reply size={15} />,
    meme_upvote: <ThumbsUp size={15} />,
    meme_comment: <MessageCircle size={15} />,
    meme_reply: <Reply size={15} />,
    gossip_reaction: <Flame size={15} />,
    gossip_comment: <MessageCircle size={15} />,
    gossip_reply: <Reply size={15} />,
    community_join: <Users size={15} />,
    room_join: <Radio size={15} />,
    room_hand_raised: <Hand size={15} />,
    room_role_changed: <Shield size={15} />,
    game_achievement: <Trophy size={15} />,
    new_message: <MessageSquare size={15} />,
    moderation_warning: <AlertTriangle size={15} />,
    content_removed: <Trash2 size={15} />,
    admin_broadcast: <Megaphone size={15} />,
    system: <Sparkles size={15} />,
  };
  return fallback[type] || <Bell size={15} />;
};

const toHex = (accent) => {
  if (!accent) return "#7c5cfc";
  if (accent.startsWith("#")) return accent;
  const MAP = {
    purple: "#a855f7",
    blue: "#3b82f6",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#eab308",
    pink: "#ec4899",
    orange: "#f97316",
    amber: "#f59e0b",
    violet: "#7c5cfc",
  };
  return MAP[accent.toLowerCase()] ?? "#7c5cfc";
};

const cardClass = (hex) => {
  const m = {
    "#ef4444": "from-[#1a0808] border-red-500/15 hover:border-red-500/30",
    "#f59e0b": "from-[#1c1408] border-amber-500/15 hover:border-amber-500/30",
    "#eab308": "from-[#1c1408] border-amber-500/15 hover:border-amber-500/30",
    "#3b82f6": "from-[#08142c] border-blue-500/15 hover:border-blue-500/30",
    "#22c55e": "from-[#082014] border-green-500/15 hover:border-green-500/30",
    "#ec4899": "from-[#200a14] border-pink-500/15 hover:border-pink-500/30",
    "#f97316": "from-[#1c0e06] border-orange-500/15 hover:border-orange-500/30",
    "#a855f7": "from-[#140e26] border-purple-500/15 hover:border-purple-500/30",
  };
  return `bg-gradient-to-r ${m[hex] ?? "from-[#141226] border-purple-500/15 hover:border-purple-500/30"} to-[#0c0c16]`;
};

const PRIORITY_RING = {
  critical: "ring-1 ring-red-500/30",
  high: "ring-1 ring-amber-500/20",
  normal: "",
  low: "",
};

const TYPE_BADGE = {
  follow: { label: "Follow", cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  feed_reaction: { label: "Reaction", cls: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
  feed_comment: { label: "Comment", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  feed_reply: { label: "Reply", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  meme_upvote: { label: "Upvote", cls: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  meme_reaction: { label: "Reaction", cls: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
  meme_comment: { label: "Comment", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  meme_reply: { label: "Reply", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  gossip_reaction: { label: "Reaction", cls: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
  gossip_comment: {
    label: "Comment",
    cls: "bg-violet-500/10 border-violet-500/30 text-violet-400",
  },
  gossip_reply: { label: "Reply", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  community_join: { label: "Community", cls: "bg-green-500/10 border-green-500/30 text-green-400" },
  post_reaction: { label: "Reaction", cls: "bg-pink-500/10 border-pink-500/30 text-pink-400" },
  room_join: { label: "Room", cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  room_hand_raised: { label: "Room", cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  room_role_changed: { label: "Role", cls: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  game_achievement: {
    label: "Achievement",
    cls: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  new_message: { label: "Message", cls: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  moderation_warning: { label: "Warning", cls: "bg-red-500/10 border-red-500/30 text-red-400" },
  content_removed: { label: "Removed", cls: "bg-red-500/10 border-red-500/30 text-red-400" },
  admin_broadcast: {
    label: "Broadcast",
    cls: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
  system: { label: "System", cls: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
};

const timeAgo = (d) => {
  if (!d) return "";
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "social", label: "Social" },
  { key: "system", label: "System" },
];
const SOCIAL = new Set([
  "follow",
  "feed_reaction",
  "feed_comment",
  "feed_reply",
  "meme_upvote",
  "meme_reaction",
  "meme_comment",
  "meme_reply",
  "gossip_reaction",
  "gossip_comment",
  "gossip_reply",
  "community_join",
  "post_reaction",
  "room_join",
  "room_hand_raised",
  "room_role_changed",
  "new_message",
]);
const SYSTEM = new Set(["game_achievement", "system"]);
const ADMIN_TYPES = new Set(["moderation_warning", "content_removed", "admin_broadcast"]);

// ─────────────────────────────────────────────────────────────────────────────
// Panel — no TopBar, no outer shell. Composed by pages/Notifications.jsx
// ─────────────────────────────────────────────────────────────────────────────
export default function UserNotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const channelRef = useRef(null);

  const unread = notifications.filter((n) => !n.is_read && !ADMIN_TYPES.has(n.type)).length;
  const filtered = notifications.filter((n) => {
    if (ADMIN_TYPES.has(n.type)) return false;
    if (filter === "unread") return !n.is_read;
    if (filter === "social") return SOCIAL.has(n.type);
    if (filter === "system") return SYSTEM.has(n.type);
    return true;
  });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications({ page: 1, limit: 50 });
      setNotifications(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Supabase Realtime — INSERT + UPDATE ──────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    channelRef.current = supabase
      .channel(`user-notifs-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload?.new;
          if (!n) return;
          setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload?.new;
          if (!n) return;
          setNotifications((prev) =>
            prev.map((x) => (x.id === n.id ? { ...x, is_read: n.is_read, read_at: n.read_at } : x))
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [userId]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleClick = async (n) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      try {
        await markNotificationRead(n.id);
      } catch {
        load();
      }
    }
    if (n.action_url) navigate(n.action_url);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      load();
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!unread || busy) return;
    setBusy(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      load();
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!notifications.length || busy) return;
    setBusy(true);
    setNotifications([]);
    try {
      await deleteAllNotifications();
    } catch {
      load();
    } finally {
      setBusy(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {/* Sub-header: unread count + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[11px] font-extrabold">
              {unread}
            </span>
          )}
          <span className="text-[12px] text-white/30 font-outfit">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all disabled:opacity-40"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          {unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 h-7 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-400 text-[11px] font-semibold font-outfit hover:bg-violet-500/20 transition-all disabled:opacity-40"
            >
              <CheckCheck size={11} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={busy}
              title="Clear all"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-all disabled:opacity-40"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold font-outfit transition-all border ${
              filter === f.key
                ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                : "bg-transparent border-white/[0.06] text-white/35 hover:text-white/60 hover:border-white/[0.12]"
            }`}
          >
            {f.label}
            {f.key === "unread" && unread > 0 && (
              <span className="ml-1 text-[10px] text-violet-400/80">{unread}</span>
            )}
          </button>
        ))}
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
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 px-4 rounded-2xl border border-dashed border-white/5 bg-white/[0.01]">
          <div className="w-11 h-11 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/30 mb-3">
            <BellOff size={18} />
          </div>
          <p className="text-[13px] text-white/40 font-outfit font-medium text-center">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-[11px] text-white/25 font-outfit text-center mt-1">
            {filter === "unread"
              ? "You're all caught up 🎉"
              : "Reactions, follows, comments and alerts will appear here."}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {filtered.map((n) => {
            const hex = toHex(n.accent);
            const isUnread = n.is_read === false;
            const badge = TYPE_BADGE[n.type];
            const actor = n.actor;
            const ring = PRIORITY_RING[n.priority] ?? "";

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`group relative flex gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-200 border transform hover:scale-[1.005] ${cardClass(hex)} ${isUnread ? ring : ""}`}
              >
                {isUnread && (
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                    style={{ background: hex }}
                  />
                )}

                {/* Avatar / icon */}
                <div className="shrink-0 mt-0.5">
                  {actor?.avatar_url ? (
                    <img
                      src={actor.avatar_url}
                      alt={actor.display_name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : actor?.initials ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold border border-white/10"
                      style={{
                        background: `${actor.avatar_color || hex}25`,
                        color: actor.avatar_color || hex,
                      }}
                    >
                      {actor.initials}
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl border"
                      style={{ background: `${hex}20`, borderColor: `${hex}40`, color: hex }}
                    >
                      {resolveIcon(n.icon, n.type)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span
                        className={`text-[13.5px] font-outfit truncate ${isUnread ? "text-white font-semibold" : "text-white/60 font-medium"}`}
                      >
                        {n.title}
                      </span>
                      {badge && (
                        <span
                          className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-[1px] rounded-md border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      )}
                      {n.priority === "critical" && (
                        <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-[1px] rounded-md border bg-red-500/15 border-red-500/40 text-red-400">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-white/30 font-outfit">
                        {timeAgo(n.created_at)}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        disabled={deletingId === n.id}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                  {actor?.display_name && (
                    <p className="text-[11.5px] font-outfit mb-0.5">
                      <span style={{ color: hex }} className="font-semibold">
                        {actor.display_name}
                      </span>
                      {actor.username && (
                        <span className="text-white/25 ml-1">@{actor.username}</span>
                      )}
                    </p>
                  )}
                  <p className="text-[12px] text-white/40 leading-relaxed font-outfit break-words">
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

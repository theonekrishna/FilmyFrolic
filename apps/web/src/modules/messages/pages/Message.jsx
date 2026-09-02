import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import { Search, Plus, MoreHorizontal, ChevronLeft, MessageSquare } from "lucide-react";
// Lazy-load the heavy modal — only fetched when user clicks "New Conversation"
const NewConversationModal = lazy(() => import("../components/NewConversationModal"));
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import { InboxListSkeleton, ChatMessagesSkeleton } from "../components/ChartSkeleton";
import {
  getInbox,
  getConversation,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
} from "../services/messageService";
import { supabase } from "../utils/supabaseClient";
import AuthPromptModal from "../components/Authpromptmoda";

// --- HELPERS (Keep these outside the component) ---
const AVATAR_PALETTES = [
  "linear-gradient(135deg,#f97316,#ef4444)",
  "linear-gradient(135deg,#a855f7,#ec4899)",
  "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#f97316)",
  "linear-gradient(135deg,#ec4899,#a855f7)",
  "linear-gradient(135deg,#06b6d4,#10b981)",
  "linear-gradient(135deg,#6366f1,#3b82f6)",
];

function getAvatarGradient(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Format date for chat separators (Today, Yesterday, or date)
function formatChatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Messages() {
  // --- 1. USER DETECTION ---
  const currentUser = useMemo(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decoded = decodeToken(token);
      return {
        id: decoded?.id || decoded?.sub || decoded?._id || null,
        username: decoded?.username || "Me",
      };
    }
    return { id: null, username: null };
  }, []);

  const currentUserId = currentUser?.id;

  // --- 2. STATE ---
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [view, setView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxLoading, setInboxLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const location = useLocation();
  const channelRef = useRef(null);
  const scrollRef = useRef(null);

  // --- 3. INBOX FETCHING ---
  const fetchInbox = useCallback(async () => {
    if (!currentUserId) {
      setInboxLoading(false);
      return;
    }
    const res = await getInbox();
    if (res.success) {
      setThreads(res.data || []);
    }
    setInboxLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // --- 4. SUPABASE REALTIME & PRESENCE WITH AUTO-RECONNECT ---
  useEffect(() => {
    if (!currentUserId) return;

    let retryTimeout = null;
    let attempts = 0;

    const setupChannel = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`online-users-${currentUserId}`, {
        config: { presence: { key: String(currentUserId) } },
      });

      channelRef.current = channel;

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const onlineMap = {};
          Object.entries(state).forEach(([key, presences]) => {
            onlineMap[key] = true;
            if (Array.isArray(presences)) {
              presences.forEach((p) => {
                if (p.key) onlineMap[String(p.key)] = true;
                if (p.user_id) onlineMap[String(p.user_id)] = true;
                if (p.userId) onlineMap[String(p.userId)] = true;
              });
            }
          });
          setOnlineUsers(onlineMap);
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `receiver_id=eq.${currentUserId}`,
          },
          (payload) => {
            const newMsg = payload.new;
            if (
              activeUser &&
              String(newMsg.sender_id) === String(activeUser.id || activeUser._id)
            ) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              markConversationAsRead(activeUser.id || activeUser._id).catch(() => {});
            }
            fetchInbox();
          }
        )
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            attempts = 0;
            await channel.track({ online_at: new Date().toISOString() });
          } else if (status === "CHANNEL_ERROR" || status === "CLOSED") {
            attempts += 1;
            const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
            console.warn(
              `[MESSAGES] Realtime disconnected (${status}). Reconnecting in ${delay}ms...`
            );
            retryTimeout = setTimeout(setupChannel, delay);
          }
        });
    };

    setupChannel();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, fetchInbox, activeUser]);

  // --- 5. THREAD SELECTION ---
  const handleSelectThread = useCallback(async (user) => {
    setActiveUser(user);
    setView("chat");
    setMessages([]);
    setChatLoading(true);
    const targetId = user?.id || user?._id;
    const res = await getConversation(targetId);
    if (res.success) setMessages(res.data || []);
    setChatLoading(false);
    markConversationAsRead(targetId).catch(() => {});
    setThreads((prev) =>
      prev.map((t) =>
        String(t.other_user_id) === String(targetId) ? { ...t, unread_count: 0 } : t
      )
    );
  }, []);

  useEffect(() => {
    if (location.state?.activeUser) {
      handleSelectThread(location.state.activeUser);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleSelectThread]);

  const handleSend = async (text, file) => {
    const contentToSend = text?.trim() || "";
    if (!contentToSend && !file) return;
    if (!activeUser || isSending) return;

    const targetId = activeUser?.id || activeUser?._id;
    const tempId = `temp-${Date.now()}`;

    let localMediaUrl = null;
    let localMediaType = null;
    if (file) {
      localMediaUrl = URL.createObjectURL(file);
      localMediaType = file.type.startsWith("video/") ? "video" : "image";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: contentToSend,
        media_url: localMediaUrl,
        media_type: localMediaType,
        sender_id: currentUserId,
        receiver_id: targetId,
        created_at: new Date().toISOString(),
        _optimistic: true,
      },
    ]);

    setInputValue("");
    setIsSending(true);

    const res = await sendMessage(targetId, contentToSend, file);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...res.data, _optimistic: false } : m))
      );
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
    setIsSending(false);
  };

  const handleDelete = async (msgId) => {
    const res = await deleteMessage(msgId);
    if (res.success) setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    return threads.filter((t) => t.username?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [threads, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative font-['Outfit']">
      <AuthPromptModal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        message="Sign in to chat with friends, send media, and join conversations!"
      />

      {newConvoOpen && (
        <Suspense fallback={null}>
          <NewConversationModal
            onClose={() => setNewConvoOpen(false)}
            onStart={(user) => {
              handleSelectThread(user);
              setNewConvoOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* TopBar — hide when in chat view on mobile */}
      <div className={`${view === "chat" ? "hidden md:block" : "block"} shrink-0`}>
        <TopBar title="Messages" subtitle="Live Chat" />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Sidebar / Inbox ── */}
        <div
          className={`
            ${view === "chat" ? "hidden md:flex" : "flex"}
            w-full md:w-[320px] lg:w-[360px] shrink-0
            bg-[#0d0d18] border-r border-white/10 flex-col
          `}
        >
          {/* Inbox Header */}
          <div className="px-4 pt-4 pb-3 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Bebas_Neue'] text-[24px] tracking-widest text-white/90 m-0">
                Inbox
              </h2>
              <button
                onClick={() => {
                  if (!currentUserId) {
                    setAuthPromptOpen(true);
                    return;
                  }
                  setNewConvoOpen(true);
                }}
                className="w-9 h-9 rounded-2xl flex items-center justify-center bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
                aria-label="New conversation"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>

            {/* Inbox Search input */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                size={14}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (!currentUserId) {
                    setAuthPromptOpen(true);
                    return;
                  }
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  if (!currentUserId) setAuthPromptOpen(true);
                }}
                placeholder="Search conversations..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-blue-500/40 transition-colors"
                readOnly={!currentUserId}
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {inboxLoading ? (
              <InboxListSkeleton count={6} />
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <MessageSquare size={32} className="mb-2" />
                <p className="text-xs font-medium">No conversations yet</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const uId = t.other_user_id || t.user?.id;
                const uName = t.username || t.user?.username;
                const uAvatar = t.avatar_url || t.user?.avatar_url;
                const isActive = activeUser?.id === uId || activeUser?._id === uId;
                return (
                  <div
                    key={uId}
                    onClick={() =>
                      handleSelectThread({
                        id: uId,
                        username: uName,
                        avatar_url: uAvatar,
                      })
                    }
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200 ease-out mb-1.5 border ${
                      isActive
                        ? "bg-[#16162c] border-blue-500/40 shadow-lg shadow-blue-500/10"
                        : "border-transparent hover:bg-white/5 active:bg-white/10"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm overflow-hidden shadow-md"
                        style={{
                          background: uAvatar ? "transparent" : getAvatarGradient(uName),
                        }}
                      >
                        {uAvatar ? (
                          <img
                            src={uAvatar}
                            alt={uName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.style.background = getAvatarGradient(uName);
                              e.target.parentElement.textContent = uName?.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          uName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      {onlineUsers[String(uId)] && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0d0d18] rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)] z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-xs font-semibold text-white/90 truncate">
                          {uName}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {(t.last_message_time ||
                            t.last_message_at ||
                            t.created_at ||
                            t.timestamp) && (
                            <span className="text-[10px] text-white/30 font-medium">
                              {new Date(
                                t.last_message_time ||
                                  t.last_message_at ||
                                  t.created_at ||
                                  t.timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {t.unread_count > 0 && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                              {t.unread_count > 99 ? "99+" : t.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-white/40 truncate mt-0.5 font-light">
                        {t.last_message === "📷 Photo" || t.last_message === "🎬 Video" ? (
                          <span className="text-blue-400 font-medium">{t.last_message}</span>
                        ) : (
                          t.last_message || "Start chatting..."
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div
          className={`
            ${view === "list" ? "hidden md:flex" : "flex"}
            flex-1 flex-col bg-[#080810] min-w-0
          `}
        >
          {activeUser ? (
            <>
              {/* Chat Header */}
              <header className="h-[60px] md:h-[68px] px-4 md:px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#080810]/90 backdrop-blur-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setView("list")}
                    className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/70 active:scale-95 transition-all"
                    aria-label="Back to inbox"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30 overflow-hidden shadow-md">
                    {activeUser.avatar_url ? (
                      <img
                        src={activeUser.avatar_url}
                        alt={activeUser.username}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.textContent = activeUser.username
                            ?.charAt(0)
                            .toUpperCase();
                        }}
                      />
                    ) : (
                      activeUser.username?.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-sm md:text-base truncate m-0">
                        {activeUser.username}
                      </h3>
                      {onlineUsers[String(activeUser.id || activeUser._id)] && (
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                          title="Online"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-white/40 hidden sm:block m-0 font-light">
                      {onlineUsers[String(activeUser.id || activeUser._id)] ? (
                        <span className="text-green-400 font-medium">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
              </header>

              {/* Chat Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
                style={{ maxHeight: "calc(100vh - 180px)" }}
              >
                {chatLoading ? (
                  <ChatMessagesSkeleton count={6} />
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/30">
                    <MessageSquare size={40} className="mb-3 text-blue-500/40" />
                    <p className="text-sm font-medium">No messages in this chat yet</p>
                    <p className="text-xs text-white/20 mt-1">Say hi to {activeUser.username}!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const prevMsg = messages[idx - 1];
                    const showDateSeparator =
                      !prevMsg ||
                      new Date(msg.created_at).toDateString() !==
                        new Date(prevMsg.created_at).toDateString();

                    return (
                      <div key={msg.id || idx}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-4">
                            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[11px] font-medium text-white/40 shadow-sm">
                              {formatChatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <MessageBubble
                          msg={msg}
                          isMe={String(msg.sender_id) === String(currentUserId)}
                          onDelete={handleDelete}
                          activeUser={activeUser}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 md:p-4 bg-[#080810]/95 border-t border-white/10 backdrop-blur-xl shrink-0">
                <MessageInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  disabled={isSending}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <MessageSquare size={28} className="text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white/70 mb-1">Your Direct Messages</h3>
              <p className="text-xs text-white/40 max-w-sm text-center">
                Select a conversation from the inbox or start a new chat with fellow movie fans!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

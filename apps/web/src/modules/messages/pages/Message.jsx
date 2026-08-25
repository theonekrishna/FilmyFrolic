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
import AuthPromptModal from "../components/Authpromptmoda"; // 👈 ADD THIS IMPORT

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
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [authPromptOpen, setAuthPromptOpen] = useState(false); // 👈 ADD THIS

  const location = useLocation();

  // --- 3. REFS ---
  const scrollRef = useRef(null);
  const activeUserRef = useRef(activeUser);
  const channelRef = useRef(null);
  const presenceChannelRef = useRef(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  // --- 4. API ACTIONS (Moved above useEffect to avoid initialization error) ---
  const fetchInbox = useCallback(async () => {
    setInboxLoading(true);
    const res = await getInbox();
    if (res.success) {
      setThreads(res.data || []);
    }
    setInboxLoading(false);
  }, []);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (!currentUserId) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }

    const room = supabase.channel("online-users", {
      config: {
        presence: {
          key: String(currentUserId),
        },
      },
    });

    room
      .on("presence", { event: "sync" }, () => {
        const state = room.presenceState();
        const online = {};
        Object.keys(state).forEach((key) => {
          online[key] = true;
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await room.track({
            online_at: new Date().toISOString(),
            user_id: currentUserId,
          });
        }
      });

    presenceChannelRef.current = room;

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [currentUserId]);

  // --- 5. REALTIME SUBSCRIPTION (Now safely below fetchInbox) ---
  useEffect(() => {
    if (!currentUserId) return;

    // Cleanup previous channel to prevent duplicate listeners
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    channelRef.current = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // Filter removed as per Lead's "test" request
        },
        (payload) => {
          const newMsg = payload.new;
          const active = activeUserRef.current;
          const activeId = active?.id || active?._id || active?.user_id;

          const isFromActiveUser = active && String(activeId) === String(newMsg.sender_id);
          const isFromMe = String(newMsg.sender_id) === String(currentUserId);

          // UI Logic: Update current chat messages
          // Only add messages from others (own messages handled by optimistic UI in handleSend)
          if (!isFromMe && isFromActiveUser) {
            setMessages((prev) => {
              // Check for duplicates by ID
              const isDuplicate = prev.some((m) => String(m.id) === String(newMsg.id));
              if (isDuplicate) return prev;
              return [...prev, newMsg];
            });
            markConversationAsRead(newMsg.sender_id).catch(() => {});
          }

          // UI Logic: Update Sidebar preview
          setThreads((prev) => {
            const partnerId = isFromMe ? newMsg.receiver_id : newMsg.sender_id;
            const exists = prev.some(
              (t) => String(t.other_user_id || t.user?.id) === String(partnerId)
            );

            let previewText = newMsg.content;
            if (!previewText && newMsg.media_type === "image") previewText = "📷 Photo";
            if (!previewText && newMsg.media_type === "video") previewText = "🎬 Video";

            if (!exists) {
              fetchInbox(); // Refresh if new user
              return prev;
            }

            return prev.map((t) =>
              String(t.other_user_id || t.user?.id) === String(partnerId)
                ? {
                    ...t,
                    last_message: previewText,
                    unread_count:
                      active && String(activeId) === String(partnerId)
                        ? 0
                        : (t.unread_count || 0) + (isFromMe ? 0 : 1),
                  }
                : t
            );
          });
        }
      )
      .subscribe((status) => {
        // Realtime connection status
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, fetchInbox]);

  // --- 6. REMAINING HANDLERS ---
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
    // If navigated from Feed with an active user, select them
    if (location.state?.activeUser) {
      handleSelectThread(location.state.activeUser);
      // Optional: clear state to prevent re-trigger on refresh
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

  // --- 7. RENDER ---
  return (
    <div className="h-full bg-[#080810] flex flex-col overflow-hidden">
      {/* 👇 ADD AUTH PROMPT MODAL */}
      <AuthPromptModal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        message="Sign in to send messages and connect with others."
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
            w-full md:w-[300px] lg:w-[340px] shrink-0
            bg-[#0d0d18] border-r border-white/5 flex-col
          `}
        >
          {/* Inbox Header */}
          <div className="px-4 pt-4 pb-3 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Bebas_Neue'] text-[22px] tracking-widest text-white/90">
                Inbox
              </h2>
              {/* 👇 UPDATED: guard + button */}
              <button
                onClick={() => {
                  if (!currentUserId) {
                    setAuthPromptOpen(true);
                    return;
                  }
                  setNewConvoOpen(true);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3b82f6] hover:bg-blue-500 active:scale-95 transition-all"
                aria-label="New conversation"
              >
                <Plus size={16} className="text-white" />
              </button>
            </div>
            {/* 👇 UPDATED: guard + search input */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                size={13}
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
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-white/20 transition-colors"
                readOnly={!currentUserId}
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {inboxLoading ? (
              <InboxListSkeleton count={6} />
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/20">
                <MessageSquare size={32} className="mb-2" />
                <p className="text-xs">No conversations yet</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const uId = t.other_user_id || t.user?.id;
                const uName = t.username || t.user?.username;
                const uAvatar = t.avatar_url || t.user?.avatar_url;
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
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors duration-200 ease-out mb-1 border-l-2 ${
                      activeUser?.id === uId
                        ? "bg-[#13132a] border-blue-500"
                        : "border-transparent hover:bg-white/5 active:bg-white/10"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white text-sm overflow-hidden"
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
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0d0d18] rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)] z-10" />
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
                            <span className="text-[10px] text-white/30">
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
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 bg-red-500 rounded-full text-white text-[10px] font-semibold flex items-center justify-center">
                              {t.unread_count > 99 ? "99+" : t.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">
                        {t.last_message === "📷 Photo" || t.last_message === "🎬 Video" ? (
                          <span className="text-blue-400">{t.last_message}</span>
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
              <header className="h-[60px] md:h-[72px] px-3 md:px-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <button
                    onClick={() => setView("list")}
                    className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/60 active:scale-95 transition-all"
                    aria-label="Back to inbox"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/30 overflow-hidden">
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
                      <h3 className="text-white font-semibold text-sm md:text-base truncate">
                        {activeUser.username}
                      </h3>
                      {onlineUsers[String(activeUser.id || activeUser._id)] && (
                        <div
                          className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                          title="Online"
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 hidden sm:block">
                      {onlineUsers[String(activeUser.id || activeUser._id)] ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 transition-all">
                  <MoreHorizontal size={18} />
                </button>
              </header>

              {/* Messages Scroll Area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-3 md:px-6 py-3 md:py-4 flex flex-col gap-2"
              >
                {chatLoading ? (
                  <ChatMessagesSkeleton count={8} />
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-white/20 py-12">
                    <MessageSquare size={36} />
                    <p className="text-sm">Say hello to {activeUser.username}!</p>
                  </div>
                ) : (
                  (() => {
                    let lastDate = null;
                    return messages.map((msg, index) => {
                      const msgDate = new Date(msg.created_at).toDateString();
                      const showDateHeader = msgDate !== lastDate;
                      lastDate = msgDate;

                      const uniqueKey = msg.id ? `${msg.id}-${index}` : `msg-${index}`;
                      return (
                        <div key={uniqueKey} className="contents">
                          {showDateHeader && (
                            <div className="flex justify-center my-4">
                              <div className="bg-[#1a1a2e] px-4 py-1.5 rounded-full text-[11px] text-white/50 font-medium">
                                {formatChatDate(msg.created_at)}
                              </div>
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
                    });
                  })()
                )}
              </div>

              {/* Input Footer */}
              <footer className="px-3 py-3 md:px-6 md:py-4 pb-[calc(0.75rem+56px)] md:pb-4 shrink-0 border-t border-white/5">
                <MessageInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  disabled={isSending}
                />
              </footer>
            </>
          ) : (
            /* Empty state — only visible on md+ since mobile shows list instead */
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-3">
              <MessageSquare size={48} />
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

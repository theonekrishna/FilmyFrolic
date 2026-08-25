import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  MoreHorizontal,
  Check,
  Plus,
  Send,
  Image,
  Paperclip,
  Smile,
  Mic,
  X,
} from "lucide-react";

const ACCENT = "#3b82f6";

export default function ChatThread({ thread, messages, onBack, onSend }) {
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const bottomRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!menuOpen) return;
    function h(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  function handleSend() {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
    setAttachOpen(false);
  }

  const CHAT_MENU = [
    { icon: "🔔", label: "Mute Notifications", sub: "1h / 8h / Always" },
    { icon: "📌", label: "Pin Conversation", sub: null },
    { icon: "🔗", label: "Share Profile", sub: null },
    { icon: "🗑️", label: "Clear Chat History", sub: null },
    { icon: "🚫", label: "Block User", sub: null, danger: true },
    { icon: "🚩", label: "Report User", sub: null, danger: true },
  ];

  const ATTACH_OPTIONS = [
    {
      icon: <Image size={20} />,
      label: "Photo / Video",
      color: "#3b82f6",
      action: () => setAttachOpen(false),
    },
    {
      icon: <Paperclip size={20} />,
      label: "File",
      color: "#f5c518",
      action: () => setAttachOpen(false),
    },
    {
      icon: <Smile size={20} />,
      label: "GIF",
      color: "#e91e8c",
      action: () => setAttachOpen(false),
    },
    {
      icon: <Mic size={20} />,
      label: "Voice Note",
      color: "#e84545",
      action: () => setAttachOpen(false),
    },
    {
      icon: <span style={{ fontSize: 18 }}>🎬</span>,
      label: "Movie Card",
      color: "#1fd1a8",
      action: () => {
        onSend("🎬 Shared: Sakura Protocol (2025) · ★9.3");
        setAttachOpen(false);
      },
    },
    {
      icon: <span style={{ fontSize: 18 }}>😂</span>,
      label: "Meme",
      color: "#7c5cfc",
      action: () => setAttachOpen(false),
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-[#080810] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 px-4 bg-[#080810]/95 border-b border-white/7 backdrop-blur-xl flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#f0f0f8]/70" />
        </button>
        <div className="relative flex-shrink-0">
          <div
            className={`w-[38px] h-[38px] flex items-center justify-center font-extrabold text-[13px] text-white ${thread.isGroup ? "rounded-xl" : "rounded-full"}`}
            style={{ background: thread.gradient, fontFamily: "'Outfit', sans-serif" }}
          >
            {thread.initials}
          </div>
          {thread.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2ecc71] border-2 border-[#080810]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-sm text-[#f0f0f8] truncate"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {thread.name}
          </div>
          <div
            className="text-[11px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: thread.online ? "#2ecc71" : "rgba(240,240,248,0.35)",
            }}
          >
            {thread.online ? "● Online" : "Last seen recently"}
          </div>
        </div>
        {/* Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`p-1.5 rounded-md transition-colors ${menuOpen ? "bg-white/5" : "bg-transparent"} text-[#f0f0f8]/50`}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute top-9 right-0 z-[700] min-w-[220px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] py-1.5 overflow-hidden">
              {CHAT_MENU.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                  className={`w-full flex items-start gap-2.5 px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-white/5 ${item.danger ? "text-[#e84545]" : "text-[#f0f0f8]/80"}`}
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div>{item.label}</div>
                    {item.sub && (
                      <div className="text-[10px] text-[#f0f0f8]/35 mt-0.5">{item.sub}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 px-4 flex flex-col gap-2.5 webkit-overflow-scrolling-touch">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 opacity-40">
            <div className="text-4xl">💬</div>
            <div
              className="text-xs text-[#f0f0f8]/50 text-center"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              No messages yet — say hi!
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.from === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] p-2.5 px-3.5 ${msg.from === "me" ? "bg-[#3b82f6] text-white rounded-[18px_18px_4px_18px]" : "bg-[#1a1a2a] border border-white/10 text-[#f0f0f8]/85 rounded-[18px_18px_18px_4px]"}`}
            >
              {msg.attachedMovie && (
                <div
                  className="text-[11px] font-bold mb-1.5"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: msg.from === "me" ? "rgba(255,255,255,0.7)" : "#f5c518",
                  }}
                >
                  🎬 {msg.attachedMovie}
                </div>
              )}
              <div
                className="text-sm font-light leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {msg.content}
              </div>
            </div>
            <div
              className="text-[10px] text-[#f0f0f8]/30 mt-1 px-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {msg.timeAgo}
              {msg.from === "me" && <Check size={10} className="ml-1 inline text-[#f0f0f8]/35" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Attachment Tray */}
      {attachOpen && (
        <div className="bg-[#0d0d18] border-t border-white/10 p-3.5 px-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-bold text-[#f0f0f8]/45 tracking-widest uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              ATTACH
            </span>
            <button
              onClick={() => setAttachOpen(false)}
              className="bg-transparent border-none cursor-pointer"
            >
              <X size={14} className="text-[#f0f0f8]/40" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-none">
            {ATTACH_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={opt.action}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 bg-transparent border-none cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl border flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: `${opt.color}15`,
                    borderColor: `${opt.color}35`,
                    color: opt.color,
                  }}
                >
                  {opt.icon}
                </div>
                <span
                  className="text-[10px] text-[#f0f0f8]/55 whitespace-nowrap"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className={`flex items-center gap-2 p-2.5 px-4 bg-[#0d0d18] border-t ${attachOpen ? "border-transparent" : "border-white/7"} pb-[max(10px,env(safe-area-inset-bottom,10px))] flex-shrink-0`}
      >
        <button
          onClick={() => setAttachOpen((v) => !v)}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${attachOpen ? "bg-[#3b82f6]/20 border-[#3b82f6]/50" : "bg-white/5 border-white/10"}`}
        >
          <Plus size={16} className={attachOpen ? "text-[#3b82f6]" : "text-[#f0f0f8]/45"} />
        </button>
        <div className="flex-1 bg-white/5 border border-[#3b82f6]/25 rounded-[20px] px-3.5 py-2 min-h-[40px] flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message…"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#f0f0f8] caret-[#3b82f6]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${input.trim() ? "bg-[#3b82f6] border-[#3b82f6] opacity-100" : "bg-white/5 border-white/10 opacity-50"}`}
        >
          <Send size={16} className={input.trim() ? "text-white" : "text-[#f0f0f8]/30"} />
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Trash2, Clock, ImageIcon, Film, X, PlayCircle } from "lucide-react";

// Helper to get initials and gradient
const getAvatarGradient = (str = "") => {
  const AVATAR_PALETTES = [
    "linear-gradient(135deg,#f97316,#ef4444)",
    "linear-gradient(135deg,#a855f7,#ec4899)",
    "linear-gradient(135deg,#3b82f6,#06b6d4)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

export default function MessageBubble({ msg, isMe, onDelete, activeUser }) {
  const isOptimistic = !!msg._optimistic;
  const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const senderName = msg.sender_name || activeUser?.username || "User";
  const avatarUrl = activeUser?.avatar_url;

  const hasMedia = !!msg.media_url;
  const mediaType = msg.media_type || "";
  const isVideo =
    mediaType.startsWith("video") || /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(msg.media_url);
  const isImage =
    mediaType.startsWith("image") || /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(msg.media_url);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <div
      className={`flex items-end gap-3 group w-full ${isMe ? "flex-row-reverse" : "flex-row"} 
      ${isOptimistic ? "opacity-60" : "opacity-100"} transition-all duration-300 mb-2 px-2`}
    >
      {/* Avatar */}
      {!isMe && (
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white mb-6 shadow-md select-none overflow-hidden border border-white/5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={senderName.charAt(0).toUpperCase()}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.style.background = getAvatarGradient(senderName);
                e.target.parentElement.textContent = senderName.charAt(0).toUpperCase();
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: getAvatarGradient(senderName) }}
            >
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      <div
        className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] md:max-w-[75%]`}
      >
        {/* ── Media attachment ── */}
        {hasMedia && (
          <>
            <div
              className={`
                overflow-hidden rounded-[16px] mb-1 shadow-md border border-white/10
                ${isMe ? "rounded-tr-none" : "rounded-tl-none"}
              `}
            >
              {isImage && (
                <img
                  src={msg.media_url}
                  alt="Attached image"
                  className="max-w-[260px] max-h-[320px] w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setViewerOpen(true)}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `<div class="flex items-center gap-2 px-4 py-3 text-white/40 text-xs bg-white/5"><span>Image unavailable</span></div>`;
                  }}
                />
              )}
              {isVideo && (
                <div
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => setViewerOpen(true)}
                >
                  <video
                    src={msg.media_url}
                    muted
                    preload="metadata"
                    playsInline
                    className="max-w-[280px] max-h-[320px] w-full rounded-[16px] bg-black object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <div className="rounded-full bg-black/60 p-3 text-white shadow-lg">
                      <PlayCircle size={30} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            {viewerOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setViewerOpen(false)}
              >
                <div
                  className="relative max-w-[90vw] max-h-[90vh] w-full"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setViewerOpen(false)}
                    className="absolute top-3 right-3 z-20 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition-colors"
                    aria-label="Close media viewer"
                  >
                    <X size={18} />
                  </button>
                  {isImage ? (
                    <img
                      src={msg.media_url}
                      alt="Full-size attachment"
                      className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                    />
                  ) : (
                    <video
                      src={msg.media_url}
                      controls
                      autoPlay
                      className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl bg-black"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Text content (if any) ── */}
        {msg.content && (
          <div
            className={`
              px-4 py-2.5 md:px-5 md:py-3 text-[14px] md:text-[15px] leading-[1.5] font-['Outfit'] shadow-sm break-words
              transition-colors duration-200
              ${
                isMe
                  ? "bg-blue-600 text-white rounded-[20px] rounded-tr-none hover:bg-blue-500"
                  : "bg-[#1e1e30] text-[#eef2ff] rounded-[20px] rounded-tl-none border border-white/10 hover:bg-[#252540]"
              }
            `}
          >
            {msg.content}
          </div>
        )}

        {/* ── Media-only label (no text, but has media) for fallback display ── */}
        {hasMedia && !msg.content && (
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 mt-0.5 text-[11px] text-white/40 font-['Outfit']
              ${isMe ? "self-end" : "self-start"}
            `}
          >
            {isVideo ? <Film size={11} /> : <ImageIcon size={11} />}
            {isVideo ? "Video" : "Photo"}
          </div>
        )}

        {/* ── Timestamp / Actions ── */}
        <div
          className={`flex items-center gap-3 mt-1.5 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
        >
          {isOptimistic ? (
            <span className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest font-medium">
              <Clock size={11} className="animate-pulse" />
              Sending
            </span>
          ) : (
            <>
              <span className="text-[11px] text-white/30 tabular-nums font-light">{timeStr}</span>
              {isMe && (
                <button
                  onClick={() => onDelete(msg.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1 hover:bg-white/5 rounded-full"
                  title="Delete message"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useRef, useState, useEffect } from "react";
import { Send, Loader2, Smile, Paperclip, X, Film, ImageIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({ value, onChange, onSend, disabled }) {
  const [attachedFile, setAttachedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const canSend = (value.trim() || attachedFile) && !disabled;

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const insidePickerWrapper = emojiPickerRef.current?.contains(target);
      const insideEmojiPicker = target?.closest?.(".epr-main, .EmojiPickerReact");

      if (!insidePickerWrapper && !insideEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    // reset so same file can be re-selected if user removes and re-picks
    e.target.value = "";
  };

  const handleSend = () => {
    if (!canSend) return;
    onSend(value, attachedFile);
    setAttachedFile(null);
  };

  const isVideo = attachedFile?.type?.startsWith("video/");
  const isImage = attachedFile?.type?.startsWith("image/");

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-2">
      {/* File attachment preview chip with thumbnail preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 bg-[#16162a] border border-white/15 rounded-2xl p-2 text-xs text-white/90 self-start max-w-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          {isImage && (
            <img
              src={URL.createObjectURL(attachedFile)}
              alt="Preview"
              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
            />
          )}
          {isVideo && (
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Film size={18} className="text-purple-400" />
            </div>
          )}
          {!isImage && !isVideo && (
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Paperclip size={18} className="text-white/50" />
            </div>
          )}
          <div className="flex flex-col min-w-0 pr-1">
            <span className="truncate max-w-[160px] md:max-w-[220px] font-semibold text-white/90">
              {attachedFile.name}
            </span>
            <span className="text-[10px] text-white/40">
              {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/50 flex items-center justify-center transition-colors shrink-0 ml-1"
            aria-label="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Hidden file picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex-1 bg-[#12121e] border border-white/10 rounded-xl md:rounded-2xl px-2 md:px-4 py-1 flex items-center gap-1 md:gap-2 focus-within:border-blue-500/40 transition-all shadow-2xl">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center ${
              attachedFile
                ? "text-blue-400 bg-blue-500/10"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
            aria-label="Attach media"
            tabIndex={-1}
            title="Attach photo or video"
          >
            <Paperclip size={19} />
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSend) handleSend();
            }}
            disabled={disabled}
            placeholder={disabled ? "Sending…" : attachedFile ? "Add a caption…" : "Message…"}
            className="flex-1 bg-transparent border-none outline-none py-3 text-[13px] md:text-sm text-[#f0f0f8] font-['Outfit'] placeholder:text-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <div
            className="relative"
            ref={emojiPickerRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="p-2 text-white/20 hover:text-white/50 transition-colors"
              tabIndex={-1}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={18} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-[120%] right-0 z-50 shadow-2xl">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0f172a]">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1 text-white/70 hover:bg-black/90 transition-colors"
                    aria-label="Close emoji picker"
                  >
                    <X size={16} />
                  </button>
                  <EmojiPicker
                    theme="dark"
                    onEmojiClick={(emojiData) => {
                      onChange(value + emojiData.emoji);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-12 h-12 md:w-[52px] md:h-[52px] rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 shrink-0 ${
            canSend
              ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-500"
              : "bg-white/5 opacity-50 cursor-not-allowed"
          }`}
        >
          {disabled ? (
            <Loader2 size={18} className="text-white animate-spin" />
          ) : (
            <Send size={18} className={canSend ? "text-white" : "text-white/20"} />
          )}
        </button>
      </div>
    </div>
  );
}

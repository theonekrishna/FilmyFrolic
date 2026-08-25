// modules/messages/components/NewConversationModal.jsx
import { useState, useRef, useEffect } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";
import { searchUsers, getSuggestedUsers } from "../services/messageService";

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

function NewConversationModal({ onClose, onStart }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timeoutId;
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = query.trim() ? await searchUsers(query.trim()) : await getSuggestedUsers();
        if (active) setUsers(res.data || []);
      } catch (err) {
        if (active) {
          setUsers([]);
          setError("Failed to load users.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    if (!query.trim()) fetchUsers();
    else timeoutId = setTimeout(fetchUsers, 280);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        className="w-full max-w-[420px] bg-[#12121e] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl flex flex-col"
        style={{ animation: "modalShow 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-wide text-white">NEW MESSAGE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-white/40" />
          </button>
        </div>

        {/* Search & Selection Area */}
        <div className="px-6 pb-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search people..."
              className="w-full bg-[#1a1a2e] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[14px] text-white outline-none focus:border-white/10 transition-all font-['Outfit']"
            />
          </div>

          {/* Selection Chip (Matching Image) */}
          {selected && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-1.5 self-start animate-in zoom-in-95 duration-200">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                style={{ background: getAvatarGradient(selected.username || selected.email) }}
              >
                {(selected.username || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-blue-400 font-['Outfit']">
                {selected.username || selected.displayName}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-blue-400/60 hover:text-blue-400"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-2">
          <span className="text-[11px] font-bold text-white/20 tracking-widest uppercase font-['Outfit']">
            Suggested
          </span>
        </div>

        {/* Contact List */}
        <div className="flex-1 min-h-[300px] max-h-[380px] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-10 opacity-20">
              <Loader2 className="animate-spin text-white" />
            </div>
          ) : (
            users.map((item) => {
              const u = item.user || item;
              const isSelected = selected?.id === u.id;
              const name = u.username || u.displayName || "Unknown";
              const isOnline = u.is_online ?? u.online ?? false;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className={`relative flex items-center gap-4 px-6 py-3 cursor-pointer transition-all group ${
                    isSelected ? "bg-blue-500/5" : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Selection Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />
                  )}

                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-black overflow-hidden"
                      style={{ background: u.avatar_url ? "transparent" : getAvatarGradient(name) }}
                    >
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.style.background = getAvatarGradient(name);
                            e.target.parentElement.textContent = name.substring(0, 2).toUpperCase();
                          }}
                        />
                      ) : (
                        name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[#12121e]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-white font-['Outfit'] truncate group-hover:text-blue-400 transition-colors">
                      {name}
                    </h4>
                  </div>

                  {/* Right Checkmark */}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-in zoom-in-50 duration-200">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-6">
          <button
            onClick={() => selected && onStart(selected) && onClose()}
            disabled={!selected}
            className={`w-full py-4 rounded-xl font-['Outfit'] text-[15px] font-bold transition-all shadow-lg ${
              selected
                ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-blue-500/20 active:scale-[0.98]"
                : "bg-white/[0.05] text-white/20 cursor-not-allowed"
            }`}
          >
            {selected
              ? `Message ${selected.username?.split("_")[0] || "User"}`
              : "Select someone to message"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalShow { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default NewConversationModal;

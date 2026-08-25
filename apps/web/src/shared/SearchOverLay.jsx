// src/modules/core/components/SearchOverlay.jsx
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp, ArrowUpRight } from "lucide-react";

const RECENT_SEARCHES = [
  "Oppenheimer director cut",
  "Best sci-fi 2025",
  "Cillian Murphy movies",
  "Anime recommendations",
];

const TRENDING_SEARCHES = [
  { label: "Sakura Protocol", count: "142k searches" },
  { label: "Realm of Ash sequel", count: "89k searches" },
  { label: "Nexus Rising cast", count: "67k searches" },
  { label: "Best horror 2025", count: "54k searches" },
  { label: "Obsidian Protocol 2", count: "41k searches" },
];

export default function SearchOverlay({ open, onClose }) {
  const [value, setValue] = useState("");
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setValue("");
    }
    return () => (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const removeRecent = (term) => setRecents((prev) => prev.filter((r) => r !== term));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9000] bg-[rgba(8,8,16,0.96)] backdrop-blur-[12px] flex flex-col px-5 animate-ffOverlayIn">
      {/* Search row */}
      <div className="flex items-center gap-3 py-4 border-b border-[rgba(255,255,255,0.08)]">
        <Search size={18} className="flex-shrink-0 text-[rgba(245,197,24,0.7)]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search movies, actors, shows..."
          className="flex-1 bg-transparent border-none outline-none font-outfit text-[17px] font-normal text-[#f0f0f8] caret-[#f5c518]"
        />
        {value && (
          <button
            onClick={() => setValue("")}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] p-0 flex-shrink-0 cursor-pointer"
          >
            <X size={12} className="text-[rgba(240,240,248,0.5)]" />
          </button>
        )}
        <button
          onClick={onClose}
          className="ml-2 text-[#f5c518] font-outfit font-semibold text-[14px] px-2 py-1 cursor-pointer flex-shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pt-6">
        {/* Recent Searches */}
        {recents.length > 0 && (
          <section className="mb-9">
            <div className="text-[10px] font-bold text-[rgba(240,240,248,0.35)] tracking-wider uppercase mb-3">
              Recent Searches
            </div>
            <div className="flex flex-col gap-0.5">
              {recents.map((term) => (
                <div
                  key={term}
                  className="flex items-center gap-3 px-3 py-[11px] rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.06)]"
                >
                  <Clock size={14} className="flex-shrink-0 text-[rgba(240,240,248,0.3)]" />
                  <span className="flex-1 text-[14px] font-outfit text-[rgba(240,240,248,0.75)]">
                    {term}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(term);
                    }}
                    className="flex p-1 opacity-40 transition-opacity duration-150 hover:opacity-90"
                  >
                    <X size={12} className="text-[#f0f0f8]" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trending Searches */}
        <section>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[rgba(240,240,248,0.35)] tracking-wider uppercase mb-3">
            <TrendingUp size={12} className="text-[#e84545]" />
            Trending Now
          </div>
          <div className="flex flex-col gap-0.5">
            {TRENDING_SEARCHES.map((t, i) => (
              <div
                key={t.label}
                className="flex items-center gap-3 px-3 py-[11px] rounded-xl cursor-pointer transition-all duration-150 hover:bg-[rgba(255,255,255,0.04)]"
              >
                {/* Rank */}
                <span
                  className={`w-5 text-center flex-shrink-0 font-[BebasNeue] text-[16px] leading-none ${
                    i < 3 ? "text-[#f5c518]" : "text-[rgba(240,240,248,0.2)]"
                  }`}
                >
                  {i + 1}
                </span>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="font-outfit text-[14px] text-[#f0f0f8] truncate">{t.label}</div>
                  <div className="font-outfit text-[11px] text-[rgba(240,240,248,0.3)] mt-0.5">
                    {t.count}
                  </div>
                </div>
                <ArrowUpRight size={14} className="flex-shrink-0 text-[rgba(240,240,248,0.2)]" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Overlay animation */}
      <style>
        {`
          @keyframes ffOverlayIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-ffOverlayIn { animation: ffOverlayIn 0.18s ease forwards; }
        `}
      </style>
    </div>
  );
}

import { Search, X } from "lucide-react";

export default function ArchiveSearchBar({ query, onChange, onFocus, onBlur, focused, inputRef }) {
  return (
    <div
      className={`sticky top-0 z-30 backdrop-blur-xl bg-[#080810f5] px-4 py-[12px] transition-all duration-300
      border-b ${focused ? "border-yellow-400/40 shadow-[0_4px_20px_rgba(245,197,24,0.1)]" : "border-white/10"}`}
    >
      <div
        className={`flex items-center gap-3 h-[50px] rounded-[16px] px-[16px] transition-all duration-300
        ${
          focused
            ? "bg-yellow-400/8 border border-yellow-400/70 shadow-[0_0_0_4px_rgba(245,197,24,0.12),0_6px_25px_rgba(245,197,24,0.15)] scale-[1.02]"
            : "bg-white/5 border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:bg-white/8 hover:border-white/20"
        }`}
      >
        <Search
          size={18}
          className={`flex-shrink-0 transition-all duration-300 ${
            focused ? "text-yellow-400 scale-110" : "text-white/40 hover:text-white/60"
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Movies, actors, shows..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#f0f0f8] caret-yellow-400 font-[Outfit] min-w-0 placeholder:text-white/30 transition-all duration-300"
        />

        {query && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
            }}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-300 active:scale-90"
          >
            <X size={14} className="text-white/70 hover:text-white/90 transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}

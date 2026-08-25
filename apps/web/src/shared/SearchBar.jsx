import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Film, User, Tv, Users, Hash, UserCheck } from "lucide-react";
import { publicAxios } from "../utils/AxiosInstance";

const TYPE_ICON = {
  movie: Film,
  show: Tv,
  actor: UserCheck,
  user: User,
  community: Users,
  hashtag: Hash,
};

const TYPE_COLOR = {
  movie: "#f5c518",
  show: "#7c5cfc",
  actor: "#ec4899",
  user: "#1fd1a8",
  community: "#3b82f6",
  hashtag: "#f97316",
};

export default function SearchBar({
  placeholder = "Search movies, users, communities, #hashtags...",
  initialValue = "",
  results: externalResults,
  loading: externalLoading,
  onSearch,
  onResultClick,
  onClear,
  fullWidth = false,
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const isLoading = externalLoading ?? internalLoading;
  const displayResults = externalResults ?? searchResults;
  const hasResults = displayResults.length > 0 && focused && value.length > 1;

  // Real API search calling globalSearch backend endpoint
  function handleChange(v) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!onSearch && v.length > 1) {
      setInternalLoading(true);
      setShowResults(false);

      timerRef.current = setTimeout(async () => {
        try {
          const res = await publicAxios.get("/api/search", { params: { q: v } });
          const list = res.data?.data || [];
          setSearchResults(list);
          setShowResults(true);
        } catch (err) {
          console.warn("Global header search error:", err);
          setSearchResults([]);
        } finally {
          setInternalLoading(false);
        }
      }, 300);
    } else if (v.length <= 1) {
      setInternalLoading(false);
      setShowResults(false);
      setSearchResults([]);
    }

    if (onSearch) onSearch(v);
  }

  function handleClear() {
    setValue("");
    setShowResults(false);
    setSearchResults([]);
    setInternalLoading(false);
    if (onClear) onClear();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && value.trim()) {
      setFocused(false);
      setShowResults(false);
      if (value.startsWith("#")) {
        navigate(`/social/feed?tag=${encodeURIComponent(value.trim().replace(/^#/, ""))}`);
      } else {
        navigate(`/content/archive?search=${encodeURIComponent(value.trim())}`);
      }
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = focused && (hasResults || (showResults && displayResults.length > 0));

  return (
    <div
      ref={containerRef}
      className={`relative font-['Outfit',sans-serif] ${fullWidth ? "w-full" : "w-full max-w-[480px]"}`}
    >
      {/* Input row */}
      <div
        className={`flex items-center gap-[10px] h-[42px] px-4 box-border transition-all duration-200
      ${
        focused
          ? "bg-[#161626] border border-[#3b82f6]/60 shadow-lg shadow-blue-500/10"
          : "bg-[#12121e] border border-white/10 shadow-md"
      }
      ${showDropdown ? "rounded-t-2xl" : "rounded-full"}
      `}
      >
        {/* Left icon */}
        <div className="flex items-center flex-shrink-0">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-[#3b82f6]" />
          ) : (
            <Search
              size={16}
              className={`transition-colors duration-200 ${focused ? "text-[#3b82f6]" : "text-white/40"}`}
            />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            if (value.length > 1 && displayResults.length > 0) setShowResults(true);
          }}
          className={`flex-1 bg-transparent border-none outline-none font-['Outfit',sans-serif] text-[13px] font-normal text-[#f0f0f8] min-w-0 ${
            value ? "not-italic" : "italic"
          }`}
        />

        {/* Clear */}
        {value && (
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="bg-white/10 hover:bg-white/20 border-none rounded-full w-5 h-5 flex items-center justify-center cursor-pointer flex-shrink-0 p-0 transition-colors duration-150 text-white/50 hover:text-white"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-[#0d0d18] border border-[#3b82f6]/40 border-t-0 rounded-b-2xl overflow-hidden z-[200] shadow-2xl max-h-[420px] overflow-y-auto">
          {displayResults.map((r, i) => {
            const Icon = TYPE_ICON[r.type] || Film;
            const color = TYPE_COLOR[r.type] || "#f5c518";
            return (
              <button
                key={r.id || i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (onResultClick) {
                    onResultClick(r);
                  } else if (r.link) {
                    navigate(r.link);
                  } else {
                    navigate(`/content/movie/${r.id}`);
                  }
                  setFocused(false);
                  setShowResults(false);
                }}
                className={`w-full flex items-center gap-3 py-3 px-4 bg-transparent border-none cursor-pointer text-left transition-colors duration-150 hover:bg-white/5 ${
                  i > 0 ? "border-t border-white/5" : ""
                }`}
              >
                {/* Thumbnail or Type chip */}
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    <Icon size={15} color={color} />
                  </div>
                )}

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="font-['Outfit',sans-serif] text-[13px] font-semibold text-[#f0f0f8] whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
                    <span>{r.title}</span>
                    <span
                      className="text-[9px] uppercase px-2 py-0.5 rounded-full font-mono font-bold tracking-wider"
                      style={{
                        background: `${color}20`,
                        color: color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {r.type}
                    </span>
                  </div>

                  {r.subtitle && (
                    <div className="font-['Outfit',sans-serif] text-[11px] text-white/40 mt-[2px] truncate font-light">
                      {r.subtitle}
                    </div>
                  )}
                </div>

                {/* Rating */}
                {r.rating !== undefined && (
                  <div className="font-['Outfit',sans-serif] text-[12px] font-bold text-[#f5c518] flex-shrink-0">
                    ★ {r.rating}
                  </div>
                )}
              </button>
            );
          })}

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-white/5 font-['Outfit',sans-serif] text-[11px] text-white/30 flex items-center gap-1.5 bg-[#080810]">
            <span className="bg-white/10 rounded-md px-1.5 py-0.5 text-[10px]">↵</span>
            to search movies/series ·
            <span className="bg-white/10 rounded-md px-1.5 py-0.5 text-[10px]">#</span>
            for hashtags
          </div>
        </div>
      )}
    </div>
  );
}

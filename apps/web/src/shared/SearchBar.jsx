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
          ? "bg-[rgba(26,26,42,1)] border border-[rgba(245,197,24,0.5)] shadow-[0_0_0_3px_rgba(245,197,24,0.08),0_4px_20px_rgba(0,0,0,0.6)]"
          : "bg-[rgba(26,26,42,0.85)] border border-[rgba(255,255,255,0.08)] shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
      }
      ${showDropdown ? "rounded-t-[10px]" : "rounded-[10px]"}
      `}
      >
        {/* Left icon */}
        <div className="flex items-center flex-shrink-0">
          {isLoading ? (
            <Loader2 size={16} color="rgba(245,197,24,0.7)" className="animate-spin" />
          ) : (
            <Search
              size={16}
              color={focused ? "#f5c518" : "rgba(240,240,248,0.35)"}
              className="transition-colors duration-200"
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
            className="bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] border-none rounded-full w-[20px] h-[20px] flex items-center justify-center cursor-pointer flex-shrink-0 p-0 transition-colors duration-150"
          >
            <X size={11} color="rgba(240,240,248,0.5)" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 bg-[#0d0d18] border border-[rgba(245,197,24,0.3)] border-t-0 rounded-b-[10px] overflow-hidden z-[200] shadow-[0_8px_40px_rgba(0,0,0,0.8)] max-h-[420px] overflow-y-auto">
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
                className={`w-full flex items-center gap-3 py-[11px] px-4 bg-transparent border-none cursor-pointer text-left transition-colors duration-150 hover:bg-[rgba(255,255,255,0.06)] ${
                  i > 0 ? "border-t border-[rgba(255,255,255,0.05)]" : ""
                }`}
              >
                {/* Thumbnail or Type chip */}
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-[32px] h-[32px] rounded-[8px] object-cover flex-shrink-0 border border-[rgba(255,255,255,0.1)]"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}35`,
                    }}
                  >
                    <Icon size={14} color={color} />
                  </div>
                )}

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="font-['Outfit',sans-serif] text-[13px] font-semibold text-[#f0f0f8] whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
                    <span>{r.title}</span>
                    <span
                      className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold tracking-wider"
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
                    <div
                      className="font-['Outfit',sans-serif] text-[11px] mt-[2px] truncate"
                      style={{ color: "rgba(240,240,248,0.45)" }}
                    >
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
          <div className="px-4 py-[8px] border-t border-[rgba(255,255,255,0.05)] font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.3)] flex items-center gap-[6px] bg-[#080810]">
            <span className="bg-[rgba(255,255,255,0.08)] rounded-[4px] px-[5px] py-[1px]">↵</span>
            to search movies/series ·
            <span className="bg-[rgba(255,255,255,0.08)] rounded-[4px] px-[5px] py-[1px]">#</span>
            for hashtags
          </div>
        </div>
      )}
    </div>
  );
}

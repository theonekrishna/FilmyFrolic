import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Film, User, Tv } from "lucide-react";
import { publicAxios } from "../utils/AxiosInstance";

const TYPE_ICON = { movie: Film, actor: User, show: Tv };
const TYPE_COLOR = { movie: "#f5c518", actor: "#1fd1a8", show: "#7c5cfc" };

export default function SearchBar({
  placeholder = "Search movies, actors, shows...",
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

  // Real API search with debounce
  function handleChange(v) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!onSearch && v.length > 1) {
      setInternalLoading(true);
      setShowResults(false);

      timerRef.current = setTimeout(async () => {
        try {
          const res = await publicAxios.get("/api/archive", { params: { search: v } });
          const raw = res.data?.data ?? res.data?.movies ?? res.data;
          const list = Array.isArray(raw) ? raw : [];

          const formatted = list
            .slice(0, 6)
            .map((item) => {
              const isSeries = item.type === "Series" || item.type === "series";
              return {
                id: item.id ?? item._id ?? item.tmdb_id,
                type: isSeries ? "show" : "movie",
                title: item.title ?? item.name ?? "Untitled",
                subtitle: `${item.year || ""} ${item.genres?.[0] ? `· ${item.genres[0]}` : ""}`,
                rating:
                  (item.rating ?? item.vote_average)
                    ? Number(item.rating ?? item.vote_average).toFixed(1)
                    : undefined,
              };
            })
            .filter((m) => m.id);

          setSearchResults(formatted);
          setShowResults(true);
        } catch (err) {
          console.warn("Header search error:", err);
          setSearchResults([]);
        } finally {
          setInternalLoading(false);
        }
      }, 350);
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
      navigate(`/content/archive?search=${encodeURIComponent(value.trim())}`);
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
        <div className="absolute top-full left-0 right-0 bg-[#0d0d18] border border-[rgba(245,197,24,0.3)] border-t-0 rounded-b-[10px] overflow-hidden z-[200] shadow-[0_8px_40px_rgba(0,0,0,0.8)]">
          {displayResults.map((r, i) => {
            const Icon = TYPE_ICON[r.type] || Film;
            const color = TYPE_COLOR[r.type] || "#f5c518";
            return (
              <button
                key={r.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (onResultClick) {
                    onResultClick(r);
                  } else {
                    navigate(`/content/movie/${r.id}`);
                  }
                  setFocused(false);
                  setShowResults(false);
                }}
                className={`w-full flex items-center gap-3 py-[11px] px-4 bg-transparent border-none cursor-pointer text-left transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] ${
                  i > 0 ? "border-t border-[rgba(255,255,255,0.05)]" : ""
                }`}
              >
                {/* Type chip */}
                <div
                  className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${color}14`,
                    border: `1px solid ${color}28`,
                  }}
                >
                  <Icon size={13} color={color} />
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <div className="font-['Outfit',sans-serif] text-[13px] font-semibold text-[#f0f0f8] whitespace-nowrap overflow-hidden text-ellipsis">
                    {r.title}
                  </div>

                  {r.subtitle && (
                    <div
                      className="font-['Outfit',sans-serif] text-[11px] mt-[1px]"
                      style={{ color: "rgba(240,240,248,0.38)" }}
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
          <div className="px-4 py-[8px] border-t border-[rgba(255,255,255,0.05)] font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.25)] flex items-center gap-[6px]">
            <span className="bg-[rgba(255,255,255,0.08)] rounded-[4px] px-[5px] py-[1px]">↵</span>
            to search all ·
            <span className="bg-[rgba(255,255,255,0.08)] rounded-[4px] px-[5px] py-[1px]">Esc</span>
            to close
          </div>
        </div>
      )}
    </div>
  );
}

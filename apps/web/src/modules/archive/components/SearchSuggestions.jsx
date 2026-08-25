import { Clock, TrendingUp, X } from "lucide-react";
import { TRENDING_SEARCHES } from "../data/archive";
const ACCENT = "#f5c518";

export default function SearchSuggestions({ recents, onPickRecent, onClearRecent }) {
  return (
    <div className="px-4 pb-6">
      {recents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} color="rgba(240,240,248,0.4)" className="animate-pulse" />
            <span className="font-['Outfit'] text-[13px] font-semibold text-[rgba(240,240,248,0.4)] uppercase tracking-[0.5px]">
              Recent
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {recents.map((term) => (
              <div
                key={term}
                className="flex items-center gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] transition-all duration-300 hover:bg-white/5 hover:border-white/10 rounded-lg px-2 group"
              >
                <Clock
                  size={15}
                  color="rgba(240,240,248,0.3)"
                  className="flex-shrink-0 transition-colors duration-300 group-hover:text-yellow-400"
                />
                <button
                  onClick={() => onPickRecent(term)}
                  className="flex-1 text-left font-['Outfit'] text-[15px] text-[rgba(240,240,248,0.75)] bg-none border-none cursor-pointer p-0 min-h-0 transition-colors duration-300 hover:text-yellow-400"
                >
                  {term}
                </button>
                <button
                  onClick={() => onClearRecent(term)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-none border-none cursor-pointer p-0 min-h-0 flex-shrink-0 transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-90"
                >
                  <X
                    size={14}
                    color="rgba(240,240,248,0.3)"
                    className="transition-colors duration-300 hover:text-red-400"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} color="rgba(240,240,248,0.4)" className="animate-pulse" />
          <span className="font-['Outfit'] text-[13px] font-semibold text-[rgba(240,240,248,0.4)] uppercase tracking-[0.5px]">
            Trending Searches
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {TRENDING_SEARCHES.map((item, i) => (
            <div
              key={item.q}
              onClick={() => onPickRecent(item.q)}
              className={`flex items-center gap-4 py-3 cursor-pointer transition-all duration-300 hover:bg-white/5 rounded-lg px-2 group ${
                i < TRENDING_SEARCHES.length - 1
                  ? "border-b border-[rgba(255,255,255,0.04)] hover:border-white/10"
                  : ""
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                style={{
                  background: "rgba(245,197,24,0.1)",
                  border: "1px solid rgba(245,197,24,0.18)",
                }}
              >
                <TrendingUp size={14} color={ACCENT} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-['Outfit'] text-[14px] text-[rgba(240,240,248,0.8)] truncate transition-colors duration-300 group-hover:text-yellow-400">
                  {item.q}
                </div>
              </div>
              <span className="font-['Outfit'] text-[12px] text-[rgba(240,240,248,0.3)] flex-shrink-0 transition-colors duration-300 group-hover:text-yellow-400">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

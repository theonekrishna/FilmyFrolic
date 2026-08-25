import { Flame } from "lucide-react";
import { GENRES } from "../data/movies";

function GenrePillsSection({ activeGenre, onGenre }) {
  return (
    <div className="pt-5 px-4 md:px-8">
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 md:flex-wrap md:gap-3">
        <button
          onClick={() => onGenre("All")}
          className={`flex items-center gap-1 h-8 px-3.5 rounded-full whitespace-nowrap snap-start transition-all
          ${
            activeGenre === "All"
              ? "bg-yellow-400/20 border-yellow-400/60 text-yellow-400"
              : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
          }
          border font-semibold text-xs`}
        >
          <Flame size={11} className="fill-yellow-400 text-yellow-400" />
          All
        </button>

        {GENRES.map((g) => {
          const isActive = activeGenre === g.name;

          return (
            <button
              key={g.name}
              onClick={() => onGenre(g.name)}
              className={`flex items-center gap-1 h-8 px-3 rounded-full whitespace-nowrap snap-start border transition-all text-xs
              ${
                isActive
                  ? "font-semibold text-white border-white/40 bg-white/10"
                  : "font-medium text-gray-300 border-white/10 bg-white/5"
              }`}
            >
              <span className="text-[11px]">{g.emoji}</span>
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default GenrePillsSection;

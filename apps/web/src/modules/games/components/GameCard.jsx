// ─── Desktop GameCard ─────────────────────────────────────────────────────────
import { useState } from "react";
import { Users, BadgeCheck } from "lucide-react";
import ReportButton from "../../Reports/components/ReportButton";

function GameCard({ game, onPlay, result }) {
  const [hovered, setHovered] = useState(false);
  const hasPlayed = !!result;

  // Resolve API fields vs mock fields
  const title = game.title ?? game.name ?? "Game";
  const desc = game.description ?? game.desc ?? "";
  const diffMap = { easy: 1, medium: 2, hard: 3 };
  const diffLevel =
    typeof game.difficulty === "number"
      ? game.difficulty
      : (diffMap[game.difficulty?.toLowerCase()] ?? 1);

  const diffColors = {
    1: "#1fd1a8", // easy: green
    2: "#f5c518", // medium: yellow
    3: "#e84545", // hard: red
  };
  const color = diffColors[diffLevel] || "#7c5cfc";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col rounded-[14px] overflow-hidden cursor-pointer bg-[#12121e] transition-all duration-200 relative"
      style={{
        border: `1px solid ${hovered ? color + "50" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}20` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* top gradient line */}
      <div
        className="h-[4px]"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
        }}
      />

      {/* Badges */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {game.category && (
          <span
            className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-[rgba(240,240,248,0.7)] px-2 py-0.5 rounded-[5px] text-[9px] font-semibold tracking-wide uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {game.category}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-[10px] px-[18px] pt-[18px] pb-[16px]">
        <div className="w-[56px] h-[56px] relative flex items-center justify-center shrink-0">
          <img
            src="/gameicon.gif"
            alt="Game Icon"
            className="absolute w-[200px] h-[200px] max-w-none object-cover mix-blend-screen pointer-events-none"
          />
        </div>

        <div>
          <h3
            className="text-[22px] tracking-[1.5px] text-[#f0f0f8] mb-[4px] leading-none flex items-center gap-2"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            {title}
            {game.featured && (
              <BadgeCheck size={18} color="#3b82f6" style={{ marginTop: "-2px" }} />
            )}
          </h3>

          <p
            className="text-[13px] font-[300] leading-[1.55]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.45)",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {desc}
          </p>
        </div>

        {/* difficulty */}
        <div className="flex items-center gap-[4px]">
          <span
            className="text-[10px] mr-[4px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.3)",
            }}
          >
            Difficulty:
          </span>

          {[1, 2, 3].map((d) => (
            <div
              key={d}
              className="w-[8px] h-[8px] rounded-full"
              style={{
                background: d <= diffLevel ? color : "rgba(255,255,255,0.12)",
                boxShadow: d <= diffLevel ? `0 0 4px ${color}80` : "none",
              }}
            />
          ))}
        </div>

        {/* bottom */}
        <div className="flex items-center justify-between mt-auto pt-[4px]">
          <span
            className="flex items-center gap-[4px] text-[12px]"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.35)",
            }}
          >
            <Users size={11} /> {game.playing} playing
          </span>

          {hasPlayed ? (
            <div className="flex items-center gap-3">
              <ReportButton
                moduleType="game"
                targetId={String(game.id)}
                contentPreview={game.title || game.name}
              />
              <div className="flex flex-col items-end">
                <span
                  className="text-[12px] font-bold"
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    color: "#1fd1a8",
                    letterSpacing: "1px",
                  }}
                >
                  {result.score}/{result.total} correct
                </span>
                <span
                  className="text-[10px]"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: "rgba(240,240,248,0.5)",
                  }}
                >
                  {result.percentage}%
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
              className="rounded-[7px] px-[18px] py-[7px] text-[12px] font-[700] transition-all duration-200"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: hovered ? color : `${color}18`,
                border: `1px solid ${color}50`,
                color: hovered ? "#fff" : color,
              }}
            >
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCard;

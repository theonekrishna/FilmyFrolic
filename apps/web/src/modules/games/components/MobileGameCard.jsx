import { Users, ArrowRight, BadgeCheck } from "lucide-react";
import ReportButton from "../../Reports/components/ReportButton";

function MobileGameCard({ game, onPlay, result }) {
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
  const hasPlayed = !!result;
  return (
    <div
      className="flex items-center h-[100px] bg-[#12121e] border border-white/10 rounded-[14px] overflow-hidden cursor-pointer mx-4 mb-2.5 active:border-opacity-40 transition"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
      onTouchStart={(e) => {
        e.currentTarget.style.borderColor = `${color}50`;
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Left accent strip */}
      <div className="w-[4px] self-stretch shrink-0" style={{ background: color }} />

      <div
        className="w-[68px] h-full flex items-center justify-center shrink-0 overflow-hidden relative"
        style={{ background: `${color}0d` }}
      >
        <img
          src="/gameicon.gif"
          alt="Game Icon"
          className="absolute w-[180px] h-[180px] max-w-none object-cover mix-blend-screen pointer-events-none"
        />
      </div>

      {/* Middle content */}
      <div className="flex-1 px-3 min-w-0 flex flex-col justify-center gap-[3px]">
        {/* Badges */}
        {game.category && (
          <div className="flex items-center gap-1.5">
            <span
              className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-[rgba(240,240,248,0.7)] px-1.5 py-[2px] rounded-[4px] text-[8px] font-semibold tracking-wider uppercase"
              style={{ fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}
            >
              {game.category}
            </span>
          </div>
        )}

        <div className="font-[Bebas_Neue] text-[20px] tracking-[1.5px] text-[#f0f0f8] leading-none truncate flex items-center gap-1.5">
          <span className="truncate">{title}</span>
          {game.featured && <BadgeCheck size={14} color="#3b82f6" className="shrink-0" />}
        </div>

        <div className="font-outfit text-[12px] text-white/40 leading-[1.4] font-light truncate">
          {desc}
        </div>

        {/* Difficulty + players */}
        <div className="flex items-center gap-[10px] mt-[2px]">
          <div className="flex items-center gap-[3px]">
            {[1, 2, 3].map((d) => (
              <div
                key={d}
                className="w-[6px] h-[6px] rounded-full"
                style={{
                  background: d <= diffLevel ? color : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>

          <span className="flex items-center gap-[3px] text-[10px] text-white/30 font-outfit">
            <Users size={9} className="text-white/30" /> {game.playing}
          </span>
        </div>
      </div>

      {/* Play button or Result */}
      <div className="px-3 shrink-0 flex items-center gap-2">
        {hasPlayed && (
          <ReportButton
            moduleType="game"
            targetId={String(game.id)}
            contentPreview={game.title || game.name}
            size="md"
            variant="icon"
          />
        )}
        {hasPlayed ? (
          <div className="flex flex-col items-center w-[44px]">
            <span
              className="text-[14px] font-bold leading-none"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                color: "#1fd1a8",
                letterSpacing: "1px",
              }}
            >
              {result.score}/{result.total}
            </span>
            <span
              className="text-[9px] leading-none mt-[2px]"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "rgba(240,240,248,0.5)",
              }}
            >
              {result.percentage}%
            </span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border transition"
            style={{
              background: `${color}20`,
              border: `1.5px solid ${color}50`,
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.background = `${color}40`;
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.background = `${color}20`;
            }}
          >
            <ArrowRight size={18} color={color} />
          </button>
        )}
      </div>
    </div>
  );
}

export default MobileGameCard;

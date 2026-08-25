// ─── Mobile Mini Leaderboard (top 3 only) ─────────────────────────────────────
import { useState, useEffect } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { getGlobalLeaderboard } from "../serviceGame";

//constants
const GOLD = "#f5c518";
function MiniLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getGlobalLeaderboard()
      .then((data) => {
        if (!cancelled) {
          const mapped = (data || []).map((player, i) => ({
            rank: i + 1,
            user: player.username || player.user_id?.slice(0, 8) || "Unknown",
            initials: player.username?.slice(0, 2).toUpperCase() || "??",
            gradient:
              i === 0
                ? "linear-gradient(135deg,#f5c518,#e84545)"
                : i === 1
                  ? "linear-gradient(135deg,#e91e8c,#9b59b6)"
                  : "linear-gradient(135deg,#4d91ff,#9b59b6)",
            score: player.total_score || player.score || 0,
            badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`,
            avatar_url: player.avatar_url,
          }));
          setLeaderboard(mapped);
        }
      })
      .catch(() => {
        if (!cancelled) setLeaderboard([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-4 mb-4">
        <div className="bg-[#12121e] border border-white/10 rounded-[14px] p-4">
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 rounded-full border-2 border-[#7c5cfc] border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-[10px]">
        <div className="flex items-center gap-[7px]">
          <Trophy size={15} color={GOLD} />
          <span className="font-[Bebas_Neue] text-[20px] tracking-[1.5px] text-[#f0f0f8]">
            Global Leaderboard
          </span>
        </div>

        {leaderboard.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-[3px] text-[11px] font-outfit text-[color:var(--accent)] cursor-pointer"
          >
            {showAll ? "Show Less" : "View Full Leaderboard"}{" "}
            {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Top 3 rows */}
      <div className="bg-[#12121e] border border-white/10 rounded-[14px] overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="text-center py-5 text-white/40 font-outfit text-[13px]">
            No players on the global leaderboard yet.
          </div>
        ) : (
          (showAll ? leaderboard : leaderboard.slice(0, 3)).map((player, i) => (
            <div
              key={player.user}
              className={`flex items-center gap-[10px] px-[14px] py-[11px] ${
                i === 0 ? "bg-[rgba(245,197,24,0.05)]" : ""
              } ${i < (showAll ? leaderboard.length : 3) - 1 ? "border-b border-white/10" : ""}`}
            >
              {/* Badge */}
              <span className="text-[16px] w-[22px] text-center shrink-0">{player.badge}</span>

              {/* Avatar */}
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt={player.user}
                  className="w-[28px] h-[28px] rounded-full object-cover shrink-0"
                  style={{ boxShadow: i === 0 ? `0 0 8px ${GOLD}50` : "none" }}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold font-outfit text-[#080810] shrink-0"
                  style={{
                    background: player.gradient,
                    boxShadow: i === 0 ? `0 0 8px ${GOLD}50` : "none",
                  }}
                >
                  {player.initials}
                </div>
              )}

              {/* Name */}
              <span className="font-outfit text-[13px] font-semibold text-[#f0f0f8] flex-1 truncate">
                {player.user}
              </span>

              {/* Score */}
              <span
                className="font-[Bebas_Neue] text-[18px] tracking-[1px] shrink-0"
                style={{
                  color: i === 0 ? GOLD : "rgba(240,240,248,0.45)",
                }}
              >
                {player.score.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MiniLeaderboard;

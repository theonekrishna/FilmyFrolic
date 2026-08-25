// ─── Desktop LeaderboardWidget ────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { getGlobalLeaderboard } from "../serviceGame";

function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getGlobalLeaderboard()
      .then((data) => {
        if (!cancelled) {
          // Map API response to component format
          const mapped = (data || []).map((player, i) => ({
            rank: i + 1,
            user: player.username || player.user_id?.slice(0, 8) || "Unknown",
            initials: player.username?.slice(0, 2).toUpperCase() || "??",
            gradient:
              i === 0
                ? "linear-gradient(135deg,#f5c518,#e84545)"
                : i === 1
                  ? "linear-gradient(135deg,#e91e8c,#9b59b6)"
                  : i === 2
                    ? "linear-gradient(135deg,#4d91ff,#9b59b6)"
                    : "linear-gradient(135deg,#9b59b6,#2ecc71)",
            score: player.total_score || player.score || 0,
            badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️",
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
      <div className="bg-[#12121e] border border-white/10 rounded-2xl px-6 py-5">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-[#7c5cfc] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12121e] border border-white/10 rounded-2xl px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          <h3 className="font-[Bebas_Neue] text-[22px] tracking-[1.5px] text-[#f0f0f8]">
            Global Leaderboard
          </h3>
        </div>

        {leaderboard.length > 3 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs text-purple-400 font-outfit hover:text-purple-300 transition cursor-pointer"
          >
            {showAll ? "Show Less" : "View Full Leaderboard"}{" "}
            {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Leaderboard list */}
      <div className="flex flex-col gap-1.5">
        {leaderboard.length === 0 ? (
          <div className="text-center py-6 text-white/40 font-outfit text-[14px]">
            No players on the global leaderboard yet.
          </div>
        ) : (
          (showAll ? leaderboard : leaderboard.slice(0, 3)).map((player, i) => (
            <div
              key={player.user}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg border transition
                ${i === 0 ? "bg-yellow-400/5 border-yellow-400/20" : "bg-white/5 border-white/10"}
              `}
            >
              {/* Badge */}
              <span className="text-xl w-7 text-center shrink-0">{player.badge}</span>

              {/* Avatar */}
              {player.avatar_url ? (
                <img
                  src={player.avatar_url}
                  alt={player.user}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#080810] shrink-0"
                  style={{ background: player.gradient }}
                >
                  {player.initials}
                </div>
              )}

              {/* Username */}
              <span className="text-[13px] font-semibold text-[#f0f0f8] flex-1 font-outfit">
                {player.user}
              </span>

              {/* Score */}
              <span
                className={`font-[Bebas_Neue] text-[20px] tracking-wide shrink-0 ${
                  i === 0 ? "text-yellow-400" : "text-white/50"
                }`}
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

export default LeaderboardWidget;

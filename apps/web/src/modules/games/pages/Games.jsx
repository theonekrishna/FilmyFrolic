import { useState, useEffect, lazy, Suspense } from "react";
import TopBar from "../../../layout/TopBar";
import { Zap } from "lucide-react";

import { getAllGames, getGameStatus } from "../serviceGame";
import MobileDailyBanner from "../components/MobileDailyBanner";
import MobileGameCard from "../components/MobileGameCard";
import MiniLeaderboard from "../components/MiniLeaderboard";
import StreakBadge from "../components/StreakBadge";
import DailyChallengeBanner from "../components/DailyChallengeBanner";
import GameCard from "../components/GameCard";
import LeaderboardWidget from "../components/LeaderboardWidget";
import AuthPromptModal from "../../../shared/AuthPromptModal";
import { useAuth } from "../../../context/AuthContext";
import { useToast, ToastContainer } from "../../../shared/Toast";

// Lazy-load the game screen — only needed when user starts a game (~42KB)
const ActiveGameScreen = lazy(() => import("../components/ActiveGameScreen"));

// constants
const ACCENT = "#7c5cfc";
const GOLD = "#f5c518";

function useCountdown(target) {
  const [secs, setSecs] = useState(target);

  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : target));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Games() {
  const { user } = useAuth();
  const { toasts, dismiss, warning } = useToast();
  const [activeGame, setActiveGame] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState(null);
  const [gameResults, setGameResults] = useState({});

  // ── Auth prompt state ──────────────────────────────────────────────────
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });

  const isLoggedIn = !!user && !!localStorage.getItem("accessToken");

  function requireAuth(message, action) {
    if (!isLoggedIn) {
      setAuthPrompt({ open: true, message });
      return false;
    }
    action?.();
    return true;
  }
  // ──────────────────────────────────────────────────────────────────────

  const countdown = useCountdown(86400 - (((Date.now() / 1000) % 86400) | 0));

  useEffect(() => {
    let cancelled = false;
    setLoadingGames(true);
    getAllGames()
      .then(async (data) => {
        if (!cancelled) {
          setGames(data);
          setGamesError(null);
          if (user) {
            const resultsMap = {};
            await Promise.all(
              data.map(async (game) => {
                try {
                  const status = await getGameStatus(game.id);
                  if (status?.alreadyPlayed && status?.summary) {
                    resultsMap[game.id] = status.summary;
                  }
                } catch (e) {
                  // game not played yet
                }
              })
            );
            if (!cancelled) setGameResults(resultsMap);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setGamesError(err?.response?.data?.message ?? "Failed to load games");
      })
      .finally(() => {
        if (!cancelled) setLoadingGames(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const dailyGame =
    games.find((g) => g.title?.toLowerCase().includes("daily")) ??
    games.find((g) => g.difficulty?.toLowerCase() === "hard") ??
    games[0] ??
    null;

  const dailyAlreadyPlayed = dailyGame ? !!gameResults[dailyGame.id] : false;

  const handlePlayDaily = () => {
    if (!dailyGame) return;

    requireAuth("Sign in to play today's film challenge and compete on the leaderboard!", () => {
      if (gameResults[dailyGame.id]) {
        warning("Already Played", "You already played today's challenge!");
        return;
      }
      setActiveGame(dailyGame);
    });
  };

  const handlePlayGame = (game) => {
    requireAuth(
      "Sign in to play games, track your score, and climb the Film IQ leaderboard!",
      () => {
        if (gameResults[game.id]) {
          warning("Already Played", "You already played this game!");
          return;
        }
        setActiveGame(game);
      }
    );
  };

  if (activeGame) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080810] flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-[3px] border-[#7c5cfc]/20 border-t-[#7c5cfc] animate-spin" />
          </div>
        }
      >
        <ActiveGameScreen
          game={activeGame}
          onBack={() => setActiveGame(null)}
          onGameComplete={(gameId, summary) => {
            setGameResults((prev) => ({ ...prev, [gameId]: summary }));
          }}
        />
      </Suspense>
    );
  }

  return (
    <>
      {/* ── Auth Prompt Modal ── */}
      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />

      {/* ── Toast Notification ── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE LAYOUT (≤768px)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="ff-games-mobile min-h-screen bg-[#080810]">
        {/* ── HEADER ── */}
        <div
          className="relative h-[160px] overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#0d0820 0%,#100828 55%,#080810 100%)",
          }}
        >
          {/* Purple radial glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_100%_at_15%_60%,rgba(124,92,252,0.22)_0%,transparent_70%)]" />

          {/* Gold glow right */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_70%_at_90%_40%,rgba(245,197,24,0.10)_0%,transparent_65%)]" />

          {/* Content */}
          <div className="relative z-[1] h-full flex flex-col justify-center px-[16px] gap-[6px]">
            {/* Title + game count */}
            <div className="flex items-center gap-[12px]">
              <h1
                className="font-['Bebas_Neue',cursive] text-[52px] tracking-[3px] text-[#f0f0f8] leading-none m-0"
                style={{ textShadow: `0 0 40px ${ACCENT}50` }}
              >
                FILM IQ
              </h1>

              {!loadingGames && games.length > 0 && (
                <div
                  className="flex items-center gap-[5px] h-[28px] px-[10px] rounded-[100px] shrink-0"
                  style={{
                    background: "rgba(124,92,252,0.12)",
                    border: "1.5px solid rgba(124,92,252,0.40)",
                    boxShadow: "0 0 12px rgba(124,92,252,0.15)",
                  }}
                >
                  <span className="text-[14px] leading-none">🎮</span>
                  <span
                    className="font-['Bebas_Neue',cursive] text-[17px] tracking-[1.5px] leading-none"
                    style={{ color: ACCENT }}
                  >
                    {games.length} {games.length === 1 ? "Game" : "Games"}
                  </span>
                </div>
              )}
            </div>

            {/* Subtitle */}
            <p className="font-['Outfit',sans-serif] text-[13px] text-[rgba(240,240,248,0.4)] font-light m-0">
              {loadingGames
                ? "Loading games…"
                : dailyGame
                  ? `Now playing: ${dailyGame.title}`
                  : "No games available yet"}
            </p>

            {/* CTA row */}
            <div className="flex items-center gap-[10px] mt-[4px]">
              <button
                onClick={handlePlayDaily}
                disabled={loadingGames || !games.length}
                className="flex items-center gap-[7px] h-[36px] px-[16px] rounded-[10px] border-none text-[13px] font-bold text-white disabled:opacity-40"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  background: dailyAlreadyPlayed ? "rgba(255,255,255,0.1)" : ACCENT,
                  boxShadow: dailyAlreadyPlayed ? "none" : `0 4px 18px ${ACCENT}50`,
                  minHeight: "unset",
                  cursor: "pointer",
                }}
              >
                <Zap size={13} fill="#fff" color="#fff" />
                {dailyAlreadyPlayed ? "Already Played" : "Play Daily"}
              </button>

              {dailyGame?.difficulty && (
                <span className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.3)]">
                  Difficulty: {dailyGame.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── DAILY CHALLENGE BANNER ── */}
        <div className="pt-[14px]">
          <MobileDailyBanner
            countdown={countdown}
            onPlay={handlePlayDaily}
            game={dailyGame}
            alreadyPlayed={dailyAlreadyPlayed}
          />
        </div>

        {/* ── GAME CARDS SECTION ── */}
        <div className="pt-[6px] pb-[12px]">
          <div className="flex items-center justify-between px-[16px] mb-[10px]">
            <h2 className="font-['Bebas_Neue',cursive] text-[22px] tracking-[1.5px] text-[#f0f0f8] m-0">
              Game Modes
            </h2>
            <span className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.3)]">
              {loadingGames ? "Loading…" : gamesError ? "Error" : `${games.length} games`}
            </span>
          </div>

          {loadingGames && (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-[#7c5cfc] border-t-transparent animate-spin" />
            </div>
          )}
          {gamesError && (
            <p className="px-4 text-[13px] text-red-400 font-['Outfit',sans-serif]">{gamesError}</p>
          )}
          {!loadingGames &&
            !gamesError &&
            games.map((game) => (
              <MobileGameCard
                key={game.id}
                game={game}
                result={gameResults[game.id]}
                onPlay={() => handlePlayGame(game)}
              />
            ))}
        </div>

        {/* ── MINI LEADERBOARD ── */}
        <div className="pt-[4px] pb-[88px]">
          <MiniLeaderboard />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT (≥769px)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="ff-games-desktop min-h-screen bg-[#080810]">
        <TopBar title="Games" subtitle="Play, predict, compete" />

        {/* Desktop hero */}
        <div
          className="h-[280px] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#0d0820 0%,#10071f 50%,#080810 100%)",
          }}
        >
          {/* Noise Texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
              backgroundSize: "128px",
            }}
          />

          {/* Left Gradient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_20%_50%,rgba(124,92,252,0.18)_0%,transparent_70%)]" />

          {/* Right Gradient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_50%,rgba(245,197,24,0.08)_0%,transparent_70%)]" />

          {/* Content */}
          <div className="relative h-full flex items-center justify-between px-8 z-[1]">
            <div>
              <div className="flex items-center gap-[10px] mb-[8px]">
                <div
                  className="rounded-full px-[14px] py-[4px] font-[Outfit] text-[11px] font-extrabold tracking-[1px]"
                  style={{
                    background: `${ACCENT}22`,
                    border: `1px solid ${ACCENT}40`,
                    color: ACCENT,
                  }}
                >
                  GAME ZONE
                </div>

                {!loadingGames && games.length > 0 && (
                  <div
                    className="rounded-full px-[12px] py-[3px] font-[Outfit] text-[11px] font-bold tracking-[0.5px]"
                    style={{
                      background: `${GOLD}18`,
                      border: `1px solid ${GOLD}35`,
                      color: GOLD,
                    }}
                  >
                    {games.length} {games.length === 1 ? "GAME" : "GAMES"} AVAILABLE
                  </div>
                )}
              </div>

              <h1
                className="font-['Bebas_Neue'] text-[64px] tracking-[4px] text-[#f0f0f8] leading-none mb-[8px]"
                style={{ textShadow: `0 0 40px ${ACCENT}40` }}
              >
                TEST YOUR <br /> FILM IQ
              </h1>

              <p className="font-[Outfit] text-[15px] text-[rgba(240,240,248,0.45)] font-light">
                {loadingGames
                  ? "Loading games…"
                  : dailyGame
                    ? dailyGame.description || `Play ${dailyGame.title} now`
                    : "No games available yet"}
              </p>

              <div className="flex items-center gap-[10px] mt-[20px]">
                <button
                  onClick={handlePlayDaily}
                  disabled={loadingGames || !games.length}
                  className="flex items-center gap-[8px] rounded-[10px] px-[24px] py-[12px] font-[Outfit] text-[14px] font-bold text-white cursor-pointer disabled:opacity-40"
                  style={{
                    background: dailyAlreadyPlayed ? "rgba(255,255,255,0.1)" : ACCENT,
                    boxShadow: dailyAlreadyPlayed ? "none" : `0 6px 24px ${ACCENT}50`,
                  }}
                >
                  <Zap size={16} fill="#fff" />
                  {dailyAlreadyPlayed ? "✓ Already Played" : "Play Today's Challenge"}
                </button>

                {dailyGame?.difficulty && (
                  <span className="font-[Outfit] text-[13px] text-[rgba(240,240,248,0.35)]">
                    Difficulty: {dailyGame.difficulty}
                  </span>
                )}
              </div>
            </div>

            {dailyGame && (
              <StreakBadge games={games} gamesPlayed={Object.keys(gameResults).length} />
            )}
          </div>
        </div>

        {/* Desktop daily banner */}
        <div className="pt-6 px-8">
          <DailyChallengeBanner
            countdown={countdown}
            onPlay={handlePlayDaily}
            game={dailyGame}
            gamesCount={games.length}
            alreadyPlayed={dailyAlreadyPlayed}
          />
        </div>

        {/* Desktop game grid */}
        <div className="pt-7 px-8">
          <div className="flex items-center justify-between mb-[18px]">
            <h2 className="font-['Bebas_Neue'] text-[26px] tracking-[2px] text-[#f0f0f8] m-0">
              Game Modes
            </h2>
            <span className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.35)]">
              {loadingGames ? "Loading…" : gamesError ? "Error" : `${games.length} available`}
            </span>
          </div>

          {loadingGames && (
            <div className="flex justify-center items-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-[#7c5cfc] border-t-transparent animate-spin" />
            </div>
          )}
          {gamesError && <p className="text-[13px] text-red-400 font-[Outfit]">{gamesError}</p>}
          <div className="grid gap-[14px] grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
            {!loadingGames &&
              !gamesError &&
              games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  result={gameResults[game.id]}
                  onPlay={() => handlePlayGame(game)}
                />
              ))}
          </div>
        </div>

        {/* Desktop leaderboard */}
        <div className="pt-7 px-8 pb-16">
          <LeaderboardWidget />
        </div>
      </div>

      {/* ── Global CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .ff-games-mobile  { display: block !important; }
          .ff-games-desktop { display: none  !important; }
        }
        @media (min-width: 769px) {
          .ff-games-mobile  { display: none  !important; }
          .ff-games-desktop { display: block !important; }
        }
        @keyframes ff-glow-pulse {
          0%,100% { box-shadow: 0 0 24px rgba(245,197,24,0.07); }
          50%      { box-shadow: 0 0 40px rgba(245,197,24,0.18); }
        }
        @keyframes ff-score-float {
          0%   { opacity: 1; transform: translateY(0)     scale(1);    }
          30%  { opacity: 1; transform: translateY(-10px)  scale(1.2);  }
          100% { opacity: 0; transform: translateY(-36px)  scale(0.85); }
        }
      `}</style>
    </>
  );
}

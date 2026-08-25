// ─── ActiveGameScreen ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { getQuestions, submitGame, getGameLeaderboard } from "../serviceGame";
import TimerRing from "../components/TimerRing";
import AnswerButton from "../components/AnswerButton";
import QuestionMedia from "../components/QuestionMedia";
import TopBar from "../../../layout/TopBar";
import { ArrowLeft, ChevronRight } from "lucide-react";

// constants
const ACCENT = "#7c5cfc";
const GOLD = "#f5c518";

export default function ActiveGameScreen({ game, onBack, onGameComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreAnim, setScoreAnim] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [blurAmt, setBlurAmt] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiSummary, setApiSummary] = useState(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  const [gameLeaderboard, setGameLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Collect answers: { question_id, selected }
  const answersRef = useRef([]);

  useEffect(() => {
    document.body.classList.add("ff-game-active");
    return () => document.body.classList.remove("ff-game-active");
  }, []);

  // Fetch game leaderboard when game over
  useEffect(() => {
    if (gameOver && game?.id) {
      setLoadingLeaderboard(true);
      getGameLeaderboard(game.id)
        .then((data) => setGameLeaderboard(data))
        .catch(() => setGameLeaderboard([]))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [gameOver, game?.id]);

  // Fetch questions from API
  useEffect(() => {
    if (!game?.id) return;
    let cancelled = false;
    setLoadingQ(true);
    answersRef.current = [];
    getQuestions(game.id)
      .then((data) => {
        if (!cancelled) {
          setQuestions(data);
          setQuestionsError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setQuestionsError(err?.response?.data?.message ?? "Failed to load questions");
      })
      .finally(() => {
        if (!cancelled) setLoadingQ(false);
      });
    return () => {
      cancelled = true;
    };
  }, [game?.id]);

  const q = questions[questionIdx] ?? null;
  const totalQ = questions.length || 1;

  // Parse options if they come as JSON string from API
  const qOptions = (() => {
    if (!q) return [];
    if (Array.isArray(q.options)) return q.options;
    if (typeof q.options === "string") {
      try {
        const parsed = JSON.parse(q.options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  // Get correct answer index as number (API might return string)
  const correctIdx = (() => {
    const val = q?.correct_answer ?? q?.correct;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  })();

  useEffect(() => {
    if (revealed || gameOver) return;

    setTimeLeft(30);
    setBlurAmt(20);

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRevealed(true);
          // Store "no answer" for timer timeout (if not already answered)
          const alreadyAnswered = answersRef.current.some((a) => a.question_id === q?.id);
          if (!alreadyAnswered && q?.id) {
            answersRef.current = [...answersRef.current, { question_id: q.id, selected: -1 }];
          }
          return 0;
        }
        return t - 1;
      });

      setBlurAmt((b) => Math.max(0, b - 0.7));
    }, 1000);

    return () => clearInterval(id);
  }, [questionIdx, revealed, gameOver, q?.id]);

  const handleAnswer = useCallback(
    (idx) => {
      if (revealed || !q) return;

      // Just update selection - don't store yet, don't reveal
      setSelected(idx);
    },
    [revealed, q]
  );

  // Navigate to question and restore answer
  const navigateToQuestion = useCallback(
    (newIdx) => {
      if (newIdx >= 0 && newIdx < questions.length) {
        // Save current answer before leaving (if any selected)
        if (q?.id && selected !== null) {
          const existingIdx = answersRef.current.findIndex((a) => a.question_id === q.id);
          if (existingIdx >= 0) {
            answersRef.current[existingIdx].selected = selected;
          } else {
            answersRef.current.push({ question_id: q.id, selected });
          }
        }

        // Navigate
        setQuestionIdx(newIdx);

        // Restore answer for new question
        const newQ = questions[newIdx];
        if (newQ?.id) {
          const savedAnswer = answersRef.current.find((a) => a.question_id === newQ.id);
          setSelected(savedAnswer?.selected ?? null);
        } else {
          setSelected(null);
        }
        setRevealed(false);
      }
    },
    [questionIdx, questions, q, selected]
  );

  const handlePrev = useCallback(() => {
    navigateToQuestion(questionIdx - 1);
  }, [navigateToQuestion, questionIdx]);

  const handleNavNext = useCallback(() => {
    // If on last question and revealed, submit the game
    if (questionIdx >= questions.length - 1 && revealed) {
      setSubmitting(true);
      const answersToSubmit = answersRef.current;
      submitGame(game.id, answersToSubmit)
        .then((res) => {
          const isAlreadyPlayed = res?.alreadyPlayed ?? res?.data?.alreadyPlayed ?? false;
          const summary =
            res?.score !== undefined
              ? { score: res.score, total: res.total, percentage: res.percentage }
              : res?.data?.score !== undefined
                ? { score: res.data.score, total: res.data.total, percentage: res.data.percentage }
                : { score: 0, total: questions.length, percentage: 0 };

          setApiSummary(summary);
          setAlreadyPlayed(isAlreadyPlayed);

          if (onGameComplete) {
            onGameComplete(game.id, summary);
          }
        })
        .catch(() => {
          setApiSummary(null);
        })
        .finally(() => {
          setSubmitting(false);
          setGameOver(true);
        });
      return;
    }

    // Otherwise just go to next question
    navigateToQuestion(questionIdx + 1);
  }, [navigateToQuestion, questionIdx, questions.length, revealed, game?.id, onGameComplete]);

  // Handle Submit button click - reveals answer and auto-finish if last question
  const handleNext = useCallback(() => {
    // Reveal the answer
    setRevealed(true);

    // Store the selected answer (or -1 if none selected)
    if (q?.id) {
      const answerToStore = selected !== null ? selected : -1;
      const alreadyAnswered = answersRef.current.some((a) => a.question_id === q.id);
      if (!alreadyAnswered) {
        answersRef.current = [
          ...answersRef.current,
          { question_id: q.id, selected: answerToStore },
        ];
      }

      // Calculate score if correct
      if (correctIdx !== null && selected === correctIdx) {
        const pts = Math.max(50, timeLeft * 5);
        setScore((s) => s + pts);
        setScoreAnim({ pts, key: Date.now() });
        setTimeout(() => setScoreAnim(null), 1400);
      }
    }

    // Auto-submit game if this is the last question
    if (questionIdx >= questions.length - 1) {
      setTimeout(() => {
        setSubmitting(true);
        const answersToSubmit = answersRef.current;
        submitGame(game.id, answersToSubmit)
          .then((res) => {
            const isAlreadyPlayed = res?.alreadyPlayed ?? res?.data?.alreadyPlayed ?? false;
            const summary =
              res?.score !== undefined
                ? { score: res.score, total: res.total, percentage: res.percentage }
                : res?.data?.score !== undefined
                  ? {
                      score: res.data.score,
                      total: res.data.total,
                      percentage: res.data.percentage,
                    }
                  : { score: 0, total: questions.length, percentage: 0 };

            setApiSummary(summary);
            setAlreadyPlayed(isAlreadyPlayed);

            if (onGameComplete) {
              onGameComplete(game.id, summary);
            }
          })
          .catch(() => {
            setApiSummary(null);
          })
          .finally(() => {
            setSubmitting(false);
            setGameOver(true);
          });
      }, 1500); // Show revealed answer for 1.5s before auto-submit
    }
  }, [
    revealed,
    q,
    selected,
    correctIdx,
    timeLeft,
    questionIdx,
    questions.length,
    game?.id,
    onGameComplete,
  ]);

  function getAnswerState(idx) {
    if (!q) return "default";
    // If not revealed yet
    if (!revealed) {
      // User selected this option - show highlighted
      if (selected === idx) return "selected";
      return "default";
    }
    // After reveal:
    // Correct answer always shows as correct (green)
    if (correctIdx !== null && idx === correctIdx) return "correct";
    // User's selection stays highlighted (purple) even if wrong
    if (selected === idx) return "selected";
    // Other unselected options dimmed
    return "reveal";
  }
  // Loading questions
  if (loadingQ) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#7c5cfc] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Questions fetch error
  if (questionsError) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-[48px]">⚠️</div>
        <p className="font-['Outfit',sans-serif] text-[15px] text-red-400">{questionsError}</p>
        <button
          onClick={onBack}
          className="rounded-xl px-7 py-[12px] font-['Outfit',sans-serif] text-[14px] font-bold text-white cursor-pointer"
          style={{ background: ACCENT }}
        >
          Back to Games
        </button>
      </div>
    );
  }

  // Submitting screen - show loader instead of quiz
  if (submitting) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#7c5cfc30] border-t-[#7c5cfc] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
        </div>
        <div className="font-['Outfit',sans-serif] text-[18px] font-semibold text-[#f0f0f8]">
          Calculating your score...
        </div>
        <div className="font-['Outfit',sans-serif] text-[14px] text-[rgba(240,240,248,0.5)]">
          {score.toLocaleString()} points so far
        </div>
      </div>
    );
  }

  // Game Over screen
  if (gameOver) {
    const displayScore = apiSummary ? apiSummary.score : score;
    const displayTotal = apiSummary ? apiSummary.total : questions.length;
    const displayPct = apiSummary?.percentage ?? null;
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="text-[64px]">🏆</div>

        <h1 className="font-['Bebas_Neue',cursive] text-[52px] tracking-[3px] text-[#f5c518] m-0">
          {alreadyPlayed ? "Already Played!" : "Game Over!"}
        </h1>

        <div className="font-['Bebas_Neue',cursive] text-[36px] text-[#f0f0f8] tracking-[2px]">
          {apiSummary
            ? `${displayScore} / ${displayTotal} correct`
            : `${score.toLocaleString()} pts`}
        </div>

        {displayPct && (
          <div
            className="font-['Outfit',sans-serif] text-[20px] font-bold"
            style={{ color: ACCENT }}
          >
            {displayPct}
          </div>
        )}

        <p className="font-['Outfit',sans-serif] text-[14px] text-[rgba(240,240,248,0.45)] max-w-[300px] m-0">
          {alreadyPlayed ? (
            <>
              You already played this game. Your score was locked on your first attempt.
              <br />
              Try another game!
            </>
          ) : (
            <>
              You answered {displayTotal} questions in {game.title ?? game.name}.<br />
              Keep your streak alive tomorrow!
            </>
          )}
        </p>

        {/* Game Leaderboard Section */}
        <div className="w-full max-w-[400px] mt-6 mb-2">
          <h3 className="font-['Bebas_Neue',cursive] text-[22px] tracking-[1.5px] text-[#f0f0f8] text-left mb-3">
            Game Leaderboard
          </h3>
          <div className="bg-[#12121e] border border-white/10 rounded-xl overflow-hidden">
            {loadingLeaderboard ? (
              <div className="text-center py-6 text-white/40 font-outfit text-[14px]">
                Loading leaderboard...
              </div>
            ) : Array.isArray(gameLeaderboard) && gameLeaderboard.length === 0 ? (
              <div className="text-center py-6 text-white/40 font-outfit text-[14px]">
                No one has played this game yet. Be the first!
              </div>
            ) : (
              <div className="flex flex-col">
                {Array.isArray(gameLeaderboard) &&
                  gameLeaderboard.slice(0, 5).map((player, i) => (
                    <div
                      key={player.user_id || player.id || i}
                      className={`flex items-center gap-3 px-4 py-3 ${i < gameLeaderboard.length - 1 ? "border-b border-white/10" : ""} ${i === 0 ? "bg-[rgba(245,197,24,0.05)]" : ""}`}
                    >
                      <span className="text-lg w-6 shrink-0 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️"}
                      </span>
                      {player.profiles?.avatar_url || player.avatar_url ? (
                        <img
                          src={player.profiles?.avatar_url || player.avatar_url}
                          alt="avatar"
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(player.profiles?.username || player.username || "??")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <span className="font-outfit text-[14px] font-semibold text-[#f0f0f8] flex-1 text-left truncate">
                        {player.profiles?.username || player.username || "Unknown"}
                      </span>
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1px] leading-none"
                          style={{ color: i === 0 ? GOLD : "#f0f0f8" }}
                        >
                          {player.score ?? player.total_score ?? 0}
                        </span>
                        <span className="font-outfit text-[10px] text-white/40 leading-none mt-1">
                          {player.percentage ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onBack}
            className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-7 py-[14px] font-['Outfit',sans-serif] text-[14px] font-semibold text-[rgba(240,240,248,0.7)] cursor-pointer"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-[48px]">⏳</div>
        <h1 className="font-['Bebas_Neue',cursive] text-[42px] tracking-[2px] text-[#f0f0f8] m-0">
          Questions Coming Soon
        </h1>
        <p className="font-['Outfit',sans-serif] text-[15px] text-[rgba(240,240,248,0.5)] max-w-sm">
          The questions for this game are currently being prepared. Check back later!
        </p>
        <button
          onClick={onBack}
          className="mt-4 rounded-xl px-7 py-[12px] font-['Outfit',sans-serif] text-[14px] font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: ACCENT }}
        >
          Back to Games
        </button>
      </div>
    );
  }
  const progressPct = questions.length > 0 ? (questionIdx / questions.length) * 100 : 0;
  return (
    <>
      {/* ── MOBILE ACTIVE GAME (≤768px) ── */}
      <div className="ff-ag-mobile min-h-screen bg-[#080810] flex flex-col">
        {/* Fixed top header */}
        <div className="sticky top-0 z-[50] bg-[rgba(8,8,16,0.98)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.07)] px-4 py-[10px]">
          {/* Row 1: back + Q counter + timer */}
          <div className="flex items-center justify-between mb-[10px]">
            {/* Back to games */}
            <button
              onClick={onBack}
              className="flex items-center gap-[5px] bg-transparent border-none cursor-pointer font-['Outfit',sans-serif] text-[13px] text-[rgba(240,240,248,0.5)] p-0"
            >
              <ArrowLeft size={16} color="rgba(240,240,248,0.5)" />
              Back
            </button>

            {/* Q counter */}
            <div className="font-['Bebas_Neue',cursive] text-[20px] tracking-[1.5px] text-[#f0f0f8]">
              Q {questionIdx + 1}
              <span className="text-[rgba(240,240,248,0.3)]"> / {totalQ}</span>
            </div>

            {/* Score + timer */}
            <div className="flex items-center gap-[10px]">
              <div className="relative">
                <div
                  className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1px]"
                  style={{ color: GOLD }}
                >
                  {score.toLocaleString()}
                </div>

                {/* +score float up animation */}
                {scoreAnim && (
                  <div
                    key={scoreAnim.key}
                    className="absolute top-[-24px] right-0 font-['Bebas_Neue',cursive] text-[18px] tracking-[1px] pointer-events-none whitespace-nowrap"
                    style={{
                      color: GOLD,
                      animation: "ff-score-float 1.4s ease-out forwards",
                      textShadow: `0 0 12px ${GOLD}`,
                    }}
                  >
                    +{scoreAnim.pts}
                  </div>
                )}
              </div>

              <TimerRing timeLeft={timeLeft} total={30} size={40} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[3px] bg-[rgba(255,255,255,0.08)] rounded-[2px]">
            <div
              className="h-full rounded-[2px] transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${ACCENT}, ${GOLD})`,
              }}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 pt-4 pb-6 overflow-auto">
          {/* Game name pill */}
          <div className="px-4 pb-3">
            <span
              className="rounded-full px-3 py-[3px] font-['Outfit',sans-serif] text-[10px] font-bold tracking-[0.5px]"
              style={{
                background: `${game.color}18`,
                border: `1px solid ${game.color}40`,
                color: game.color,
              }}
            >
              {game.emoji} {game.title ?? game.name}
            </span>
          </div>

          {/* Question area */}
          <div className="mx-4 mb-4 bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden">
            {/* Media: image / video / audio */}
            <QuestionMedia question={q} blurAmt={blurAmt} variant="mobile" />

            {(q.question_type === "quote" ||
              q.type === "quote" ||
              q.question_text?.toLowerCase().includes("quote")) &&
              q.question_text && (
                <div className="py-[28px] px-[20px] flex flex-col gap-[12px] items-center justify-center text-center">
                  <div className="text-[28px] opacity-60">💬</div>

                  <blockquote className="font-['Outfit',sans-serif] text-[17px] italic text-[#f0f0f8] leading-[1.6] m-0 font-light">
                    {q.question_text ?? q.quote}
                  </blockquote>

                  {q.hint && (
                    <div
                      className="rounded-full px-[14px] py-[4px] font-['Outfit',sans-serif] text-[10px]"
                      style={{
                        background: `${ACCENT}12`,
                        border: `1px solid ${ACCENT}25`,
                        color: ACCENT,
                      }}
                    >
                      Hint: {q.hint}
                    </div>
                  )}
                </div>
              )}

            <div className="px-4 py-[14px]">
              <p className="font-['Outfit',sans-serif] text-[14px] font-semibold text-[#f0f0f8] m-0">
                {q.question_text ?? q.question}
              </p>
            </div>
          </div>

          {/* Answer buttons — 60px height, 12px gap */}
          <div className="flex flex-col gap-[12px] px-4 mb-4">
            {qOptions.map((opt, idx) => (
              <AnswerButton
                key={`${idx}-${opt}`}
                label={typeof opt === "object" ? JSON.stringify(opt) : opt}
                state={getAnswerState(idx)}
                onSelect={() => handleAnswer(idx)}
                height={60}
              />
            ))}
          </div>

          {/* Modern Navigation Bar - Prev | Dots | Next | Submit */}
          <div className="px-4 pb-4">
            {/* Navigation row */}
            <div className="flex items-center gap-2 mb-3">
              {/* Prev button */}
              <button
                onClick={handlePrev}
                disabled={questionIdx === 0}
                className="h-[44px] px-4 rounded-[12px] font-['Outfit',sans-serif] text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(240,240,248,0.8)",
                }}
              >
                <span className="flex items-center gap-1">
                  <ArrowLeft size={14} /> Prev
                </span>
              </button>

              {/* Question progress dots */}
              <div className="flex-1 flex items-center justify-center gap-1.5">
                {questions.map((_, idx) => {
                  const isCurrent = idx === questionIdx;
                  const hasAnswer = answersRef.current.some(
                    (a) => a.question_id === questions[idx]?.id && a.selected !== -1
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => navigateToQuestion(idx)}
                      className="cursor-pointer transition-all"
                      style={{
                        width: isCurrent ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: isCurrent
                          ? ACCENT
                          : hasAnswer
                            ? "rgba(34,197,94,0.6)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={handleNavNext}
                disabled={questionIdx >= questions.length - 1}
                className="h-[44px] px-4 rounded-[12px] font-['Outfit',sans-serif] text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(240,240,248,0.8)",
                }}
              >
                <span className="flex items-center gap-1">
                  Next <ChevronRight size={14} />
                </span>
              </button>
            </div>

            {/* Submit button - full width */}
            <button
              onClick={handleNext}
              disabled={submitting || revealed}
              className="w-full h-[52px] rounded-[14px] font-['Outfit',sans-serif] text-[15px] font-bold text-white cursor-pointer transition-all disabled:opacity-40"
              style={{
                background: revealed ? "rgba(34,197,94,0.2)" : ACCENT,
                border: revealed ? "1px solid #22c55e" : "none",
                boxShadow: !revealed ? `0 6px 20px ${ACCENT}45` : "none",
              }}
            >
              {submitting
                ? "Submitting…"
                : revealed
                  ? "✓ Submitted"
                  : selected !== null
                    ? "Submit Answer"
                    : "Skip Question"}
            </button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ACTIVE GAME (≥769px) ── */}
      <div className="ff-ag-desktop min-h-screen bg-[#080810]">
        <TopBar />

        <div className="px-[28px] pt-4 pb-16 max-w-[720px] mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 gap-4">
            {/* Back to games */}
            <button
              onClick={onBack}
              className="flex items-center gap-[6px] bg-transparent border-none cursor-pointer font-['Outfit',sans-serif] text-[13px] text-[rgba(240,240,248,0.4)] p-0"
            >
              ← {game.title ?? game.name}
            </button>

            <div className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1.5px] text-[#f0f0f8]">
              Q {questionIdx + 1}
              <span className="text-[rgba(240,240,248,0.3)]"> of {totalQ}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="font-['Bebas_Neue',cursive] text-[20px] tracking-[1px]"
                  style={{ color: GOLD }}
                >
                  {score.toLocaleString()} pts
                </div>

                {scoreAnim && (
                  <div
                    key={scoreAnim.key}
                    className="absolute right-0 top-[-20px] font-['Bebas_Neue',cursive] text-[16px] tracking-[1px] pointer-events-none"
                    style={{
                      color: GOLD,
                      animation: "ff-score-float 1.4s ease-out forwards",
                    }}
                  >
                    +{scoreAnim.pts}
                  </div>
                )}
              </div>

              <TimerRing timeLeft={timeLeft} total={30} />
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[4px] bg-[rgba(255,255,255,0.08)] rounded-[2px] mb-6">
            <div
              className="h-full rounded-[2px] transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: GOLD,
              }}
            />
          </div>

          {/* Question */}
          <div className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-5">
            {/* Media: image / video / audio */}
            <QuestionMedia question={q} blurAmt={blurAmt} variant="desktop" />

            {(q.question_type === "quote" ||
              q.type === "quote" ||
              q.question_text?.toLowerCase().includes("quote")) &&
              q.question_text && (
                <div className="px-[28px] py-[32px] flex flex-col gap-3 min-h-[180px] items-center justify-center text-center">
                  <div className="text-[32px] opacity-60">💬</div>

                  <blockquote className="font-['Outfit',sans-serif] text-[20px] italic text-[#f0f0f8] leading-[1.6] m-0 font-light">
                    {q.question_text ?? q.quote}
                  </blockquote>

                  {q.hint && (
                    <div
                      className="rounded-full px-[14px] py-[4px] font-['Outfit',sans-serif] text-[11px]"
                      style={{
                        background: `${ACCENT}12`,
                        border: `1px solid ${ACCENT}25`,
                        color: ACCENT,
                      }}
                    >
                      Hint: {q.hint}
                    </div>
                  )}
                </div>
              )}

            <div className="px-5 py-4">
              <p className="font-['Outfit',sans-serif] text-[15px] font-semibold text-[#f0f0f8] m-0">
                {q.question_text ?? q.question}
              </p>
            </div>
          </div>

          {/* Answers */}
          <div className="flex flex-col gap-[10px] mb-5">
            {qOptions.map((opt, idx) => (
              <AnswerButton
                key={`${idx}-${opt}`}
                label={typeof opt === "object" ? JSON.stringify(opt) : opt}
                state={getAnswerState(idx)}
                onSelect={() => handleAnswer(idx)}
              />
            ))}
          </div>

          {/* Modern Navigation Bar - Prev | Dots | Next | Submit */}
          <div className="flex flex-col gap-3">
            {/* Navigation row */}
            <div className="flex items-center gap-3">
              {/* Prev button */}
              <button
                onClick={handlePrev}
                disabled={questionIdx === 0}
                className="h-[44px] px-5 rounded-[12px] font-['Outfit',sans-serif] text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(240,240,248,0.8)",
                }}
              >
                <span className="flex items-center gap-1">
                  <ArrowLeft size={14} /> Prev
                </span>
              </button>

              {/* Question progress dots */}
              <div className="flex-1 flex items-center justify-center gap-2">
                {questions.map((_, idx) => {
                  const isCurrent = idx === questionIdx;
                  const hasAnswer = answersRef.current.some(
                    (a) => a.question_id === questions[idx]?.id && a.selected !== -1
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => navigateToQuestion(idx)}
                      className="cursor-pointer transition-all"
                      style={{
                        width: isCurrent ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: isCurrent
                          ? ACCENT
                          : hasAnswer
                            ? "rgba(34,197,94,0.6)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    />
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={handleNavNext}
                disabled={questionIdx >= questions.length - 1}
                className="h-[44px] px-5 rounded-[12px] font-['Outfit',sans-serif] text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(240,240,248,0.8)",
                }}
              >
                <span className="flex items-center gap-1">
                  Next <ChevronRight size={14} />
                </span>
              </button>
            </div>

            {/* Submit button - full width */}
            <button
              onClick={handleNext}
              disabled={submitting || revealed}
              className="w-full h-[52px] rounded-[14px] font-['Outfit',sans-serif] text-[15px] font-bold text-white cursor-pointer transition-all disabled:opacity-40"
              style={{
                background: revealed ? "rgba(34,197,94,0.2)" : ACCENT,
                border: revealed ? "1px solid #22c55e" : "none",
                boxShadow: !revealed ? `0 6px 20px ${ACCENT}45` : "none",
              }}
            >
              {submitting
                ? "Submitting…"
                : revealed
                  ? "✓ Submitted"
                  : selected !== null
                    ? "Submit Answer"
                    : "Skip Question"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ff-ag-mobile  { display: flex !important; }
          .ff-ag-desktop { display: none  !important; }
        }
        @media (min-width: 769px) {
          .ff-ag-mobile  { display: none  !important; }
          .ff-ag-desktop { display: block !important; }
        }
        @keyframes ff-score-float {
          0%   { opacity: 1; transform: translateY(0)    scale(1);    }
          30%  { opacity: 1; transform: translateY(-10px) scale(1.15); }
          100% { opacity: 0; transform: translateY(-32px) scale(0.9); }
        }
      `}</style>
    </>
  );
}

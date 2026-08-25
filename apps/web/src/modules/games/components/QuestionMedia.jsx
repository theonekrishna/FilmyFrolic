// ─── QuestionMedia ────────────────────────────────────────────────────────────
// Renders the appropriate media element (image, video, or audio) for a game
// question based on its `question_type` and `media_url`.

import { useState, useRef } from "react";
import { Play, Pause, Volume2, ImageOff, Film, Music } from "lucide-react";

const ACCENT = "#7c5cfc";

/**
 * @param {{ question: Object, blurAmt?: number, variant?: "mobile"|"desktop" }} props
 */
export default function QuestionMedia({ question, blurAmt = 0, variant = "mobile" }) {
  const q = question;
  if (!q || !q.media_url) return null;

  const type = (q.question_type ?? "").toLowerCase();

  if (type === "image") {
    return <ImageMedia src={q.media_url} blurAmt={blurAmt} variant={variant} />;
  }

  if (type === "video") {
    return <VideoMedia src={q.media_url} variant={variant} />;
  }

  if (type === "audio") {
    return <AudioMedia src={q.media_url} variant={variant} />;
  }

  return null;
}

// ─── Image ────────────────────────────────────────────────────────────────────

function ImageMedia({ src, blurAmt, variant }) {
  const [hasError, setHasError] = useState(false);
  const h = variant === "desktop" ? 240 : 200;

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center gap-2"
        style={{
          height: h,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <ImageOff size={20} color="rgba(240,240,248,0.3)" />
        <span
          className="font-['Outfit',sans-serif] text-[13px]"
          style={{ color: "rgba(240,240,248,0.3)" }}
        >
          Image could not be loaded
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: h }}>
      <img
        src={src}
        alt="Question media"
        className="w-full h-full object-cover transition-all duration-500"
        style={{
          filter: blurAmt > 0 ? `blur(${blurAmt}px)` : "none",
          transform: blurAmt > 0 ? "scale(1.06)" : "scale(1)",
        }}
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(8,8,16,0.1) 0%, rgba(8,8,16,0.4) 100%)",
        }}
      />
      {/* Blur status badge */}
      {blurAmt > 0 && (
        <div
          className="absolute top-[10px] left-[10px] rounded-[7px] px-[10px] py-[3px] font-['Outfit',sans-serif] text-[10px] font-bold backdrop-blur-[6px]"
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "rgba(240,240,248,0.6)",
          }}
        >
          {blurAmt > 10
            ? "🌫️ Revealing…"
            : blurAmt > 3
              ? "👀 Getting clearer…"
              : "🔍 Now you see it!"}
        </div>
      )}
      {/* Type badge */}
      <div
        className="absolute top-[10px] right-[10px] rounded-[7px] px-[10px] py-[3px] font-['Outfit',sans-serif] text-[10px] font-bold backdrop-blur-[6px] flex items-center gap-1"
        style={{
          background: "rgba(0,0,0,0.7)",
          color: "rgba(240,240,248,0.5)",
        }}
      >
        <ImageOff size={10} /> IMAGE
      </div>
    </div>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────────

function VideoMedia({ src, variant }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const h = variant === "desktop" ? 280 : 220;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (hasError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2"
        style={{
          height: h,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Film size={24} color="rgba(240,240,248,0.3)" />
        <span
          className="font-['Outfit',sans-serif] text-[13px]"
          style={{ color: "rgba(240,240,248,0.3)" }}
        >
          Video could not be loaded
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: h, background: "#000" }}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        style={{ background: "#000" }}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        playsInline
        preload="metadata"
        controlsList="nodownload"
        controls
      />

      {/* Play overlay — only shown when NOT playing */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={togglePlay}
        >
          <div
            className="flex items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              width: 56,
              height: 56,
              background: ACCENT,
              boxShadow: `0 4px 20px ${ACCENT}60`,
            }}
          >
            <Play size={24} color="#fff" fill="#fff" />
          </div>
        </div>
      )}

      {/* Type badge */}
      <div
        className="absolute top-[10px] right-[10px] rounded-[7px] px-[10px] py-[3px] font-['Outfit',sans-serif] text-[10px] font-bold backdrop-blur-[6px] flex items-center gap-1 z-10"
        style={{
          background: "rgba(0,0,0,0.7)",
          color: "rgba(240,240,248,0.5)",
        }}
      >
        <Film size={10} /> VIDEO
      </div>
    </div>
  );
}

// ─── Audio ────────────────────────────────────────────────────────────────────

function AudioMedia({ src, variant }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const animRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressLoop();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animRef.current);
    }
  };

  const startProgressLoop = () => {
    const tick = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        if (!audioRef.current.paused) {
          animRef.current = requestAnimationFrame(tick);
        }
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setProgress(pct * duration);
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (hasError) {
    return (
      <div
        className="flex items-center justify-center gap-2"
        style={{
          padding: variant === "desktop" ? "28px 24px" : "20px 16px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <Music size={20} color="rgba(240,240,248,0.3)" />
        <span
          className="font-['Outfit',sans-serif] text-[13px]"
          style={{ color: "rgba(240,240,248,0.3)" }}
        >
          Audio could not be loaded
        </span>
      </div>
    );
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="flex flex-col gap-3"
      style={{
        padding: variant === "desktop" ? "28px 24px" : "20px 16px",
        background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(124,92,252,0.02) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          cancelAnimationFrame(animRef.current);
        }}
        onError={() => setHasError(true)}
      />

      {/* Top row: badge */}
      <div className="flex items-center justify-between">
        <div
          className="rounded-full px-3 py-[3px] font-['Outfit',sans-serif] text-[10px] font-bold flex items-center gap-1"
          style={{
            background: `${ACCENT}18`,
            border: `1px solid ${ACCENT}40`,
            color: ACCENT,
          }}
        >
          <Music size={10} /> AUDIO
        </div>
        <span
          className="font-['Outfit',sans-serif] text-[11px]"
          style={{ color: "rgba(240,240,248,0.35)" }}
        >
          {formatTime(progress)} / {formatTime(duration)}
        </span>
      </div>

      {/* Player row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center rounded-full cursor-pointer border-none shrink-0 transition-transform hover:scale-105 active:scale-95"
          style={{
            width: 44,
            height: 44,
            background: ACCENT,
            boxShadow: `0 4px 16px ${ACCENT}50`,
          }}
        >
          {isPlaying ? (
            <Pause size={18} color="#fff" fill="#fff" />
          ) : (
            <Play size={18} color="#fff" fill="#fff" />
          )}
        </button>

        {/* Waveform / progress bar */}
        <div
          className="flex-1 relative cursor-pointer h-[32px] flex items-center"
          onClick={handleSeek}
        >
          {/* Background track */}
          <div
            className="w-full h-[6px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
              }}
            />
          </div>
          {/* Decorative waveform bars */}
          <div className="absolute inset-0 flex items-center justify-around px-1 pointer-events-none">
            {Array.from({ length: 28 }).map((_, i) => {
              const barH = 4 + Math.sin(i * 0.7) * 6 + Math.cos(i * 1.3) * 4;
              const isActive = (i / 28) * 100 < pct;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: 2,
                    height: barH,
                    background: isActive ? ACCENT : "rgba(255,255,255,0.12)",
                    opacity: isPlaying ? 1 : 0.6,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Volume icon */}
        <Volume2 size={16} color="rgba(240,240,248,0.3)" className="shrink-0" />
      </div>

      {/* Listen hint */}
      <div
        className="font-['Outfit',sans-serif] text-[11px] text-center"
        style={{ color: "rgba(240,240,248,0.35)" }}
      >
        🎧 Listen carefully and choose your answer below
      </div>
    </div>
  );
}

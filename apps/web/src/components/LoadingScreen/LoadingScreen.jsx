import { useEffect, useState } from "react";
import "./LoadingScreen.css";

const STEPS = [
  { id: "auth", label: "Checking session" },
  { id: "modules", label: "Loading modules" },
  { id: "ready", label: "Ready" },
];

export default function LoadingScreen({ visible, authDone, modulesDone }) {
  const [shouldRender, setShouldRender] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  // Advance step indicators as each flag resolves
  useEffect(() => {
    if (authDone && activeIdx < 1) setActiveIdx(1);
  }, [authDone]);

  useEffect(() => {
    if (modulesDone && activeIdx < 2) setActiveIdx(2);
  }, [modulesDone]);

  // Unmount after fade-out completes
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => setShouldRender(false), 650);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div className={`ls-overlay${!visible ? " ls-out" : ""}`}>
      {/* Brand */}
      <div className="ls-brand ls-anim-1">
        <div className="ls-logo">🎬</div>
        <div className="ls-name">FILMY FROLIC</div>
      </div>

      {/* Dual counter-rotating rings */}
      <div className="ls-ring-wrap ls-anim-2">
        <div className="ls-ring" />
        <div className="ls-ring-inner" />
      </div>

      {/* Step indicators — driven by real state */}
      <div className="ls-steps ls-anim-3">
        {STEPS.map((s, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "";
          return (
            <div key={s.id} className={`ls-step ${state}`}>
              <div className="ls-dot" />
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar — real-state driven widths */}
      <div className="ls-bar-wrap ls-anim-4">
        <div
          className="ls-bar"
          style={{
            width: activeIdx === 0 ? "20%" : activeIdx === 1 ? "60%" : "95%",
          }}
        />
      </div>

      <p className="ls-label ls-anim-4">LOADING</p>
    </div>
  );
}

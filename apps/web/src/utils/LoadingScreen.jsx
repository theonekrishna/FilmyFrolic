import { useEffect, useState } from "react";
import "./LoadingScreen.css";

export default function LoadingScreen({ visible }) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!visible) {
      // keep in DOM for fade-out duration, then unmount
      const t = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div className={`ls-overlay ${!visible ? "ls-fade-out" : ""}`}>
      <div className="ls-center">
        {/* Ring spinner */}
        <div className="ls-ring">
          <div className="ls-ring-inner" />
        </div>

        {/* Bouncing dots */}
        <div className="ls-dots">
          <span className="ls-dot" style={{ animationDelay: "0s" }} />
          <span className="ls-dot" style={{ animationDelay: "0.18s" }} />
          <span className="ls-dot" style={{ animationDelay: "0.36s" }} />
        </div>

        <p className="ls-label">Loading…</p>
      </div>
    </div>
  );
}

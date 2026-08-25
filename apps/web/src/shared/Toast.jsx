// src/modules/core/components/Toast.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const TOAST_CONFIG = {
  success: { Icon: CheckCircle2, accent: "#1fd1a8", label: "Success" },
  error: { Icon: XCircle, accent: "#e84545", label: "Error" },
  info: { Icon: Info, accent: "#3b82f6", label: "Info" },
  warning: { Icon: AlertTriangle, accent: "#f5c518", label: "Warning" },
};

export function SingleToast({ id, type, title, message, duration = 4000, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const [leaving, setLeaving] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(id), 280);
  }, [id, onDismiss]);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
      else dismiss();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [duration, dismiss]);

  const { Icon, accent } = TOAST_CONFIG[type];

  return (
    <div
      className={`w-[320px] bg-[#12121e] border border-[rgba(255,255,255,0.09)] rounded-[12px] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] flex-shrink-0 transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        leaving ? "translate-x-[340px] opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      {/* Content */}
      <div className="flex items-start gap-3.5 p-[14px_14px_12px]">
        <div className="flex-shrink-0 mt-[1px]">
          <Icon size={17} color={accent} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-outfit text-[13px] font-bold text-[#f0f0f8] leading-[1.3] mb-${message ? "1" : "0"}`}
          >
            {title}
          </div>
          {message && (
            <div className="font-outfit text-[12px] font-light text-[rgba(240,240,248,0.45)] leading-[1.5]">
              {message}
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          className="flex items-center justify-center p-0 opacity-40 hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
        >
          <X size={14} className="text-[#f0f0f8]" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full opacity-70 transition-[width] duration-[50ms] linear"
          style={{ width: `${progress}%`, background: accent }}
        />
      </div>
    </div>
  );
}

// Toast container
export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook for easy usage
let _counter = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = (type, title, message, duration) => {
    const id = String(++_counter);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return {
    toasts,
    dismiss,
    success: (title, message, duration) => toast("success", title, message, duration),
    error: (title, message, duration) => toast("error", title, message, duration),
    info: (title, message, duration) => toast("info", title, message, duration),
    warning: (title, message, duration) => toast("warning", title, message, duration),
  };
}

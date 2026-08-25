import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

// ───  Shared/BottomSheet ───────────────────────────────────────
// Mobile: 90vh, drag-to-dismiss swipe, keyboard-aware sliding
// Desktop: 85vh, mouse close, escape key
// Handle: 36×4px pill · rgba(255,255,255,0.20) · centered 12px from top
// Backdrop: rgba(0,0,0,0.70) + blur(6px)

export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  titleRight,
  accentColor = "#f5c518",
  children,
  stickyHeader,
  footer,
  maxHeight = "85vh",
  mobileMaxHeight = "90vh",
  noPadding = false,
  keyboardAware = false,
}) {
  const sheetRef = useRef(null);

  // ── Drag-to-dismiss ──────────────────────────────────────────────────────
  const dragStartY = useRef(0);
  const lastDeltaY = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  const onHandleTouchStart = useCallback((e) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const onHandleTouchMove = useCallback((e) => {
    const delta = Math.max(0, e.touches[0].clientY - dragStartY.current);
    lastDeltaY.current = delta;
    setDragOffset(delta);
  }, []);

  const onHandleTouchEnd = useCallback(() => {
    if (lastDeltaY.current > 80) {
      onClose();
    }
    lastDeltaY.current = 0;
    setDragOffset(0);
  }, [onClose]);

  // Reset drag offset when closed
  useEffect(() => {
    if (!open) {
      setDragOffset(0);
      lastDeltaY.current = 0;
    }
  }, [open]);

  // ── Keyboard awareness (visualViewport) ──────────────────────────────────
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (!keyboardAware || !open) {
      setKeyboardInset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;

    const handler = () => {
      const inset = window.innerHeight - vv.height - (vv.offsetTop || 0);
      setKeyboardInset(Math.max(0, inset));
    };

    vv.addEventListener("resize", handler);
    vv.addEventListener("scroll", handler);
    return () => {
      vv.removeEventListener("resize", handler);
      vv.removeEventListener("scroll", handler);
      setKeyboardInset(0);
    };
  }, [open, keyboardAware]);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── Lock body scroll when open ────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isDragging = dragOffset > 0;
  const sheetTranslate = open ? dragOffset : "105%";

  return (
    <>
      <style>{`@media(max-width:768px){.ff-bs-panel[data-mh]{max-height:var(--ff-bs-mh,90vh) !important}}`}</style>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className={`
    fixed inset-0 z-[1000] 
    bg-black bg-opacity-70 
    backdrop-blur-md 
    transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
  `}
      />

      {/* ── Sheet panel ───────────────────────────────────────────────────── */}
      <div
        ref={sheetRef}
        className="ff-bs-panel fixed bottom-0 left-0 right-0 z-[1001] w-screen bg-[#0d0d18] rounded-t-[20px] flex flex-col border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)]"
        data-mh={mobileMaxHeight}
        style={{
          ["--ff-bs-mh"]: mobileMaxHeight,
          maxHeight: maxHeight,
          transform: `translateY(${sheetTranslate}${typeof sheetTranslate === "number" ? "px" : ""})`,
          transition: isDragging
            ? "bottom 0.2s ease"
            : "transform 0.32s cubic-bezier(0.4,0,0.2,1), bottom 0.22s ease",
          bottom: keyboardInset,
          willChange: "transform",
        }}
      >
        {/* ── Handle + title chrome ─────────────────────────────────────── */}
        <div
          className="ff-bs-chrome flex-shrink-0 select-none"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
        >
          {/* Drag handle pill */}
          <div className="flex justify-center pt-[12px] px-[20px]">
            <div className="w-[36px] h-[4px] rounded-full bg-white/20 cursor-grab" />
          </div>

          {/* Title row */}
          {(title || subtitle || titleRight) && (
            <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-white/7">
              <div className="flex-1 min-w-0">
                {title && (
                  <div className="font-outfit font-bold text-[16px] text-[#f0f0f8] leading-[1.2] mb-[3px] truncate">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="font-outfit text-[11px] font-light text-white/38">{subtitle}</div>
                )}
              </div>

              <div className="flex items-center gap-[10px] flex-shrink-0 ml-[12px]">
                {titleRight}

                {/* Accent dot */}
                <div
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{
                    background: accentColor,
                    boxShadow: `0 0 7px ${accentColor}`,
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-[32px] h-[32px] rounded-[10px] border border-white/9 bg-white/6 flex items-center justify-center cursor-pointer p-0 flex-shrink-0"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
                  }
                >
                  <X size={14} color="rgba(240,240,248,0.55)" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky header slot ────────────────────────────── */}
        {stickyHeader && (
          <div className="flex-shrink-0 border-b border-white/6">{stickyHeader}</div>
        )}

        {/* ── Scrollable content ────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            padding: noPadding ? 0 : "12px 20px 24px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        {/* ── Footer slot ─────────────────────────────────── */}
        {footer && <div className="flex-shrink-0 border-t border-white/7">{footer}</div>}
      </div>
    </>
  );
}

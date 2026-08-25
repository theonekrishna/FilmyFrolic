/**
 * PolicySectionList — Accordion list of all sections for the active policy.
 * Uses: id, title, description, sort_order, is_active
 */

import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function PolicySectionList({ sections = [], accentColor = "#7c5cfc" }) {
  const [expanded, setExpanded] = useState(null);

  // Filter inactive, sort by sort_order
  const visible = [...sections]
    .filter((s) => s.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (!visible.length) {
    return (
      <div className="text-center py-16 font-['Outfit'] text-sm text-white/25">
        <div className="text-3xl mb-3">📄</div>
        No sections available for this policy.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((section, index) => {
        const isOpen = expanded === section.id;
        const num = section.sort_order ?? index + 1;

        return (
          <div
            key={section.id}
            className="rounded-xl overflow-hidden"
            style={{
              background: isOpen
                ? `linear-gradient(135deg, ${accentColor}0e, rgba(13,13,22,0.9))`
                : "rgba(255,255,255,0.025)",
              border: `1px solid ${isOpen ? `${accentColor}35` : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s ease",
              boxShadow: isOpen ? `0 0 20px ${accentColor}10` : "none",
            }}
          >
            {/* ── Toggle header ──────────────────────────────────────────── */}
            <button
              onClick={() => setExpanded(isOpen ? null : section.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer group"
            >
              {/* Number badge */}
              <span
                className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center font-['Bebas_Neue'] text-sm leading-none transition-all"
                style={{
                  background: isOpen ? `${accentColor}22` : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isOpen ? `${accentColor}45` : "rgba(255,255,255,0.1)"}`,
                  color: isOpen ? accentColor : "rgba(255,255,255,0.35)",
                  boxShadow: isOpen ? `0 0 10px ${accentColor}30` : "none",
                }}
              >
                {num}
              </span>

              {/* Section title */}
              <span
                className="flex-1 font-['Outfit'] text-[13.5px] leading-snug transition-colors"
                style={{
                  color: isOpen ? "#f0f0f8" : "rgba(240,240,248,0.65)",
                  fontWeight: isOpen ? 600 : 400,
                }}
              >
                {section.title}
              </span>

              {/* Arrow */}
              <ChevronRight
                size={14}
                className="flex-shrink-0 transition-all duration-200"
                style={{
                  color: isOpen ? accentColor : "rgba(255,255,255,0.2)",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* ── Expanded body ──────────────────────────────────────────── */}
            {isOpen && (
              <div className="px-4 pb-4">
                {/* Gradient rule */}
                <div
                  className="mb-3"
                  style={{
                    height: 1,
                    background: `linear-gradient(to right, ${accentColor}35, transparent 80%)`,
                  }}
                />

                <p
                  className="font-['Outfit'] text-[13px] leading-[1.8] whitespace-pre-line"
                  style={{ color: "rgba(240,240,248,0.5)" }}
                >
                  {section.description}
                </p>

                {/* Section marker */}
                <div className="mt-3.5 flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{
                      color: accentColor,
                      background: `${accentColor}10`,
                      border: `1px solid ${accentColor}25`,
                      opacity: 0.7,
                    }}
                  >
                    §{num}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

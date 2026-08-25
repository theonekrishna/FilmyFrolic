/**
 * PolicySidebar — desktop vertical nav + mobile horizontal tab strip.
 * Each item shows the policy's own icon and accent color.
 */

import { PolicyIcon } from "../utils/policyIcons";

export default function PolicySidebar({ policies, activeSlug, onSelect, loading }) {
  /* ── Skeleton ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-11 rounded-xl animate-pulse"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── DESKTOP: vertical nav ───────────────────────────────────────── */}
      <nav className="hidden md:flex flex-col gap-1" aria-label="Policy navigation">
        {policies.map((policy) => {
          const isActive = policy.slug === activeSlug;
          const color = policy.color || "#7c5cfc";

          return (
            <button
              key={policy.slug}
              onClick={() => onSelect(policy.slug)}
              className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group overflow-hidden"
              style={{
                background: isActive ? `${color}15` : "transparent",
                border: `1px solid ${isActive ? `${color}40` : "transparent"}`,
              }}
            >
              {/* Active left-bar indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                  style={{ background: color }}
                />
              )}

              {/* Icon container */}
              <span
                className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: isActive ? `${color}22` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? `${color}40` : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <PolicyIcon
                  name={policy.icon}
                  size={14}
                  color={isActive ? color : "rgba(255,255,255,0.35)"}
                />
              </span>

              {/* Title */}
              <span
                className="font-['Outfit'] text-[13px] truncate transition-colors"
                style={{
                  color: isActive ? "#f0f0f8" : "rgba(240,240,248,0.5)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {policy.title}
              </span>

              {/* Hover glow — invisible until hover */}
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `${color}08` }}
              />
            </button>
          );
        })}
      </nav>

      {/* ── MOBILE: horizontal scrollable tab strip ─────────────────────── */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-1 ff-no-scrollbar">
        {policies.map((policy) => {
          const isActive = policy.slug === activeSlug;
          const color = policy.color || "#7c5cfc";

          return (
            <button
              key={policy.slug}
              onClick={() => onSelect(policy.slug)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11.5px] font-['Outfit'] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
              style={{
                background: isActive ? `${color}18` : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${isActive ? `${color}50` : "rgba(255,255,255,0.07)"}`,
                color: isActive ? color : "rgba(240,240,248,0.45)",
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? `0 0 14px ${color}20` : "none",
              }}
            >
              <PolicyIcon
                name={policy.icon}
                size={12}
                color={isActive ? color : "rgba(255,255,255,0.35)"}
              />
              {policy.title}
            </button>
          );
        })}
      </div>
    </>
  );
}

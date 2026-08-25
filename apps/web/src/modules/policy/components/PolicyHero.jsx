/**
 * PolicyHero — Banner header for the active policy.
 * Uses: id, title, slug, description, icon, color, is_active, sections[]
 */

import { PolicyIcon } from "../utils/policyIcons";
import { CheckCircle2, Hash, Layers } from "lucide-react";

export default function PolicyHero({ policy }) {
  if (!policy) return null;

  const accent = policy.color || "#7c5cfc";
  const sectionCount = Array.isArray(policy.sections)
    ? policy.sections.filter((s) => s.is_active !== false).length
    : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5"
      style={{
        background: `linear-gradient(135deg, ${accent}18 0%, #0d0d16 55%, ${accent}0a 100%)`,
        border: `1px solid ${accent}30`,
        boxShadow: `0 0 40px ${accent}0c`,
      }}
    >
      {/* Background glow blobs */}
      <div
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: accent, opacity: 0.07 }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-2xl pointer-events-none"
        style={{ background: accent, opacity: 0.05 }}
      />

      <div className="relative p-5 md:p-6 lg:p-7">
        {/* ── Top row ───────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          {/* Icon badge */}
          <div
            className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accent}28, ${accent}12)`,
              border: `1.5px solid ${accent}50`,
              boxShadow: `0 4px 20px ${accent}30, inset 0 1px 0 ${accent}25`,
            }}
          >
            <PolicyIcon name={policy.icon} size={24} color={accent} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            {/* Title line */}
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1
                className="font-['Bebas_Neue'] tracking-wide leading-none"
                style={{ fontSize: "clamp(22px, 4vw, 32px)", color: "#f0f0f8" }}
              >
                {policy.title}
              </h1>

              {/* Active status badge */}
              {policy.is_active && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full font-['Outfit'] text-[10px] font-semibold flex-shrink-0"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.28)",
                    color: "#34d399",
                  }}
                >
                  <CheckCircle2 size={8} />
                  Active
                </span>
              )}
            </div>

            {/* Description */}
            {policy.description && (
              <p
                className="font-['Outfit'] text-[13px] leading-[1.65] max-w-2xl"
                style={{ color: "rgba(240,240,248,0.48)" }}
              >
                {policy.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div
          className="my-4"
          style={{
            height: 1,
            background: `linear-gradient(to right, ${accent}25, transparent 70%)`,
          }}
        />

        {/* ── Meta row ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Slug */}
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg"
            style={{
              color: "rgba(240,240,248,0.3)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Hash size={9} />
            {policy.slug}
          </span>

          {/* Section count */}
          {sectionCount > 0 && (
            <span
              className="inline-flex items-center gap-1.5 font-['Outfit'] text-[11px] px-2.5 py-1 rounded-lg"
              style={{
                color: "rgba(240,240,248,0.3)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Layers size={9} />
              {sectionCount} section{sectionCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

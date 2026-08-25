import { Lock } from "lucide-react";
import { BADGES } from "../data/userprofile";

const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
export default function BadgesTab() {
  const earned = BADGES.filter((b) => b.unlocked);
  const locked = BADGES.filter((b) => !b.unlocked);
  return (
    <div>
      {/* Earned */}
      <div className="mb-[28px]">
        <div className="font-[Bebas_Neue] text-[15px] tracking-[2px] text-[var(--accent)] mb-[14px] flex items-center gap-[8px]">
          Earned
          <span
            className="rounded-full py-[2px] px-[10px] font-[Outfit] text-[11px] font-[700]"
            style={{
              background: `${ACCENT}18`,
              border: `1px solid ${ACCENT}30`,
            }}
          >
            {earned.length}
          </span>
        </div>

        <div className="grid gap-[12px] grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
          {earned.map((badge) => (
            <div
              key={badge.id}
              className="bg-[#12121e] rounded-[14px] py-[16px] px-[10px] text-center cursor-pointer transition-all duration-200"
              style={{
                border: `1px solid ${badge.color}25`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 6px 20px ${badge.color}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px] mx-auto mb-[10px]"
                style={{
                  background: `${badge.color}18`,
                  border: `2px solid ${badge.color}40`,
                }}
              >
                {badge.emoji}
              </div>

              <div className="font-[Outfit] text-[11px] font-[700] text-[#f0f0f8] mb-[3px] leading-[1.3]">
                {badge.label}
              </div>

              <div className="font-[Outfit] text-[9px] font-[600]" style={{ color: badge.color }}>
                Unlocked
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locked */}
      <div>
        <div className="font-[Bebas_Neue] text-[15px] tracking-[2px] text-[rgba(240,240,248,0.25)] mb-[14px] flex items-center gap-[8px]">
          Locked
          <span
            className="rounded-full py-[2px] px-[10px] font-[Outfit] text-[11px] font-[700] text-[rgba(240,240,248,0.3)]"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {locked.length}
          </span>
        </div>

        <div className="grid gap-[12px] grid-cols-[repeat(auto-fill,minmax(110px,1fr))]">
          {locked.map((badge) => (
            <div
              key={badge.id}
              className="bg-[#0e0e1a] border border-[rgba(255,255,255,0.06)] rounded-[14px] py-[16px] px-[10px] text-center opacity-[0.45] grayscale"
            >
              <div className="w-[52px] h-[52px] rounded-full bg-[rgba(255,255,255,0.04)] border-[2px] border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[22px] mx-auto mb-[10px]">
                <Lock size={18} color="rgba(240,240,248,0.3)" />
              </div>

              <div className="font-[Outfit] text-[11px] font-[600] text-[rgba(240,240,248,0.35)] mb-[3px]">
                ???
              </div>

              <div className="font-[Outfit] text-[9px] font-[600] text-[rgba(240,240,248,0.2)]">
                Locked
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

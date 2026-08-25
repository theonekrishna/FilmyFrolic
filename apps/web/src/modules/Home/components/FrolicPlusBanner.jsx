import { Zap, Star, Flame, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: Zap, label: "4K HDR", color: "#f5c518" },
  { icon: Star, label: "Originals", color: "#7c5cfc" },
  { icon: Flame, label: "Early Access", color: "#e84545" },
];

export default function FrolicPlusBanner() {
  return (
    <div className="px-4 md:px-8 pt-6 pb-8 md:pb-12">
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(245,197,24,0.18)] bg-[linear-gradient(135deg,rgba(245,197,24,0.1),rgba(232,69,69,0.07))] p-5">
        <div className="pointer-events-none absolute -top-10 -right-10 w-[140px] h-[140px] rounded-full bg-[rgba(245,197,24,0.08)] blur-[30px]" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-[14px]">
          <div className="md:flex-1">
            <div className="font-bebas text-[24px] tracking-[2px] text-[#f0f0f8] leading-none mb-[5px]">
              Upgrade to Frolic+
            </div>
            <p className="font-outfit text-[12px] font-light text-[rgba(240,240,248,0.5)] leading-relaxed m-0">
              4K streaming, offline downloads &amp; exclusive early access.
            </p>
          </div>

          <div className="flex gap-[7px] flex-wrap">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-[5px] rounded-full px-[11px] py-[5px]"
                style={{
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon size={10} color={color} />
                <span className="font-outfit text-[11px] font-semibold" style={{ color }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button className="flex items-center justify-center gap-2 w-full md:w-auto md:min-w-[160px] bg-[#f5c518] border-none rounded-xl px-6 py-[13px] font-outfit text-[14px] font-bold text-[#080810] cursor-pointer shadow-[0_6px_20px_rgba(245,197,24,0.35)] min-h-[44px] hover:brightness-110 transition-all">
            Get Frolic+ <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

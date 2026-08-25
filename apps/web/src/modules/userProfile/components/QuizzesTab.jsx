import { QUIZ_HISTORY } from "../data/userprofile";
const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
export default function QuizzesTab() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-[10px] mb-[20px]">
        {[
          { label: "Quizzes Done", value: "34", color: ACCENT },
          { label: "Avg Score", value: "74%", color: GOLD },
          { label: "Certifications", value: "3", color: "#7c5cfc" },
          { label: "Best Streak", value: "12d", color: "#e84545" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] py-[16px] px-[18px]"
          >
            <div
              className="font-[Bebas_Neue] text-[28px] tracking-[1px] leading-[1] mb-[4px]"
              style={{ color: s.color }}
            >
              {s.value}
            </div>

            <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[10px]">
        {QUIZ_HISTORY.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-[14px] bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[14px] py-[14px] px-[18px] cursor-pointer transition-colors duration-[180ms]"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${ACCENT}25`)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
          >
            <span className="text-[28px] shrink-0">{q.emoji}</span>

            <div className="flex-1 min-w-0">
              <div className="font-[Outfit] text-[13px] font-[600] text-[#f0f0f8] mb-[3px] overflow-hidden whitespace-nowrap text-ellipsis">
                {q.title}
              </div>

              <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)]">
                {q.date}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div
                className="font-[Bebas_Neue] text-[22px] tracking-[1px] leading-[1]"
                style={{
                  color: q.score >= 80 ? ACCENT : q.score >= 60 ? GOLD : "#e84545",
                }}
              >
                {q.score}%
              </div>

              <div className="h-[3px] bg-[rgba(255,255,255,0.08)] rounded-[2px] mt-[4px] w-[56px]">
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${q.score}%`,
                    background: q.score >= 80 ? ACCENT : q.score >= 60 ? GOLD : "#e84545",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

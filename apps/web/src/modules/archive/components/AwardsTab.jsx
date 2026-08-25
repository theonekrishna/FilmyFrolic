export default function AwardsTab({ awards = [] }) {
  if (awards.length === 0) {
    return (
      <p
        className="px-4 text-[12px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.35)",
        }}
      >
        No awards listed.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-4">
      {awards.map((award) => (
        <div
          key={award._id ?? `${award.name}-${award.year}`}
          className="flex items-center gap-3 rounded-[12px] px-4 py-3.5"
          style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span className="text-[22px] flex-shrink-0">🏆</span>
          <div className="min-w-0">
            <div
              className="text-[13px] font-semibold text-[#f0f0f8]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {award.name}
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "rgba(240,240,248,0.4)",
              }}
            >
              {award.category} · {award.year}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

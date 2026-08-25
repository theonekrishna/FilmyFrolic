const ACCENT = "#f5c518";
export default function TriviaTab({ trivia }) {
  return (
    <div className="flex flex-col gap-2.5 px-4">
      <h3
        className="mb-1 text-[18px]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: 1.5,
          color: "#f0f0f8",
        }}
      >
        Did You Know?
      </h3>

      {trivia.map((fact, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-xl p-3"
          style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-[7px]"
            style={{
              width: 26,
              height: 26,
              background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}30`,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 14,
              color: ACCENT,
            }}
          >
            {i + 1}
          </div>
          <p
            className="text-[13px] leading-[1.65] font-light"
            style={{
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.65)",
              margin: 0,
            }}
          >
            {fact}
          </p>
        </div>
      ))}
    </div>
  );
}

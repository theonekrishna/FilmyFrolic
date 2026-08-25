const ACCENT = "#f5c518";

export default function OverviewTab({ movie }) {
  return (
    <div className="px-4">
      {/* Synopsis */}
      <h3
        className="text-[#f0f0f8] mb-2"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 18,
          letterSpacing: 1.5,
        }}
      >
        Synopsis
      </h3>
      <p
        className="mb-5 text-[14px] text-[rgba(240,240,248,0.65)] leading-[1.75] font-light"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {movie.description} The film is a tour de force of modern storytelling, weaving intricate
        character arcs with breathtaking set pieces that push the limits of what cinema can achieve.
        Critics have praised it as a defining work of its generation.
      </p>

      {/* Ratings panel */}
      <div className="flex items-center gap-4 mb-5 p-4 rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[#12121e]">
        {/* IMDb score */}
        <div className="flex-none text-center">
          <div
            className="text-[42px] leading-[1] font-bold"
            style={{
              fontFamily: "'Bebas Neue', cursive",
              color: ACCENT,
              letterSpacing: 2,
            }}
          >
            {movie.rating}
          </div>
          <div className="text-[10px] text-[rgba(240,240,248,0.35)] font-sans">IMDb · /10</div>
        </div>

        <div className="w-[1px] h-12 bg-[rgba(255,255,255,0.07)] flex-shrink-0" />

        {/* Tomatometer + Audience */}
        <div className="flex flex-1 justify-center gap-3">
          {[
            { label: "Tomatometer", value: "94%", color: "#e84545" },
            { label: "Audience", value: "91%", color: "#2ecc71" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div
                className="mb-1 text-[24px] leading-[1] font-bold"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  color,
                  letterSpacing: 1,
                }}
              >
                {value}
              </div>
              <div
                className="text-[9px] text-[rgba(240,240,248,0.35)] uppercase tracking-[0.5px]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Badge */}
        {movie.badge && (
          <>
            <div className="w-[1px] h-12 bg-[rgba(255,255,255,0.07)] flex-shrink-0" />
            <div className="flex-none text-center">
              <div className="text-[22px] mb-1">🏆</div>
              <div
                className="text-[13px] leading-[1] font-bold"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  color: ACCENT,
                  letterSpacing: 1,
                }}
              >
                {movie.badge}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details grid */}
      <h3
        className="text-[#f0f0f8] mb-2"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 18,
          letterSpacing: 1.5,
        }}
      >
        Details
      </h3>
      <div className="grid grid-cols-2 gap-x-4">
        {[
          ["Director", "Ana Kovacs"],
          ["Writers", "Marcus Hale, Ana Kovacs"],
          ["Studio", "Filmy Frolic Originals"],
          ["Runtime", movie.duration],
          ["Language", "English"],
          ["Release", String(movie.year)],
          ["Budget", "$180M"],
          ["Box Office", "$847M worldwide"],
        ].map(([label, value]) => (
          <div key={label} className="py-2 border-b border-[rgba(255,255,255,0.05)]">
            <div
              className="text-[10px] text-[rgba(240,240,248,0.3)] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {label}
            </div>
            <div
              className="text-[12px] font-medium text-[#f0f0f8]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

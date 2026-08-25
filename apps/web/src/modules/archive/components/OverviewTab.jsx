const ACCENT = "#f5c518";

export default function OverviewTab({ movie }) {
  if (!movie) return null;

  const languagesStr = Array.isArray(movie.languages)
    ? movie.languages.join(", ")
    : movie.languages || "English";

  const detailsList = [
    ["Director", movie.director || "—"],
    ["Writers", movie.writers || "—"],
    ["Studio", movie.studio || "—"],
    ["Runtime", movie.duration || "—"],
    ["Language", languagesStr || "—"],
    ["Release", movie.year ? String(movie.year) : "—"],
    ["Budget", movie.budget || "—"],
    ["Box Office", movie.boxOffice || "—"],
  ];

  return (
    <div className="px-4 md:px-8">
      {/* Synopsis */}
      <h3
        className="text-[#f0f0f8] mb-2"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 20,
          letterSpacing: 1.5,
        }}
      >
        Synopsis
      </h3>
      <p
        className="mb-6 text-[14px] md:text-[15px] text-[rgba(240,240,248,0.7)] leading-[1.75] font-light max-w-[800px]"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {movie.description || "Synopsis for this title will be available soon."}
      </p>

      {/* Ratings panel */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[#12121e] max-w-[600px]">
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
            {movie.rating || "0.0"}
          </div>
          <div className="text-[10px] text-[rgba(240,240,248,0.35)] font-sans">IMDb · /10</div>
        </div>

        <div className="w-[1px] h-12 bg-[rgba(255,255,255,0.07)] flex-shrink-0" />

        {/* Tomatometer + Audience */}
        <div className="flex flex-1 justify-center gap-6">
          {[
            {
              label: "Tomatometer",
              value: movie.rating ? `${Math.min(Math.round(movie.rating * 10.5), 99)}%` : "—",
              color: "#e84545",
            },
            {
              label: "Audience",
              value: movie.rating ? `${Math.min(Math.round(movie.rating * 10.2), 98)}%` : "—",
              color: "#2ecc71",
            },
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
        className="text-[#f0f0f8] mb-3"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 20,
          letterSpacing: 1.5,
        }}
      >
        Details
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 max-w-[800px]">
        {detailsList.map(([label, value]) => (
          <div key={label} className="py-2 border-b border-[rgba(255,255,255,0.05)]">
            <div
              className="text-[10px] text-[rgba(240,240,248,0.35)] uppercase tracking-wider mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {label}
            </div>
            <div
              className="text-[13px] font-medium text-[#f0f0f8] truncate"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              title={value}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

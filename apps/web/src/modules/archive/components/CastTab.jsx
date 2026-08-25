const ACCENT = "#f5c518";

const ACTOR_GRADS = [
  "linear-gradient(135deg, #f5c518, #e84545)",
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #ec4899, #8b5cf6)",
  "linear-gradient(135deg, #f97316, #eab308)",
];

function getActorGrad(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return ACTOR_GRADS[Math.abs(h) % ACTOR_GRADS.length];
}

function Avatar({ name = "", photo, initials, size }) {
  return (
    <div
      className="flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid transparent",
        background: photo ? "transparent" : getActorGrad(name),
        fontFamily: "'Outfit', sans-serif",
        fontSize: size * 0.23,
        color: "#080810",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.style.background = getActorGrad(name);
            e.currentTarget.parentElement.textContent = initials || name.slice(0, 2).toUpperCase();
          }}
        />
      ) : (
        initials || name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

export default function CastTab({ cast = [], crew = [] }) {
  const safeCast = Array.isArray(cast) ? cast : [];
  const safeCrew = Array.isArray(crew) ? crew : [];

  return (
    <div className="px-4 md:px-8">
      {/* Main Cast Title */}
      <h3
        className="mb-3"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 20,
          letterSpacing: 1.5,
          color: "#f0f0f8",
        }}
      >
        Main Cast
      </h3>

      {safeCast.length === 0 ? (
        <p
          className="text-[13px] mb-6"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.4)",
          }}
        >
          No cast information available for this title.
        </p>
      ) : (
        <div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-6"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {safeCast.map((actor, i) => (
            <div
              key={actor.name ? `${actor.name}-${i}` : i}
              className="flex-shrink-0"
              style={{ width: 100, scrollSnapAlign: "start" }}
            >
              <div className="flex flex-col items-center gap-2 px-1">
                <Avatar name={actor.name} photo={actor.photo} initials={actor.initials} size={72} />

                {/* Name and role */}
                <div className="text-center min-w-0 w-full">
                  <div
                    className="text-[12px] font-semibold text-[#f0f0f8] truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    title={actor.name}
                  >
                    {actor.name || "Unknown"}
                  </div>
                  <div
                    className="text-[10px] text-[rgba(240,240,248,0.4)] mt-0.5 truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    title={actor.role}
                  >
                    {actor.role || "Actor"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crew List */}
      <h3
        className="mt-2 mb-3"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 20,
          letterSpacing: 1.5,
          color: "#f0f0f8",
        }}
      >
        Crew
      </h3>

      {safeCrew.length === 0 ? (
        <p
          className="text-[13px]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.4)",
          }}
        >
          No crew information available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[800px]">
          {safeCrew.map((member, i) => (
            <div
              key={member.name ? `${member.name}-${i}` : i}
              className="flex items-center gap-3 rounded-[12px] px-3.5 py-2.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Avatar
                name={member.name}
                photo={member.photo}
                initials={member.initials}
                size={44}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="text-[13px] font-semibold text-[#f0f0f8] truncate"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.name || "Unknown"}
                </div>
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ fontFamily: "'Outfit', sans-serif", color: ACCENT }}
                >
                  {member.role || "Crew"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

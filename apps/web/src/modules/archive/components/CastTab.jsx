const ACCENT = "#f5c518";

function getActorGrad(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return ACTOR_GRADS[Math.abs(h) % ACTOR_GRADS.length];
}

function Avatar({ name, photo, initials, size }) {
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
            e.currentTarget.parentElement.textContent = initials;
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

export default function CastTab({ cast = [], crew = [] }) {
  return (
    <div>
      {/* Main Cast Title */}
      <h3
        className="mb-3"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 18,
          letterSpacing: 1.5,
          color: "#f0f0f8",
          marginLeft: 16,
        }}
      >
        Main Cast
      </h3>

      {cast.length === 0 ? (
        <p
          className="text-[12px]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.35)",
            marginLeft: 16,
          }}
        >
          No cast information available.
        </p>
      ) : (
        <div
          className="flex gap-1 overflow-x-auto pb-2"
          style={{
            scrollSnapType: "x mandatory",
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          {cast.map((actor, i) => (
            <div
              key={actor.name + i}
              className="flex-shrink-0"
              style={{ width: 84, scrollSnapAlign: "start" }}
            >
              <div className="flex flex-col items-center gap-1.5 px-1">
                <Avatar name={actor.name} photo={actor.photo} initials={actor.initials} size={64} />

                {/* Name and role */}
                <div className="text-center min-w-0 w-full">
                  <div
                    className="text-[11px] font-semibold text-[#f0f0f8] truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {actor.name.split(" ")[0]}
                  </div>
                  <div
                    className="text-[9px] text-[rgba(240,240,248,0.38)] mt-0.5 truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {actor.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Crew List */}
      <h3
        className="mt-4 mb-3"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 18,
          letterSpacing: 1.5,
          color: "#f0f0f8",
          marginLeft: 16,
        }}
      >
        Crew
      </h3>

      {crew.length === 0 ? (
        <p
          className="text-[12px]"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: "rgba(240,240,248,0.35)",
            marginLeft: 16,
          }}
        >
          No crew information available.
        </p>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {crew.map((member, i) => (
            <div
              key={member.name + i}
              className="flex items-center gap-3 rounded-[12px] px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Avatar
                name={member.name}
                photo={member.photo}
                initials={member.initials}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <div
                  className="text-[13px] font-semibold text-[#f0f0f8] truncate"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {member.name}
                </div>
                <div
                  className="text-[11px] mt-0.5 truncate"
                  style={{ fontFamily: "'Outfit', sans-serif", color: ACCENT }}
                >
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

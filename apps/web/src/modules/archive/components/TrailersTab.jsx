import { Youtube, Music, Ticket } from "lucide-react";

const ACCENT = "#f5c518";

const SECTIONS = [
  { key: "trailerLink", label: "Trailers", icon: Youtube, color: "#e84545" },
  { key: "songsLink", label: "Songs", icon: Music, color: "#1db954" },
  { key: "eventsLink", label: "Events", icon: Ticket, color: ACCENT },
];

export default function TrailersTab({ movie }) {
  const hasAny = SECTIONS.some((s) => (movie[s.key] ?? []).length > 0);

  if (!hasAny) {
    return (
      <p
        className="px-4 text-[12px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.35)",
        }}
      >
        No trailers, songs, or events available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4">
      {SECTIONS.map(({ key, label, icon: Icon, color }) => {
        const links = movie[key] ?? [];
        if (links.length === 0) return null;

        return (
          <div key={key}>
            <h3
              className="mb-2.5 flex items-center gap-2 text-[15px]"
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: 1.5,
                color: "#f0f0f8",
              }}
            >
              <Icon size={15} color={color} />
              {label}
            </h3>
            <div className="flex flex-col gap-2.5">
              {links.map((link, i) => (
                <a
                  key={link + i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-[12px] overflow-hidden no-underline"
                  style={{
                    background: "#12121e",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="relative flex-shrink-0 w-[100px] h-[88px]">
                    <img src={movie.image} alt={label} className="w-full h-full object-cover" />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(8,8,16,0.5)" }}
                    >
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 32,
                          height: 32,
                          background: `${color}CC`,
                        }}
                      >
                        <Icon size={14} color="#080810" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center px-3.5 py-3 min-w-0">
                    <div
                      className="mb-1 text-[12px] font-semibold text-[#f0f0f8]"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {label.replace(/s$/, "")} {i + 1}
                    </div>
                    <div
                      className="text-[11px] truncate"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        color: "rgba(240,240,248,0.4)",
                      }}
                    >
                      {link}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

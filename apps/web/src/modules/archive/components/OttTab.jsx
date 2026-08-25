import { ExternalLink } from "lucide-react";
const ACCENT = "#f5c518";

export default function OttTab({ ottAvailability = [] }) {
  if (ottAvailability.length === 0) {
    return (
      <p
        className="px-4 text-[12px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.35)",
        }}
      >
        Not available on any platform yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 px-4">
      {ottAvailability.map((p) => (
        <a
          key={p._id ?? p.platformName}
          href={p.link ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-3 rounded-[12px] px-4 py-3.5 no-underline"
          style={{
            background: "#12121e",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="min-w-0">
            <div
              className="text-[13px] font-semibold text-[#f0f0f8] mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {p.platformName}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(p.availableType ?? []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] rounded-full px-2 py-0.5"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: ACCENT,
                    background: `${ACCENT}15`,
                    border: `1px solid ${ACCENT}30`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <ExternalLink size={16} color="rgba(240,240,248,0.4)" className="flex-shrink-0" />
        </a>
      ))}
    </div>
  );
}

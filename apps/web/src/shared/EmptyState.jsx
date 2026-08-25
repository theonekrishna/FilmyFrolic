// ─── Shared/EmptyState ─────────────────────────────────────────
// Variants: module (social / content / entertain / user / core)
// Large emoji icon, Bebas Neue 24px heading, muted 14px subtext, optional CTA
const MODULE_CONFIG = {
  core: {
    accent: "#e84545",
    icon: "🏠",
    heading: "Nothing here yet",
    body: "Your home feed will fill up as you explore movies, follow users, and rate titles.",
    cta: "Explore Movies",
  },
  social: {
    accent: "#3b82f6",
    icon: "📰",
    heading: "Your feed is empty",
    body: "Follow communities and curators to see their picks, reviews, and discussions here.",
    cta: "Discover Communities",
  },
  content: {
    accent: "#f5c518",
    icon: "🎬",
    heading: "No content found",
    body: "We couldn't find anything matching your filters. Try broadening your search or changing genres.",
    cta: "Clear Filters",
  },
  entertain: {
    accent: "#7c5cfc",
    icon: "🎮",
    heading: "Nothing to play",
    body: "Check back soon — new games, quizzes, and meme drops are added every week.",
    cta: "Browse Games",
  },
  user: {
    accent: "#1fd1a8",
    icon: "👤",
    heading: "Nothing saved yet",
    body: "Add movies to your watchlist, rate titles, and your history will appear here.",
    cta: "Start Exploring",
  },
};

export default function EmptyState({ module = "content", icon, heading, body, cta, onCta }) {
  const cfg = MODULE_CONFIG[module];

  const displayIcon = icon ?? cfg.icon;
  const displayHeading = heading ?? cfg.heading;
  const displayBody = body ?? cfg.body;
  const displayCta = cta ?? cfg.cta;
  const accent = cfg.accent;

  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-14 gap-0">
      {/* Icon */}
      <div
        className="flex items-center justify-center mb-5 text-[36px] rounded-[24px]"
        style={{
          background: `${accent}10`,
          border: `1px solid ${accent}22`,
          boxShadow: `0 4px 20px ${accent}18`,
          width: 80,
          height: 80,
        }}
      >
        {displayIcon}
      </div>

      {/* Heading */}
      <h3
        className="mb-2 text-[#f0f0f8]"
        style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: 24,
          letterSpacing: 2,
          lineHeight: 1,
        }}
      >
        {displayHeading}
      </h3>

      {/* Body */}
      <p
        className="mb-7 font-light text-[14px]"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.4)",
          lineHeight: 1.6,
          maxWidth: 360,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {displayBody}
      </p>

      {/* CTA */}
      {displayCta && (
        <button
          onClick={onCta}
          className="rounded-full font-outfit font-bold text-[13px] text-[#080810] cursor-pointer"
          style={{
            background: accent,
            padding: "11px 28px",
            boxShadow: `0 4px 20px ${accent}30`,
            transition: "transform 0.15s, box-shadow 0.15s",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 8px 28px ${accent}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 20px ${accent}30`;
          }}
        >
          {displayCta}
        </button>
      )}
    </div>
  );
}

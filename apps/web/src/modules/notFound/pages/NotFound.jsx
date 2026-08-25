import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

const features = [
  {
    icon: "🎬",
    title: "Archive",
    desc: "Browse thousands of movies & shows",
    path: "/content/archive",
  },
  {
    icon: "📰",
    title: "Social Feed",
    desc: "See what film fans are sharing",
    path: "/social/feed",
  },
  {
    icon: "💬",
    title: "Communities",
    desc: "Join genre-based film communities",
    path: "/social/communities",
  },
  {
    icon: "🎙️",
    title: "Rooms",
    desc: "Join live discussion rooms with movie fans",
    path: "/social/rooms",
  },
  {
    icon: "🎮",
    title: "Games",
    desc: "Play fun movie & entertainment games",
    path: "/entertain/games",
  },
  {
    icon: "🔥",
    title: "Gossips",
    desc: "Latest buzz from the film world",
    path: "/content/gossip",
  },
  {
    icon: "😂",
    title: "Memes",
    desc: "Funniest movie & TV memes",
    path: "/entertain/memes",
  },
];

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 - Page Not Found | FilmyFrolic";
  }, []);

  return (
    <div className="nf-root">
      {/* Top Film Strip */}
      <div className="nf-filmstrip">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="nf-hole" />
        ))}
      </div>

      {/* Main */}
      <div className="nf-main">
        <div className="nf-content">
          {/* Brand */}
          <button className="nf-brand" onClick={() => navigate("/")} aria-label="Go to homepage">
            <span className="nf-brand-dot" />
            FilmyFrolic
          </button>

          {/* Hero */}
          <div className="nf-hero">
            <div className="nf-spotlight" />

            {/* Particles */}
            <div className="nf-particles">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="nf-particle" />
              ))}
            </div>

            {/* 404 */}
            <div className="nf-code">
              <span>4</span>

              <span className="nf-reel">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="36" stroke="#f5c518" strokeWidth="3" />

                  <circle cx="40" cy="40" r="12" fill="#f5c518" opacity="0.15" />

                  <circle cx="40" cy="40" r="5" fill="#f5c518" />

                  {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;

                    const cx = 40 + 24 * Math.cos(rad);
                    const cy = 40 + 24 * Math.sin(rad);

                    return <circle key={i} cx={cx} cy={cy} r="4.5" fill="#f5c518" opacity="0.7" />;
                  })}

                  {[30, 150, 270].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;

                    const x2 = 40 + 32 * Math.cos(rad);
                    const y2 = 40 + 32 * Math.sin(rad);

                    return (
                      <line
                        key={i}
                        x1="40"
                        y1="40"
                        x2={x2}
                        y2={y2}
                        stroke="#f5c518"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                    );
                  })}
                </svg>
              </span>

              <span>4</span>
            </div>

            {/* Text */}
            <h1 className="nf-title">Scene Not Found</h1>

            <p className="nf-sub">
              Looks like this page got left on the cutting room floor.
              <br />
              The URL you entered does not exist or may have been moved.
            </p>

            {/* Buttons */}
            <div className="nf-actions">
              <button className="nf-btn-primary" onClick={() => navigate("/")}>
                ← Back to Home
              </button>

              <button className="nf-btn-ghost" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="nf-divider-wrap">
            <div className="nf-divider-line" />

            <span className="nf-divider-text">Explore FilmyFrolic</span>

            <div className="nf-divider-line" />
          </div>

          {/* Description */}
          <p className="nf-platform-desc">
            FilmyFrolic is your premium dark-themed hub for discovering, discussing, and obsessing
            over movies & shows — where streaming meets social networking for true film enthusiasts.
          </p>

          {/* Features */}
          <div className="nf-features">
            {features.map((f) => (
              <Link key={f.path} to={f.path} className="nf-feature-card">
                <span className="nf-feature-icon">{f.icon}</span>

                <span className="nf-feature-title">{f.title}</span>

                <span className="nf-feature-desc">{f.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Film Strip */}
      <div className="nf-filmstrip">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="nf-hole" />
        ))}
      </div>
    </div>
  );
}

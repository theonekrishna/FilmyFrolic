import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import HeroSection from "../components/HeroSection";
import DesktopCategoryRow from "../components/DesktopCategoryRow";
import { useHomeMovies } from "../hooks/useHomeMovies";

function SectionSkeleton() {
  return (
    <div className="pt-6 px-4 md:px-8">
      <div className="h-5 w-32 bg-white/10 rounded mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-[130px] md:w-[170px] h-[195px] md:h-[255px] rounded-xl bg-white/5 animate-pulse shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { featuredMovie, featuredMovies, allTitles, loading, error, refetch } = useHomeMovies();

  if (error) {
    return (
      <div className="bg-[#080810] min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
        <p className="text-white/70 text-sm">Couldn't load movies right now.</p>
        <p className="text-white/40 text-xs">{error}</p>
        <button
          onClick={refetch}
          className="bg-[#f5c518] text-[#080810] font-semibold text-sm px-5 py-2 rounded-full"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#080810] min-h-screen pb-20 md:pb-0">
        <TopBar />

        {loading ? (
          <div className="w-full h-[240px] md:h-[520px] animate-pulse bg-white/5" />
        ) : (
          <HeroSection movie={featuredMovie} movies={featuredMovies} />
        )}

        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="pt-6 flex flex-col gap-8 pb-12">
            <DesktopCategoryRow
              title="Top Movies & Series"
              movies={allTitles}
              badge="⭐ Top Picks"
              badgeColor="#f5c518"
              navigate={navigate}
              onSeeAll={() => navigate("/content/archive")}
            />

            {/* Quick Gossip Highlights Banner */}
            <div className="px-4 md:px-8">
              <div className="bg-gradient-to-r from-orange-950/40 via-red-950/20 to-purple-950/40 border border-orange-500/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                    🔥 Hot Community Buzz
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-white mt-2 font-['Outfit']">
                    Fan Theories & Industry Rumors
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 mt-1 max-w-xl">
                    Explore unverified fan speculation, casting rumors, and vote your stance on the
                    latest entertainment topics.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/content/gossip")}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shrink-0"
                >
                  Explore Gossips
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
          .ff-section-title { font-size: 20px !important; }
          .ff-section-header { margin-bottom: 10px !important; }
          .ff-home-section { padding-top: 20px !important; }
        }

        @media (min-width: 769px) {
          .ff-section-header { padding: 0 32px !important; margin-bottom: 16px !important; }
          .ff-section-title { font-size: 22px !important; }
          .ff-home-section { padding-top: 32px !important; }
        }
      `}</style>
    </>
  );
}

import SectionHeader from "./SectionHeader";
import NewReleaseCard from "./NewReleaseCard";

export default function NewReleasesSection({ movies = [], navigate }) {
  return (
    <section className="pt-6">
      <SectionHeader
        title="New Releases"
        badge={String(new Date().getFullYear())}
        badgeColor="#4d91ff"
        onSeeAll={() => navigate("/content/archive")}
      />
      <div className="px-4 md:px-8">
        <div className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-1 pb-3 scrollbar-hide">
          {movies.map((movie) => (
            <NewReleaseCard key={movie.id} movie={movie} navigate={navigate} />
          ))}
        </div>
      </div>
    </section>
  );
}

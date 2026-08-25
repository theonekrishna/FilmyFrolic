import { useState } from "react";
import SectionHeader from "./SectionHeader";
import TrendingMovieCard from "./TrendingMovieCard";

const ACCENT = "#e84545";

export default function TrendingNowSection({ movies = [], navigate }) {
  const [liked, setLiked] = useState(new Set());

  return (
    <section className="pt-6">
      <SectionHeader
        title="Trending Now"
        badge="Hot"
        badgeColor={ACCENT}
        onSeeAll={() => navigate("/content/trending")}
      />

      <div className="px-4 md:px-8">
        <div
          className="
            flex gap-3 md:gap-4
            overflow-x-auto
            scroll-smooth
            snap-x snap-mandatory
            pt-1 pb-3
            scrollbar-hide
          "
        >
          {movies.map((movie) => (
            <TrendingMovieCard
              key={movie.id}
              movie={movie}
              navigate={navigate}
              liked={liked}
              setLiked={setLiked}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

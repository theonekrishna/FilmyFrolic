import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Flame, Star, Play, Sparkles, Film } from "lucide-react-native";
import { CinematicCard } from "../../src/components/ui/CinematicCard";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { movieService, MOCK_MOVIES } from "../../src/services/movieService";
import type { Movie } from "@filmyfrolic/types";

const GENRES = ["All", "Sci-Fi", "Action", "Thriller", "Drama", "Romance", "Anime"];

export default function HomeScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const loadData = async () => {
    setLoading(true);
    const data = await movieService.getTrendingMovies();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const featuredMovie = movies[0] || MOCK_MOVIES[0];

  const filteredMovies =
    selectedGenre === "All" ? movies : movies.filter((m) => m.genre?.includes(selectedGenre));

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c5ce7" />
      }
    >
      {/* Featured Hero Banner */}
      <TouchableOpacity
        style={styles.heroContainer}
        onPress={() => router.push(`/movie/${featuredMovie.id}`)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: featuredMovie.backdropUrl || featuredMovie.poster }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient}>
          <View style={styles.heroTag}>
            <Sparkles size={12} color="#fdcb6e" />
            <Text style={styles.heroTagText}>FEATURED BLOCKBUSTER</Text>
          </View>

          <Text style={styles.heroTitle}>{featuredMovie.title}</Text>
          <Text style={styles.heroSynopsis} numberOfLines={2}>
            {featuredMovie.synopsis}
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => router.push(`/movie/${featuredMovie.id}`)}
              activeOpacity={0.8}
            >
              <Play size={16} color="#fff" fill="#fff" />
              <Text style={styles.playBtnText}>Explore Movie</Text>
            </TouchableOpacity>
            <View style={styles.ratingBadge}>
              <Star size={14} color="#fdcb6e" fill="#fdcb6e" />
              <Text style={styles.ratingBadgeText}>{featuredMovie.rating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Genre Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genreScroll}
        contentContainerStyle={styles.genreContainer}
      >
        {GENRES.map((g) => {
          const active = selectedGenre === g;
          return (
            <TouchableOpacity
              key={g}
              style={[styles.genrePill, active && styles.genrePillActive]}
              onPress={() => setSelectedGenre(g)}
            >
              <Text style={[styles.genreText, active && styles.genreTextActive]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Trending Movies Horizontal Carousel */}
      <SectionHeader
        title="TRENDING MOVIES"
        subtitle="Most watched titles across FilmyFrolic"
        icon={<Flame size={18} color="#e84545" />}
      />

      {loading ? (
        <ActivityIndicator color="#6c5ce7" style={{ marginVertical: 30 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {filteredMovies.map((movie) => (
            <CinematicCard
              key={movie.id}
              movie={movie}
              onPress={() => router.push(`/movie/${movie.id}`)}
            />
          ))}
        </ScrollView>
      )}

      {/* Top Rated Section */}
      <SectionHeader
        title="TOP RATED & CRITICS CHOICE"
        subtitle="Highest FilmyScore reviews this month"
        icon={<Star size={18} color="#fdcb6e" />}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {[...movies].reverse().map((movie) => (
          <CinematicCard
            key={`top-${movie.id}`}
            movie={movie}
            onPress={() => router.push(`/movie/${movie.id}`)}
          />
        ))}
      </ScrollView>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  heroContainer: {
    height: 280,
    width: "100%",
    position: "relative",
    backgroundColor: "#12121e",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(10,10,18,0.75)",
    justifyContent: "flex-end",
  },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(253,203,110,0.15)",
    borderColor: "rgba(253,203,110,0.3)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  heroTagText: {
    color: "#fdcb6e",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#f0f0f8",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  heroSynopsis: {
    color: "rgba(240,240,248,0.6)",
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playBtn: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ratingBadgeText: {
    color: "#fdcb6e",
    fontSize: 13,
    fontWeight: "800",
  },
  genreScroll: {
    marginVertical: 14,
  },
  genreContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  genrePill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  genrePillActive: {
    backgroundColor: "#6c5ce7",
    borderColor: "#6c5ce7",
  },
  genreText: {
    color: "rgba(240,240,248,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  genreTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  carouselContainer: {
    paddingHorizontal: 16,
  },
});

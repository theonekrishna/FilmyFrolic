import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Bookmark,
  Play,
  Share2,
  Check,
} from "lucide-react-native";
import { MovieBadge } from "../../src/components/ui/MovieBadge";
import { movieService, MOCK_MOVIES } from "../../src/services/movieService";
import type { Movie } from "@filmyfrolic/types";

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await movieService.getMovieDetails(id);
      setMovie(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !movie) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={[styles.iconCircle, isSaved && styles.iconCircleActive]}
            onPress={() => setIsSaved(!isSaved)}
          >
            {isSaved ? <Check size={18} color="#00b894" /> : <Bookmark size={18} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle}>
            <Share2 size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Backdrop Banner */}
        <View style={styles.backdropWrapper}>
          <Image
            source={{ uri: movie.backdropUrl || movie.poster }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <View style={styles.backdropOverlay} />
        </View>

        {/* Poster & Main Header Info */}
        <View style={styles.contentBody}>
          <View style={styles.posterHeaderRow}>
            <Image source={{ uri: movie.poster }} style={styles.posterImage} resizeMode="cover" />
            <View style={styles.mainInfo}>
              <Text style={styles.title}>{movie.title}</Text>
              <Text style={styles.directorText}>Directed by {movie.director || "Unknown"}</Text>

              <View style={styles.ratingRow}>
                <Star size={16} color="#fdcb6e" fill="#fdcb6e" />
                <Text style={styles.ratingScore}>
                  {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                </Text>
                <Text style={styles.ratingMax}>/10 IMDb</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Calendar size={12} color="rgba(240,240,248,0.5)" />
                  <Text style={styles.metaText}>{movie.releaseYear}</Text>
                </View>
                {movie.duration && (
                  <View style={styles.metaBadge}>
                    <Clock size={12} color="rgba(240,240,248,0.5)" />
                    <Text style={styles.metaText}>{movie.duration}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Genres */}
          <View style={styles.genreRow}>
            {movie.genre?.map((g) => (
              <MovieBadge key={g} label={g} color="#6c5ce7" />
            ))}
          </View>

          {/* Play Trailer CTA */}
          <TouchableOpacity style={styles.trailerBtn} activeOpacity={0.85}>
            <Play size={18} color="#fff" fill="#fff" />
            <Text style={styles.trailerBtnText}>Watch Official Trailer</Text>
          </TouchableOpacity>

          {/* Synopsis */}
          <Text style={styles.sectionHeader}>SYNOPSIS</Text>
          <Text style={styles.synopsisText}>{movie.synopsis}</Text>

          {/* Cast & Crew */}
          {movie.cast && movie.cast.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>TOP CAST</Text>
              <View style={styles.castRow}>
                {movie.cast.map((actor) => (
                  <View key={actor} style={styles.castPill}>
                    <Text style={styles.castText}>{actor}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0a0a12",
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(10,10,18,0.75)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleActive: {
    backgroundColor: "rgba(0,184,148,0.2)",
    borderColor: "rgba(0,184,148,0.4)",
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scroll: {
    flex: 1,
  },
  backdropWrapper: {
    height: 240,
    width: "100%",
    position: "relative",
  },
  backdropImage: {
    width: "100%",
    height: "100%",
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,18,0.4)",
  },
  contentBody: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  posterHeaderRow: {
    flexDirection: "row",
    gap: 14,
  },
  posterImage: {
    width: 110,
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mainInfo: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    color: "#f0f0f8",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },
  directorText: {
    color: "rgba(240,240,248,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingScore: {
    color: "#fdcb6e",
    fontSize: 16,
    fontWeight: "900",
  },
  ratingMax: {
    color: "rgba(240,240,248,0.35)",
    fontSize: 11,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    color: "rgba(240,240,248,0.6)",
    fontSize: 11,
    fontWeight: "600",
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 16,
  },
  trailerBtn: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  trailerBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionHeader: {
    color: "rgba(240,240,248,0.35)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 10,
  },
  synopsisText: {
    color: "rgba(240,240,248,0.7)",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
  },
  castRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  castPill: {
    backgroundColor: "#12121e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  castText: {
    color: "#f0f0f8",
    fontSize: 12,
    fontWeight: "600",
  },
});

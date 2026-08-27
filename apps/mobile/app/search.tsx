import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SearchBar } from "../src/components/ui/SearchBar";
import { MovieBadge } from "../src/components/ui/MovieBadge";
import { MOCK_MOVIES } from "../src/services/movieService";
import { MOCK_GOSSIP } from "../src/services/gossipService";
import { X, ArrowRight } from "lucide-react-native";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredMovies = query
    ? MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_MOVIES;

  const filteredGossip = query
    ? MOCK_GOSSIP.filter((g) => g.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_GOSSIP;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GLOBAL SEARCH</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={18} color="rgba(240,240,248,0.6)" />
        </TouchableOpacity>
      </View>

      <SearchBar value={query} onChangeText={setQuery} placeholder="Search movies, gossip, directors…" />

      <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>MOVIES ({filteredMovies.length})</Text>
        {filteredMovies.map((movie) => (
          <TouchableOpacity
            key={movie.id}
            style={styles.resultItem}
            onPress={() => router.push(`/movie/${movie.id}`)}
          >
            <Image source={{ uri: movie.poster }} style={styles.resultPoster} resizeMode="cover" />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{movie.title}</Text>
              <Text style={styles.resultMeta}>
                {movie.releaseYear} • {movie.director}
              </Text>
            </View>
            <ArrowRight size={16} color="rgba(240,240,248,0.3)" />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>GOSSIP & NEWS ({filteredGossip.length})</Text>
        {filteredGossip.map((gossip) => (
          <TouchableOpacity
            key={gossip.id}
            style={styles.resultItem}
            onPress={() => router.push(`/gossip/${gossip.id}`)}
          >
            <View style={styles.resultInfo}>
              <MovieBadge label={gossip.category} color="#0984e3" />
              <Text style={styles.resultTitle} numberOfLines={1}>
                {gossip.title}
              </Text>
              <Text style={styles.resultMeta}>{gossip.publishedAt}</Text>
            </View>
            <ArrowRight size={16} color="rgba(240,240,248,0.3)" />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: "#f0f0f8",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionLabel: {
    color: "rgba(240,240,248,0.35)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#12121e",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  resultPoster: {
    width: 40,
    height: 56,
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    color: "#f0f0f8",
    fontSize: 14,
    fontWeight: "700",
  },
  resultMeta: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
  },
});

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import type { Movie } from "@filmyfrolic/types";

interface CinematicCardProps {
  movie: Movie;
  onPress: () => void;
  width?: number;
}

export const CinematicCard: React.FC<CinematicCardProps> = ({ movie, onPress, width = 150 }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: movie.poster }}
          style={styles.poster}
          resizeMode="cover"
        />
        {movie.rating && (
          <View style={styles.ratingBadge}>
            <Star size={11} color="#fdcb6e" fill="#fdcb6e" />
            <Text style={styles.ratingText}>{movie.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {movie.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {movie.releaseYear} • {movie.genre ? movie.genre[0] : "Movie"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 14,
  },
  imageWrapper: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#12121e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(10,10,18,0.85)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(253,203,110,0.3)",
  },
  ratingText: {
    color: "#fdcb6e",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#f0f0f8",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
    marginTop: 2,
  },
});

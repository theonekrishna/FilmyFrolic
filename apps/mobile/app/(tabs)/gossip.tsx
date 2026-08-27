import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Newspaper, Heart, MessageSquare, Clock, Share2 } from "lucide-react-native";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { MovieBadge } from "../../src/components/ui/MovieBadge";
import { gossipService, MOCK_GOSSIP } from "../../src/services/gossipService";
import type { Gossip } from "@filmyfrolic/types";

const CATEGORIES = ["All", "Nolan", "Marvel", "Tollywood", "Bollywood", "Anime"];

export default function GossipScreen() {
  const router = useRouter();
  const [gossipList, setGossipList] = useState<Gossip[]>(MOCK_GOSSIP);
  const [selectedCat, setSelectedCat] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const loadGossip = async () => {
    const data = await gossipService.getTrendingGossip();
    setGossipList(data);
  };

  useEffect(() => {
    loadGossip();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGossip();
    setRefreshing(false);
  };

  const filtered =
    selectedCat === "All"
      ? gossipList
      : gossipList.filter((g) => g.category === selectedCat);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c5ce7" />
      }
    >
      <SectionHeader
        title="BREAKING GOSSIP & REEL NEWS"
        subtitle="Inside rumors, studio reveals and verified updates"
        icon={<Newspaper size={18} color="#0984e3" />}
      />

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContainer}
      >
        {CATEGORIES.map((c) => {
          const active = selectedCat === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.catPill, active && styles.catPillActive]}
              onPress={() => setSelectedCat(c)}
            >
              <Text style={[styles.catText, active && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Articles Feed */}
      <View style={styles.feedContainer}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/gossip/${item.id}`)}
            activeOpacity={0.85}
          >
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <MovieBadge label={item.category} color="#0984e3" />
                <View style={styles.timeRow}>
                  <Clock size={12} color="rgba(240,240,248,0.4)" />
                  <Text style={styles.timeText}>{item.publishedAt}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardContent} numberOfLines={3}>
                {item.content}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.authorText}>by @{item.author}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Heart size={14} color="#e84545" fill="#e84545" />
                    <Text style={styles.statText}>{item.likesCount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MessageSquare size={14} color="rgba(240,240,248,0.4)" />
                    <Text style={styles.statText}>{item.commentsCount}</Text>
                  </View>
                  <TouchableOpacity style={styles.shareBtn}>
                    <Share2 size={14} color="rgba(240,240,248,0.5)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  catScroll: {
    marginBottom: 16,
  },
  catContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  catPillActive: {
    backgroundColor: "#0984e3",
    borderColor: "#0984e3",
  },
  catText: {
    color: "rgba(240,240,248,0.5)",
    fontSize: 12,
    fontWeight: "600",
  },
  catTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  feedContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "#12121e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 11,
  },
  cardTitle: {
    color: "#f0f0f8",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    lineHeight: 22,
  },
  cardContent: {
    color: "rgba(240,240,248,0.55)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  authorText: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "rgba(240,240,248,0.6)",
    fontSize: 12,
    fontWeight: "700",
  },
  shareBtn: {
    padding: 2,
  },
});

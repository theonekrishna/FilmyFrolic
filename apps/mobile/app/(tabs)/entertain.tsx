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
import { Gamepad2, Play, ThumbsUp, Plus, Award, Flame, Sparkles } from "lucide-react-native";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { MovieBadge } from "../../src/components/ui/MovieBadge";
import { entertainService, MOCK_QUIZZES, MOCK_MEMES } from "../../src/services/entertainService";
import type { Quiz, Meme } from "@filmyfrolic/types";

const GAMES = [
  { id: "g1", title: "Film Trivia Blitz", desc: "60-second rapid quiz", color: "#6c5ce7", plays: "28.4K" },
  { id: "g2", title: "Movie Wordle", desc: "Guess movie title in 6 tries", color: "#fdcb6e", plays: "19.2K" },
  { id: "g3", title: "Scene It?", desc: "Identify movies from screenshots", color: "#0984e3", plays: "12.1K" },
  { id: "g4", title: "Rating Roulette", desc: "Guess IMDb ratings", color: "#00cec9", plays: "8.7K" },
];

export default function EntertainScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [memes, setMemes] = useState<Meme[]>(MOCK_MEMES);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"quizzes" | "games" | "memes">("quizzes");

  const loadData = async () => {
    const qData = await entertainService.getQuizzes();
    const mData = await entertainService.getMemes();
    setQuizzes(qData);
    setMemes(mData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpvote = (id: string) => {
    setMemes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, upvotes: m.upvotes + 1 } : m))
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c5ce7" />
      }
    >
      <SectionHeader
        title="CINEMA ENTERTAINMENT"
        subtitle="Quizzes, daily mini-games and community memes"
        icon={<Gamepad2 size={18} color="#fdcb6e" />}
      />

      {/* Sub Tabs */}
      <View style={styles.tabBar}>
        {(["quizzes", "games", "memes"] as const).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tab === "quizzes" && (
        <View style={styles.sectionContainer}>
          {quizzes.map((quiz) => (
            <View key={quiz.id} style={styles.quizCard}>
              {quiz.imageUrl && (
                <Image source={{ uri: quiz.imageUrl }} style={styles.quizImage} resizeMode="cover" />
              )}
              <View style={styles.quizBody}>
                <View style={styles.quizHeader}>
                  <MovieBadge label={quiz.category} color="#6c5ce7" />
                  <Text style={styles.quizPlays}>{quiz.playsCount.toLocaleString()} Plays</Text>
                </View>
                <Text style={styles.quizTitle}>{quiz.title}</Text>
                <View style={styles.quizFooter}>
                  <Text style={styles.quizMeta}>{quiz.questionsCount} Questions • Avg {quiz.avgScore}%</Text>
                  <TouchableOpacity style={styles.playQuizBtn} activeOpacity={0.8}>
                    <Play size={12} color="#fff" fill="#fff" />
                    <Text style={styles.playQuizText}>Start Quiz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {tab === "games" && (
        <View style={styles.gamesGrid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderColor: `${game.color}35` }]}
              activeOpacity={0.85}
            >
              <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                <Gamepad2 size={24} color={game.color} />
              </View>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.desc}</Text>
              <View style={styles.gameFooter}>
                <Text style={[styles.gamePlays, { color: game.color }]}>{game.plays} plays</Text>
                <TouchableOpacity style={[styles.playMiniBtn, { backgroundColor: game.color }]}>
                  <Text style={styles.playMiniText}>Play</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {tab === "memes" && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.submitMemeBtn} activeOpacity={0.8}>
            <Plus size={16} color="#6c5ce7" />
            <Text style={styles.submitMemeText}>Submit New Meme</Text>
          </TouchableOpacity>

          {memes.map((meme) => (
            <View key={meme.id} style={styles.memeCard}>
              <View style={styles.memeHeader}>
                <Text style={styles.memeAuthor}>@{meme.author}</Text>
                <Text style={styles.memeTime}>{meme.submittedAt}</Text>
              </View>
              <Text style={styles.memeTitle}>{meme.title}</Text>
              {meme.imageUrl && (
                <Image source={{ uri: meme.imageUrl }} style={styles.memeImage} resizeMode="cover" />
              )}
              <View style={styles.memeFooter}>
                <TouchableOpacity
                  style={styles.upvoteBtn}
                  onPress={() => handleUpvote(meme.id)}
                  activeOpacity={0.7}
                >
                  <ThumbsUp size={14} color="#6c5ce7" />
                  <Text style={styles.upvoteText}>{meme.upvotes.toLocaleString()} Upvotes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9,
  },
  tabItemActive: {
    backgroundColor: "#6c5ce7",
  },
  tabText: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "800",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  quizCard: {
    backgroundColor: "#12121e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  quizImage: {
    width: "100%",
    height: 140,
  },
  quizBody: {
    padding: 14,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  quizPlays: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 11,
  },
  quizTitle: {
    color: "#f0f0f8",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  quizFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 10,
  },
  quizMeta: {
    color: "rgba(240,240,248,0.5)",
    fontSize: 12,
  },
  playQuizBtn: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  playQuizText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  gamesGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gameCard: {
    width: "48%",
    backgroundColor: "#12121e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  gameIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gameTitle: {
    color: "#f0f0f8",
    fontSize: 14,
    fontWeight: "800",
  },
  gameDesc: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
    minHeight: 30,
  },
  gameFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  gamePlays: {
    fontSize: 11,
    fontWeight: "700",
  },
  playMiniBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  playMiniText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  submitMemeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(108,92,231,0.12)",
    borderColor: "rgba(108,92,231,0.3)",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  submitMemeText: {
    color: "#6c5ce7",
    fontSize: 13,
    fontWeight: "700",
  },
  memeCard: {
    backgroundColor: "#12121e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    padding: 14,
    gap: 10,
  },
  memeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memeAuthor: {
    color: "#6c5ce7",
    fontSize: 12,
    fontWeight: "700",
  },
  memeTime: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 11,
  },
  memeTitle: {
    color: "#f0f0f8",
    fontSize: 14,
    fontWeight: "700",
  },
  memeImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  memeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(108,92,231,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  upvoteText: {
    color: "#6c5ce7",
    fontSize: 12,
    fontWeight: "700",
  },
});

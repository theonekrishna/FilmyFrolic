import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  User,
  Bookmark,
  Star,
  Shield,
  LogOut,
  Settings,
  Award,
  Sparkles,
} from "lucide-react-native";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { CinematicCard } from "../../src/components/ui/CinematicCard";
import { MOCK_MOVIES } from "../../src/services/movieService";
import { authService } from "../../src/services/authService";

export default function ProfileScreen() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState(MOCK_MOVIES.slice(0, 3));

  const handleLogout = async () => {
    await authService.signOut();
    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.nameText}>Sai Krishna</Text>
              <View style={styles.proTag}>
                <Sparkles size={10} color="#fdcb6e" />
                <Text style={styles.proTagText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.handleText}>@saikrishna • Movie Buff</Text>
            <Text style={styles.bioText}>
              Sci-Fi enthusiast & IMAX purist. 240+ movies logged in 2025.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Watchlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
        </View>
      </View>

      {/* Saved Watchlist */}
      <SectionHeader
        title="MY SAVED WATCHLIST"
        subtitle="Movies queued for your next watch session"
        icon={<Bookmark size={18} color="#6c5ce7" />}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {watchlist.map((movie) => (
          <CinematicCard
            key={`wl-${movie.id}`}
            movie={movie}
            onPress={() => router.push(`/movie/${movie.id}`)}
          />
        ))}
      </ScrollView>

      {/* Account Settings List */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>ACCOUNT & PREFERENCES</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={[styles.settingIcon, { backgroundColor: "rgba(108,92,231,0.15)" }]}>
            <User size={18} color="#6c5ce7" />
          </View>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>Edit Profile Information</Text>
            <Text style={styles.settingSub}>Bio, avatar, favorite genres</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={[styles.settingIcon, { backgroundColor: "rgba(253,203,110,0.15)" }]}>
            <Award size={18} color="#fdcb6e" />
          </View>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>VIP Pro Subscription</Text>
            <Text style={styles.settingSub}>Active until Dec 2026</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={16} color="#e84545" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: "#12121e",
    margin: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#6c5ce7",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nameText: {
    color: "#f0f0f8",
    fontSize: 18,
    fontWeight: "900",
  },
  proTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(253,203,110,0.15)",
    borderColor: "rgba(253,203,110,0.3)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proTagText: {
    color: "#fdcb6e",
    fontSize: 9,
    fontWeight: "900",
  },
  handleText: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 12,
    marginTop: 2,
  },
  bioText: {
    color: "rgba(240,240,248,0.65)",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    color: "#f0f0f8",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  carouselContainer: {
    paddingHorizontal: 16,
  },
  settingsSection: {
    margin: 16,
    backgroundColor: "#12121e",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 12,
  },
  sectionTitle: {
    color: "rgba(240,240,248,0.35)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingTitle: {
    color: "#f0f0f8",
    fontSize: 14,
    fontWeight: "700",
  },
  settingSub: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
    marginTop: 2,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(232,69,69,0.12)",
    borderColor: "rgba(232,69,69,0.3)",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    color: "#e84545",
    fontSize: 13,
    fontWeight: "700",
  },
});

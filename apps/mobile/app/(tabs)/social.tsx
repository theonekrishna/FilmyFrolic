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
import { Users, Radio, MessageSquare, Check, UserPlus, Flame } from "lucide-react-native";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { MovieBadge } from "../../src/components/ui/MovieBadge";
import { socialService, MOCK_COMMUNITIES, MOCK_ROOMS } from "../../src/services/socialService";
import type { Community, Room } from "@filmyfrolic/types";

export default function SocialScreen() {
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const commsData = await socialService.getCommunities();
    const roomsData = await socialService.getRooms();
    setCommunities(commsData);
    setRooms(roomsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
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
      {/* Live Watch Rooms */}
      <SectionHeader
        title="LIVE WATCH-ALONG ROOMS"
        subtitle="Join real-time movie watch parties & live discussions"
        icon={<Radio size={18} color="#e84545" />}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomsContainer}
      >
        {rooms.map((room) => (
          <TouchableOpacity key={room.id} style={styles.roomCard} activeOpacity={0.85}>
            <View style={styles.roomHeader}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE NOW</Text>
              </View>
              <View style={styles.viewerBadge}>
                <Users size={12} color="#00b894" />
                <Text style={styles.viewerText}>{room.activeViewers}</Text>
              </View>
            </View>

            <Text style={styles.roomTitle} numberOfLines={2}>
              {room.title}
            </Text>

            <View style={styles.roomFooter}>
              <Text style={styles.hostText}>Hosted by @{room.host}</Text>
              <TouchableOpacity style={styles.joinRoomBtn}>
                <Text style={styles.joinRoomText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Community Hubs */}
      <SectionHeader
        title="COMMUNITY HUBS"
        subtitle="Connect with cinema fans sharing your exact genre passion"
        icon={<Users size={18} color="#6c5ce7" />}
      />

      <View style={styles.communityContainer}>
        {communities.map((c) => (
          <View key={c.id} style={styles.communityCard}>
            <Image source={{ uri: c.bannerUrl }} style={styles.communityBanner} resizeMode="cover" />
            <View style={styles.communityBody}>
              <View style={styles.communityHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.communityName}>{c.name}</Text>
                  <Text style={styles.communityMeta}>
                    {c.membersCount.toLocaleString()} members • {c.category}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    c.isJoined && styles.joinedBtn,
                  ]}
                  onPress={() => toggleJoin(c.id)}
                >
                  {c.isJoined ? (
                    <>
                      <Check size={14} color="#00b894" />
                      <Text style={styles.joinedText}>Joined</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} color="#6c5ce7" />
                      <Text style={styles.joinText}>Join</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.communityDesc} numberOfLines={2}>
                {c.description}
              </Text>
            </View>
          </View>
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
  roomsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  roomCard: {
    width: 260,
    backgroundColor: "#12121e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(232,69,69,0.3)",
    gap: 10,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(232,69,69,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e84545",
  },
  liveText: {
    color: "#e84545",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  viewerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewerText: {
    color: "#00b894",
    fontSize: 12,
    fontWeight: "700",
  },
  roomTitle: {
    color: "#f0f0f8",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
  },
  roomFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  hostText: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
  },
  joinRoomBtn: {
    backgroundColor: "#6c5ce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinRoomText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  communityContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  communityCard: {
    backgroundColor: "#12121e",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  communityBanner: {
    width: "100%",
    height: 110,
  },
  communityBody: {
    padding: 14,
  },
  communityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  communityName: {
    color: "#f0f0f8",
    fontSize: 15,
    fontWeight: "800",
  },
  communityMeta: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 11,
    marginTop: 2,
  },
  communityDesc: {
    color: "rgba(240,240,248,0.55)",
    fontSize: 12,
    lineHeight: 16,
  },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(108,92,231,0.15)",
    borderColor: "rgba(108,92,231,0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  joinedBtn: {
    backgroundColor: "rgba(0,184,148,0.15)",
    borderColor: "rgba(0,184,148,0.3)",
  },
  joinText: {
    color: "#6c5ce7",
    fontSize: 12,
    fontWeight: "700",
  },
  joinedText: {
    color: "#00b894",
    fontSize: 12,
    fontWeight: "700",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, MessageSquare, Clock, Share2 } from "lucide-react-native";
import { MovieBadge } from "../../src/components/ui/MovieBadge";
import { MOCK_GOSSIP } from "../../src/services/gossipService";

export default function GossipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const gossip = MOCK_GOSSIP.find((g) => g.id === id) || MOCK_GOSSIP[0];

  const [likes, setLikes] = useState(gossip.likesCount);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconCircle}>
          <Share2 size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {gossip.imageUrl && (
          <Image source={{ uri: gossip.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        )}

        <View style={styles.body}>
          <View style={styles.categoryRow}>
            <MovieBadge label={gossip.category} color="#0984e3" />
            <View style={styles.timeRow}>
              <Clock size={12} color="rgba(240,240,248,0.4)" />
              <Text style={styles.timeText}>{gossip.publishedAt}</Text>
            </View>
          </View>

          <Text style={styles.title}>{gossip.title}</Text>
          <Text style={styles.author}>Written by @{gossip.author} • Verified Source</Text>

          <View style={styles.divider} />

          <Text style={styles.contentParagraph}>{gossip.content}</Text>
          <Text style={styles.contentParagraph}>
            Industry rumors indicate that studio executives have already greenlit preliminary conceptual designs.
            Fans across social platforms are actively speculating on potential casting choices and filming locations.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.likeBtn, liked && styles.likedBtn]}
              onPress={toggleLike}
              activeOpacity={0.8}
            >
              <Heart size={16} color={liked ? "#fff" : "#e84545"} fill={liked ? "#fff" : "#e84545"} />
              <Text style={[styles.likeText, liked && { color: "#fff" }]}>
                {likes.toLocaleString()} Likes
              </Text>
            </TouchableOpacity>

            <View style={styles.commentsCountBadge}>
              <MessageSquare size={16} color="rgba(240,240,248,0.5)" />
              <Text style={styles.commentsText}>{gossip.commentsCount} Comments</Text>
            </View>
          </View>
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
  scroll: {
    flex: 1,
  },
  heroImage: {
    width: "100%",
    height: 250,
  },
  body: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    color: "rgba(240,240,248,0.4)",
    fontSize: 12,
  },
  title: {
    color: "#f0f0f8",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    marginBottom: 8,
  },
  author: {
    color: "#0984e3",
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 16,
  },
  contentParagraph: {
    color: "rgba(240,240,248,0.75)",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "400",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(232,69,69,0.15)",
    borderColor: "rgba(232,69,69,0.3)",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  likedBtn: {
    backgroundColor: "#e84545",
  },
  likeText: {
    color: "#e84545",
    fontSize: 13,
    fontWeight: "700",
  },
  commentsCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  commentsText: {
    color: "rgba(240,240,248,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
});

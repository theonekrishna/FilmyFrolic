import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import {
  Film,
  Bookmark,
  MessageSquarePlus,
  Bell,
  Settings,
  Shield,
  LogOut,
  Sparkles,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { authService } from "../../services/authService";

interface DrawerContentProps {
  onClose?: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ onClose }) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (onClose) onClose();
    router.push(path as any);
  };

  const handleLogout = async () => {
    if (onClose) onClose();
    await authService.signOut();
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      {/* User Header Profile */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Filmy User</Text>
          <Text style={styles.userRole}>@filmyfrolic • VIP Pro</Text>
        </View>
        <View style={styles.vipBadge}>
          <Sparkles size={12} color="#fdcb6e" />
        </View>
      </View>

      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>EXTRA OPTIONS & TOOLS</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("/(tabs)/profile")}>
          <View style={[styles.itemIcon, { backgroundColor: "rgba(108,92,231,0.15)" }]}>
            <Bookmark size={18} color="#6c5ce7" />
          </View>
          <Text style={styles.itemText}>My Saved Watchlist</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("/search")}>
          <View style={[styles.itemIcon, { backgroundColor: "rgba(9,132,227,0.15)" }]}>
            <Film size={18} color="#0984e3" />
          </View>
          <Text style={styles.itemText}>Global Search & Archives</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate("/(tabs)/entertain")}
        >
          <View style={[styles.itemIcon, { backgroundColor: "rgba(253,203,110,0.15)" }]}>
            <MessageSquarePlus size={18} color="#fdcb6e" />
          </View>
          <Text style={styles.itemText}>Suggest Content & Feedback</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("/(tabs)/social")}>
          <View style={[styles.itemIcon, { backgroundColor: "rgba(0,184,148,0.15)" }]}>
            <Bell size={18} color="#00b894" />
          </View>
          <Text style={styles.itemText}>Announcements & Alerts</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>ADMINISTRATIVE & SYSTEM</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("/(tabs)/social")}>
          <View style={[styles.itemIcon, { backgroundColor: "rgba(232,69,69,0.15)" }]}>
            <Shield size={18} color="#e84545" />
          </View>
          <Text style={styles.itemText}>Community Moderation</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate("/(tabs)/profile")}>
          <View style={[styles.itemIcon, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
            <Settings size={18} color="rgba(240,240,248,0.7)" />
          </View>
          <Text style={styles.itemText}>App Settings & Preferences</Text>
          <ChevronRight size={16} color="rgba(240,240,248,0.3)" />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Footer */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={16} color="#e84545" />
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
    marginBottom: 20,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#6c5ce7",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: "#f0f0f8",
    fontSize: 15,
    fontWeight: "800",
  },
  userRole: {
    color: "rgba(240,240,248,0.45)",
    fontSize: 12,
    marginTop: 2,
  },
  vipBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(253,203,110,0.15)",
    borderWidth: 1,
    borderColor: "rgba(253,203,110,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuList: {
    flex: 1,
  },
  sectionLabel: {
    color: "rgba(240,240,248,0.35)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    color: "#f0f0f8",
    fontSize: 13,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(232,69,69,0.12)",
    borderWidth: 1,
    borderColor: "rgba(232,69,69,0.3)",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 30,
  },
  logoutText: {
    color: "#e84545",
    fontSize: 13,
    fontWeight: "700",
  },
});

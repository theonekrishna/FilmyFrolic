import React, { useState } from "react";
import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Film, Newspaper, Users, Gamepad2, User, Menu, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { DrawerContent } from "../../src/components/layout/DrawerContent";

export default function TabLayout() {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#6c5ce7",
          tabBarInactiveTintColor: "rgba(240,240,248,0.4)",
          tabBarStyle: {
            backgroundColor: "#0d0d18",
            borderTopColor: "rgba(255,255,255,0.08)",
            height: 62,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.3,
          },
          headerStyle: {
            backgroundColor: "#0a0a12",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.07)",
          },
          headerTitleStyle: {
            color: "#f0f0f8",
            fontSize: 18,
            fontWeight: "900",
            letterSpacing: 1.5,
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => setDrawerVisible(true)}
              activeOpacity={0.7}
            >
              <Menu size={22} color="#f0f0f8" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerBtnRight}
              onPress={() => router.push("/search")}
              activeOpacity={0.7}
            >
              <Search size={20} color="#6c5ce7" />
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "HOME",
            tabBarLabel: "Movies",
            tabBarIcon: ({ color, size }) => <Film size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="gossip"
          options={{
            title: "GOSSIP",
            tabBarLabel: "Gossip",
            tabBarIcon: ({ color, size }) => <Newspaper size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: "SOCIAL",
            tabBarLabel: "Social",
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="entertain"
          options={{
            title: "ENTERTAINMENT",
            tabBarLabel: "Games",
            tabBarIcon: ({ color, size }) => <Gamepad2 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "PROFILE",
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Side Navigation Drawer Modal */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.drawerContainer}>
            <DrawerContent onClose={() => setDrawerVisible(false)} />
          </View>
          <TouchableOpacity
            style={styles.dismissOverlay}
            onPress={() => setDrawerVisible(false)}
            activeOpacity={1}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    marginLeft: 16,
    padding: 6,
  },
  headerBtnRight: {
    marginRight: 16,
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  drawerContainer: {
    width: "80%",
    height: "100%",
    backgroundColor: "#0a0a12",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  dismissOverlay: {
    width: "20%",
    height: "100%",
  },
});

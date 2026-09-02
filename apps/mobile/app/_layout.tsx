import React, { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, StyleSheet, Modal } from "react-native";
import { DrawerContent } from "../src/components/layout/DrawerContent";

export default function RootLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0a12" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a12" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="gossip/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
      </Stack>

      {/* Side Navigation Drawer Modal */}
      {drawerOpen && (
        <Modal
          visible={drawerOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.drawerContainer}>
              <DrawerContent onClose={() => setDrawerOpen(false)} />
            </View>
            <View style={styles.dismissOverlay} onTouchStart={() => setDrawerOpen(false)} />
          </View>
        </Modal>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a12",
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  drawerContainer: {
    width: "80%",
    height: "100%",
    backgroundColor: "#0a0a12",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  dismissOverlay: {
    width: "20%",
    height: "100%",
  },
});

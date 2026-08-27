import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MovieBadgeProps {
  label: string;
  color?: string;
}

export const MovieBadge: React.FC<MovieBadgeProps> = ({ label, color = "#6c5ce7" }) => {
  return (
    <View style={[styles.container, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

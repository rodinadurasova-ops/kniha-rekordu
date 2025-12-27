import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, StrokeColors } from "@/constants/theme";
import { StrokeStyle, STROKE_LABELS } from "@/lib/types";

interface SectionHeaderProps {
  strokeStyle: StrokeStyle;
}

export function SectionHeader({ strokeStyle }: SectionHeaderProps) {
  const strokeColor = StrokeColors[strokeStyle];

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: strokeColor }]} />
      <ThemedText type="h4" style={styles.title}>
        {STROKE_LABELS[strokeStyle]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  title: {
    fontWeight: "600",
  },
});

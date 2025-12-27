import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Fonts, StrokeColors } from "@/constants/theme";
import { StrokeStyle, STROKE_LABELS } from "@/lib/types";
import { formatTime } from "@/lib/mockData";

interface LapRowProps {
  lapIndex: number;
  time: number;
  strokeStyle: StrokeStyle;
  isLast: boolean;
}

export function LapRow({ lapIndex, time, strokeStyle, isLast }: LapRowProps) {
  const { theme } = useTheme();
  const strokeColor = StrokeColors[strokeStyle];

  return (
    <View
      style={[
        styles.container,
        !isLast && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.lapBadge, { backgroundColor: strokeColor + "20" }]}>
          <ThemedText type="small" style={{ color: strokeColor, fontWeight: "600" }}>
            {lapIndex + 1}
          </ThemedText>
        </View>
        <ThemedText type="body">{STROKE_LABELS[strokeStyle]}</ThemedText>
      </View>
      <ThemedText style={[styles.time, { fontFamily: Fonts?.mono }]}>
        {formatTime(time)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  lapBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  time: {
    fontSize: 16,
    fontWeight: "500",
  },
});

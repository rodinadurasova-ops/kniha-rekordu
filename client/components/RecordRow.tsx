import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, StrokeColors } from "@/constants/theme";
import { StrokeStyle, STROKE_LABELS } from "@/lib/types";
import { formatTime, formatDateShort } from "@/lib/mockData";

interface RecordRowProps {
  strokeStyle: StrokeStyle;
  distance: number;
  bestTime: number;
  bestDate: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RecordRow({
  strokeStyle,
  distance,
  bestTime,
  bestDate,
  onPress,
}: RecordRowProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const strokeColor = StrokeColors[strokeStyle];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: strokeColor }]} />
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <ThemedText type="body" style={styles.distance}>
            {STROKE_LABELS[strokeStyle]} {distance} m
          </ThemedText>
        </View>
        <View style={styles.rightSection}>
          <ThemedText
            style={[styles.time, { fontFamily: Fonts?.mono }]}
          >
            {formatTime(bestTime)}
          </ThemedText>
          <View style={styles.dateRow}>
            <ThemedText type="small" style={{ opacity: 0.6 }}>
              {formatDateShort(bestDate)}
            </ThemedText>
            <Feather
              name="chevron-right"
              size={16}
              color={theme.text}
              style={{ opacity: 0.4, marginLeft: Spacing.xs }}
            />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  leftSection: {
    flex: 1,
  },
  distance: {
    fontWeight: "500",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 20,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
});

import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, StrokeColors } from "@/constants/theme";
import { Segment, StrokeStyle } from "@/lib/types";
import { formatTime, formatDate, formatDateTime } from "@/lib/mockData";

interface DayGroupCardProps {
  date: string;
  bestTime: number;
  segments: Segment[];
  strokeStyle: StrokeStyle;
  isBestOverall: boolean;
  onSegmentPress: (segmentId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DayGroupCard({
  date,
  bestTime,
  segments,
  strokeStyle,
  isBestOverall,
  onSegmentPress,
}: DayGroupCardProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const strokeColor = StrokeColors[strokeStyle];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 90, { duration: 200 });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        }}
        style={[styles.header, animatedStyle]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.dateRow}>
            {isBestOverall ? (
              <View style={[styles.badge, { backgroundColor: strokeColor }]}>
                <Feather name="award" size={12} color="#FFFFFF" />
              </View>
            ) : null}
            <ThemedText type="body" style={styles.dateText}>
              {formatDate(date)}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ opacity: 0.6 }}>
            {segments.length} {segments.length === 1 ? "pokus" : segments.length < 5 ? "pokusy" : "pokusů"}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <ThemedText style={[styles.time, { fontFamily: Fonts?.mono }]}>
            {formatTime(bestTime)}
          </ThemedText>
          <Animated.View style={chevronStyle}>
            <Feather name="chevron-right" size={20} color={theme.text} style={{ opacity: 0.4 }} />
          </Animated.View>
        </View>
      </AnimatedPressable>

      {expanded ? (
        <View style={[styles.expandedContent, { borderTopColor: theme.separator }]}>
          {segments.map((segment, index) => (
            <Pressable
              key={segment.id}
              onPress={() => onSegmentPress(segment.id)}
              style={({ pressed }) => [
                styles.segmentRow,
                pressed && { opacity: 0.7 },
                index < segments.length - 1 && { borderBottomColor: theme.separator, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <ThemedText type="small" style={{ opacity: 0.6 }}>
                {formatDateTime(segment.startDateTime)}
              </ThemedText>
              <View style={styles.segmentRight}>
                <ThemedText style={[styles.segmentTime, { fontFamily: Fonts?.mono }]}>
                  {formatTime(segment.elapsedSeconds)}
                </ThemedText>
                <Feather name="chevron-right" size={16} color={theme.text} style={{ opacity: 0.3 }} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  dateText: {
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: Spacing.sm,
  },
  expandedContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  segmentRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmentTime: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
});

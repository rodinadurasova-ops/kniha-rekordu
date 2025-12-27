import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { LapRow } from "@/components/LapRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts, StrokeColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Segment, Workout, STROKE_LABELS } from "@/lib/types";
import { getSegmentById, getWorkoutById } from "@/lib/storage";
import { formatTime, formatDateTime, formatDate } from "@/lib/mockData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "SegmentDetail">;

export default function SegmentDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { segmentId } = route.params;

  const [segment, setSegment] = useState<Segment | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [lapsExpanded, setLapsExpanded] = useState(false);

  const loadData = useCallback(async () => {
    const loadedSegment = await getSegmentById(segmentId);
    setSegment(loadedSegment);

    if (loadedSegment) {
      const loadedWorkout = await getWorkoutById(loadedSegment.workoutId);
      setWorkout(loadedWorkout);
    }

    setLoading(false);
  }, [segmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    if (segment) {
      navigation.setOptions({
        headerTitle: formatDateTime(segment.startDateTime),
        headerRight: () => (
          <HeaderButton
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditStyle", {
                segmentId: segment.id,
                currentStyle: segment.strokeStyle,
              });
            }}
          >
            <ThemedText type="body" style={{ color: StrokeColors.freestyle }}>
              Upravit
            </ThemedText>
          </HeaderButton>
        ),
      });
    }
  }, [navigation, segment]);

  if (loading || !segment) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={StrokeColors.freestyle} />
      </ThemedView>
    );
  }

  const strokeColor = StrokeColors[segment.strokeStyle];
  const pacePerLap = segment.elapsedSeconds / (segment.distanceMeters / 50);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card elevation={1} style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={[styles.styleBadge, { backgroundColor: strokeColor }]}>
              <ThemedText type="small" style={styles.styleBadgeText}>
                {STROKE_LABELS[segment.strokeStyle]}
              </ThemedText>
            </View>
            <ThemedText type="h4">{segment.distanceMeters} m</ThemedText>
          </View>
          <ThemedText
            style={[styles.heroTime, { fontFamily: Fonts?.mono }]}
          >
            {formatTime(segment.elapsedSeconds)}
          </ThemedText>
          <ThemedText type="body" style={styles.paceText}>
            Tempo: {formatTime(pacePerLap)} / 50 m
          </ThemedText>
        </Card>

        {workout ? (
          <Card elevation={1} style={styles.infoCard}>
            <ThemedText type="h4" style={styles.cardTitle}>
              Kontext tréninku
            </ThemedText>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={18} color={theme.text} style={{ opacity: 0.6 }} />
                <ThemedText type="body" style={styles.infoLabel}>
                  Datum
                </ThemedText>
                <ThemedText type="body" style={styles.infoValue}>
                  {formatDate(workout.startDate)}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Feather name="clock" size={18} color={theme.text} style={{ opacity: 0.6 }} />
                <ThemedText type="body" style={styles.infoLabel}>
                  Délka tréninku
                </ThemedText>
                <ThemedText type="body" style={styles.infoValue}>
                  {formatTime(workout.durationSeconds)}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Feather name="navigation" size={18} color={theme.text} style={{ opacity: 0.6 }} />
                <ThemedText type="body" style={styles.infoLabel}>
                  Celková vzdálenost
                </ThemedText>
                <ThemedText type="body" style={styles.infoValue}>
                  {workout.totalDistanceMeters} m
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Feather name="droplet" size={18} color={theme.text} style={{ opacity: 0.6 }} />
                <ThemedText type="body" style={styles.infoLabel}>
                  Bazén
                </ThemedText>
                <View style={[styles.poolBadge, { backgroundColor: strokeColor + "20" }]}>
                  <ThemedText type="small" style={{ color: strokeColor, fontWeight: "600" }}>
                    {workout.poolLengthMeters} m
                  </ThemedText>
                </View>
              </View>
            </View>
          </Card>
        ) : null}

        <Card elevation={1} style={styles.lapsCard}>
          <Pressable
            onPress={() => setLapsExpanded(!lapsExpanded)}
            style={({ pressed }) => [
              styles.lapsHeader,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ThemedText type="h4" style={styles.cardTitle}>
              Rozpis délek
            </ThemedText>
            <View style={styles.lapsHeaderRight}>
              <ThemedText type="body" style={{ opacity: 0.6 }}>
                {segment.laps.length} {segment.laps.length === 1 ? "délka" : segment.laps.length < 5 ? "délky" : "délek"}
              </ThemedText>
              <Feather
                name={lapsExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.text}
                style={{ opacity: 0.4, marginLeft: Spacing.sm }}
              />
            </View>
          </Pressable>
          {lapsExpanded ? (
            <View style={styles.lapsList}>
              {segment.laps.map((lap, index) => (
                <LapRow
                  key={lap.id}
                  lapIndex={lap.lapIndex}
                  time={lap.elapsedSeconds}
                  strokeStyle={lap.strokeStyle}
                  isLast={index === segment.laps.length - 1}
                />
              ))}
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  heroCard: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  styleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  styleBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  heroTime: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  paceText: {
    opacity: 0.6,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  infoGrid: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    flex: 1,
    marginLeft: Spacing.md,
    opacity: 0.6,
  },
  infoValue: {
    fontWeight: "500",
  },
  poolBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  lapsCard: {
    marginBottom: Spacing.lg,
  },
  lapsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lapsHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  lapsList: {
    marginTop: Spacing.lg,
  },
});

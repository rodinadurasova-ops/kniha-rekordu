import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { DayGroupCard } from "@/components/DayGroupCard";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, StrokeColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Segment, STROKE_LABELS } from "@/lib/types";
import { getSegments } from "@/lib/storage";
import { groupSegmentsByDay } from "@/lib/mockData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "RecordHistory">;

export default function RecordHistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { strokeStyle, distance } = route.params;

  const [dayGroups, setDayGroups] = useState<
    { date: string; bestTime: number; segments: Segment[] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [bestOverallTime, setBestOverallTime] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const allSegments = await getSegments();
    const filtered = allSegments.filter(
      (s) => s.strokeStyle === strokeStyle && s.distanceMeters === distance
    );
    const grouped = groupSegmentsByDay(filtered);
    setDayGroups(grouped);

    if (grouped.length > 0) {
      const best = Math.min(...grouped.map((g) => g.bestTime));
      setBestOverallTime(best);
    }

    setLoading(false);
  }, [strokeStyle, distance]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${STROKE_LABELS[strokeStyle]} ${distance} m`,
      headerStyle: {
        backgroundColor: StrokeColors[strokeStyle] + "20",
      },
    });
  }, [navigation, strokeStyle, distance]);

  const handleSegmentPress = (segmentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("SegmentDetail", { segmentId });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={StrokeColors[strokeStyle]} />
      </ThemedView>
    );
  }

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
        {dayGroups.length === 0 ? (
          <EmptyState
            icon="clock"
            title="Žádné záznamy"
            message={`Zatím nemáte žádné záznamy pro ${STROKE_LABELS[strokeStyle]} ${distance} m.`}
          />
        ) : (
          dayGroups.map((group, index) => (
            <DayGroupCard
              key={group.date + index}
              date={group.date}
              bestTime={group.bestTime}
              segments={group.segments}
              strokeStyle={strokeStyle}
              isBestOverall={group.bestTime === bestOverallTime}
              onSegmentPress={handleSegmentPress}
            />
          ))
        )}
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
});

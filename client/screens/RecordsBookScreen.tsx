import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RecordRow } from "@/components/RecordRow";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, StrokeColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  StrokeStyle,
  SwimmingRecord,
  DISTANCES,
  Settings,
  DEFAULT_SETTINGS,
} from "@/lib/types";
import { initializeData, getRecords, getSettings } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STROKE_ORDER: StrokeStyle[] = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "medley",
  "unknown",
];

export default function RecordsBookScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [records, setRecords] = useState<SwimmingRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await initializeData();
    const [loadedRecords, loadedSettings] = await Promise.all([
      getRecords(),
      getSettings(),
    ]);
    setRecords(loadedRecords);
    setSettings(loadedSettings);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const handleRecordPress = (strokeStyle: StrokeStyle, distance: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("RecordHistory", { strokeStyle, distance });
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Settings");
  };

  const getRecordsForStyle = (style: StrokeStyle) => {
    return records.filter((r) => r.strokeStyle === style);
  };

  const filteredStyles = settings.showUnknownRecords
    ? STROKE_ORDER
    : STROKE_ORDER.filter((s) => s !== "unknown");

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={StrokeColors.freestyle} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={[styles.appIcon, { backgroundColor: StrokeColors.freestyle }]}>
              <Feather name="droplet" size={20} color="#FFFFFF" />
            </View>
            <ThemedText type="h1">Kniha rekordů</ThemedText>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={handleRefresh}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="Obnovit"
              accessibilityRole="button"
            >
              <Feather name="refresh-cw" size={22} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={handleSettingsPress}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="Nastavení"
              accessibilityRole="button"
            >
              <Feather name="settings" size={22} color={theme.text} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={StrokeColors.freestyle}
          />
        }
      >
        {records.length === 0 ? (
          <EmptyState
            icon="droplet"
            title="Žádné rekordy"
            message="Zatím nemáte žádné plavecké záznamy. Přidejte trénink nebo synchronizujte data."
            buttonTitle="Obnovit data"
            onButtonPress={handleRefresh}
          />
        ) : (
          filteredStyles.map((style) => {
            const styleRecords = getRecordsForStyle(style);
            if (styleRecords.length === 0) return null;

            return (
              <View key={style} style={styles.section}>
                <SectionHeader strokeStyle={style} />
                {DISTANCES.map((distance) => {
                  const record = styleRecords.find(
                    (r) => r.distanceMeters === distance
                  );
                  if (!record) return null;

                  return (
                    <RecordRow
                      key={`${style}-${distance}`}
                      strokeStyle={style}
                      distance={distance}
                      bestTime={record.bestElapsedSeconds}
                      bestDate={record.bestDate}
                      onPress={() => handleRecordPress(style, distance)}
                    />
                  );
                })}
              </View>
            );
          })
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
});

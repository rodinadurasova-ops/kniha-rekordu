import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
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
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, StrokeColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { StrokeStyle, STROKE_LABELS } from "@/lib/types";
import { updateSegmentStyle } from "@/lib/storage";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "EditStyle">;

const STROKE_OPTIONS: StrokeStyle[] = [
  "freestyle",
  "backstroke",
  "breaststroke",
  "butterfly",
  "medley",
  "unknown",
];

export default function EditStyleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { segmentId, currentStyle } = route.params;

  const [selectedStyle, setSelectedStyle] = useState<StrokeStyle>(currentStyle);
  const hasChanges = selectedStyle !== currentStyle;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={() => navigation.goBack()}>
          <ThemedText type="body">Zrušit</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={async () => {
            if (hasChanges) {
              await updateSegmentStyle(segmentId, selectedStyle);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            navigation.goBack();
          }}
          disabled={!hasChanges}
        >
          <ThemedText
            type="body"
            style={{
              color: hasChanges ? StrokeColors.freestyle : theme.textSecondary,
              fontWeight: "600",
            }}
          >
            Uložit
          </ThemedText>
        </HeaderButton>
      ),
    });
  }, [navigation, hasChanges, selectedStyle, segmentId, theme]);

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
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            VYBERTE STYL PLAVÁNÍ
          </ThemedText>
          <View style={styles.optionsList}>
            {STROKE_OPTIONS.map((style) => {
              const isSelected = selectedStyle === style;
              const strokeColor = StrokeColors[style];

              return (
                <Pressable
                  key={style}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedStyle(style);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[styles.styleDot, { backgroundColor: strokeColor }]} />
                  <ThemedText type="body" style={styles.optionLabel}>
                    {STROKE_LABELS[style]}
                  </ThemedText>
                  {isSelected ? (
                    <Feather name="check" size={22} color={StrokeColors.freestyle} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Feather name="alert-circle" size={18} color={StrokeColors.butterfly} />
          <ThemedText type="small" style={[styles.warningText, { color: theme.textSecondary }]}>
            Změna stylu přepočítá všechny rekordy pro tento úsek.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  optionsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  styleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  optionLabel: {
    flex: 1,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  warningText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
});

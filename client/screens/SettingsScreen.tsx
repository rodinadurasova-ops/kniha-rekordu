import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SettingsRow } from "@/components/SettingsRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, StrokeColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Settings, DEFAULT_SETTINGS } from "@/lib/types";
import { getSettings, saveSettings, resetAllData, recalculateRecords } from "@/lib/storage";
import { healthKitService, HealthKitStatus } from "@/lib/healthkit";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AVATARS = [
  { icon: "user" as const, color: StrokeColors.freestyle },
  { icon: "droplet" as const, color: StrokeColors.backstroke },
  { icon: "activity" as const, color: StrokeColors.butterfly },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [healthKitStatus, setHealthKitStatus] = useState<HealthKitStatus | null>(null);

  const loadSettings = useCallback(async () => {
    const loaded = await getSettings();
    setSettings(loaded);
  }, []);

  const loadHealthKitStatus = useCallback(async () => {
    const status = await healthKitService.getStatus();
    setHealthKitStatus(status);
  }, []);

  useEffect(() => {
    loadSettings();
    loadHealthKitStatus();
  }, [loadSettings, loadHealthKitStatus]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton
          onPress={async () => {
            if (hasChanges) {
              await saveSettings(settings);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            navigation.goBack();
          }}
        >
          <ThemedText type="body" style={{ color: StrokeColors.freestyle, fontWeight: "600" }}>
            Hotovo
          </ThemedText>
        </HeaderButton>
      ),
    });
  }, [navigation, settings, hasChanges]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleRecalculate = () => {
    Alert.alert(
      "Přepočítat rekordy",
      "Tato akce přepočítá všechny rekordy z uložených dat. Pokračovat?",
      [
        { text: "Zrušit", style: "cancel" },
        {
          text: "Přepočítat",
          style: "destructive",
          onPress: async () => {
            await recalculateRecords();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Hotovo", "Rekordy byly přepočítány.");
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Obnovit data",
      "Tato akce smaže všechna data a vytvoří nová ukázková data. Pokračovat?",
      [
        { text: "Zrušit", style: "cancel" },
        {
          text: "Obnovit",
          style: "destructive",
          onPress: async () => {
            await resetAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.goBack();
          },
        },
      ]
    );
  };

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
            PROFIL
          </ThemedText>
          <View style={styles.avatarRow}>
            {AVATARS.map((avatar, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSetting("avatarIndex", index);
                }}
                style={({ pressed }) => [
                  styles.avatarButton,
                  {
                    backgroundColor:
                      settings.avatarIndex === index
                        ? avatar.color
                        : theme.backgroundSecondary,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Feather
                  name={avatar.icon}
                  size={24}
                  color={settings.avatarIndex === index ? "#FFFFFF" : theme.text}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.nameInputContainer}>
            <ThemedText type="body" style={styles.nameLabel}>
              Jméno
            </ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                },
              ]}
              value={settings.displayName}
              onChangeText={(text) => updateSetting("displayName", text)}
              placeholder="Vaše jméno"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            ZOBRAZENÍ
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="eye-off"
              iconColor={StrokeColors.unknown}
              title="Zobrazit neznámé rekordy"
              showSwitch
              switchValue={settings.showUnknownRecords}
              onSwitchChange={(value) => updateSetting("showUnknownRecords", value)}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            DATA
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="refresh-cw"
              iconColor={StrokeColors.butterfly}
              title="Přepočítat rekordy"
              showChevron
              onPress={handleRecalculate}
            />
            <View style={[styles.divider, { backgroundColor: theme.separator }]} />
            <SettingsRow
              icon="trash-2"
              iconColor={StrokeColors.breaststroke}
              title="Obnovit ukázková data"
              showChevron
              destructive
              onPress={handleReset}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            APPLE HEALTH
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="heart"
              iconColor={healthKitStatus?.isAvailable ? StrokeColors.backstroke : StrokeColors.unknown}
              title="HealthKit"
              subtitle={healthKitStatus?.errorMessage || (healthKitStatus?.isAuthorized ? "Připojeno" : "Nepřipojeno")}
              value={healthKitStatus?.isAvailable ? (healthKitStatus.isAuthorized ? "Aktivní" : "Dostupné") : "Nedostupné"}
            />
            <View style={[styles.divider, { backgroundColor: theme.separator }]} />
            <SettingsRow
              icon="book-open"
              iconColor={StrokeColors.freestyle}
              title="Jak připojit HealthKit"
              showChevron
              onPress={() => {
                const instructions = healthKitService.getNativeBuildInstructions();
                Alert.alert("Připojení HealthKit", instructions, [{ text: "Rozumím" }]);
              }}
            />
          </View>
          <ThemedText type="small" style={[styles.healthKitNote, { color: theme.textSecondary }]}>
            Pro synchronizaci dat z Apple Health potřebujete vytvořit nativní build aplikace s Apple Developer účtem.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="small" style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            O APLIKACI
          </ThemedText>
          <View style={styles.sectionContent}>
            <SettingsRow
              icon="info"
              iconColor={StrokeColors.medley}
              title="Verze"
              value="1.0.0"
            />
            <View style={[styles.divider, { backgroundColor: theme.separator }]} />
            <SettingsRow
              icon="database"
              iconColor={StrokeColors.butterfly}
              title="Zdroj dat"
              value={healthKitStatus?.isAuthorized ? "Apple Health" : "Ukázková data"}
            />
          </View>
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
  sectionContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  avatarButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  nameInputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  nameLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  nameInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xs,
  },
  healthKitNote: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: 13,
    lineHeight: 18,
  },
});

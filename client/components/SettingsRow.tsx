import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, StrokeColors } from "@/constants/theme";

interface SettingsRowProps {
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  showChevron = false,
  showSwitch = false,
  switchValue = false,
  onPress,
  onSwitchChange,
  destructive = false,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const content = (
    <View style={styles.container}>
      {icon ? (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconColor || StrokeColors.freestyle },
          ]}
        >
          <Feather name={icon} size={16} color="#FFFFFF" />
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <ThemedText
          type="body"
          style={[
            styles.title,
            destructive && { color: StrokeColors.breaststroke },
          ]}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" style={{ opacity: 0.6 }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText type="body" style={{ opacity: 0.6 }}>
          {value}
        </ThemedText>
      ) : null}
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{
            false: theme.backgroundTertiary,
            true: StrokeColors.freestyle,
          }}
        />
      ) : null}
      {showChevron ? (
        <Feather
          name="chevron-right"
          size={20}
          color={theme.text}
          style={{ opacity: 0.4 }}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "400",
  },
});

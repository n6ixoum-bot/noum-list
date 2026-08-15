import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BRAND } from "@/constants/brand";

type EmptyStateProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={icon} size={30} color={BRAND.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity accessibilityRole="button" onPress={onAction} style={styles.action} activeOpacity={0.86}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 42,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.primarySoft,
    marginBottom: 16,
  },
  title: { color: BRAND.text, fontSize: 20, lineHeight: 28, fontWeight: "800", textAlign: "center" },
  description: {
    color: BRAND.muted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 8,
  },
  action: {
    minHeight: 48,
    paddingHorizontal: 20,
    marginTop: 22,
    borderRadius: 15,
    justifyContent: "center",
    backgroundColor: BRAND.primary,
  },
  actionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BRAND } from "@/constants/brand";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function DarkCard({ children, style }: { children: ReactNode; style?: ComponentProps<typeof View>["style"] }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PreferenceRow({ icon, title, description, trailing }: { icon: IconName; title: string; description?: string; trailing?: ReactNode }) {
  return (
    <View style={styles.row}>
      {trailing}
      <View style={styles.copy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <View style={styles.icon}><MaterialCommunityIcons name={icon} size={21} color={BRAND.primary} /></View>
    </View>
  );
}

export function SegmentedChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.segment, selected && styles.segmentSelected]}><Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, borderRadius: 22, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  rowTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900", textAlign: "right" },
  rowDescription: { color: BRAND.muted, fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: 3 },
  segment: { flex: 1, minHeight: 42, borderRadius: 13, borderWidth: 1, borderColor: BRAND.border, justifyContent: "center", alignItems: "center", backgroundColor: BRAND.background },
  segmentSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  segmentText: { color: BRAND.muted, fontSize: 13, fontWeight: "900" },
  segmentTextSelected: { color: BRAND.primary },
});

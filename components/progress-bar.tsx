import { StyleSheet, View } from "react-native";

import { BRAND } from "@/constants/brand";

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: safeValue }}>
      <View style={[styles.fill, { width: `${safeValue}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: BRAND.primarySoft,
  },
  fill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: BRAND.primary,
  },
});

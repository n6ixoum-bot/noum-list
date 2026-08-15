import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { BRAND } from "@/constants/brand";

export function CelebrationOverlay({ visible, title, message, icon = "trophy-outline", onDismiss }: { visible: boolean; title: string; message: string; icon?: keyof typeof MaterialCommunityIcons.glyphMap; onDismiss: () => void }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const scale = useSharedValue(0.82);
  const opacity = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); }, []);
  useEffect(() => {
    if (!visible) { scale.value = 0.82; opacity.value = 0; sparkle.value = 0; return; }
    if (reduceMotion) { scale.value = 1; opacity.value = 1; sparkle.value = 1; return; }
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(withTiming(1.06, { duration: 230, easing: Easing.out(Easing.cubic) }), withTiming(1, { duration: 180 }));
    sparkle.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
  }, [visible, reduceMotion, opacity, scale, sparkle]);

  const cardStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const leftSparkle = useAnimatedStyle(() => ({ opacity: sparkle.value, transform: [{ translateX: -28 * sparkle.value }, { translateY: -22 * sparkle.value }, { rotate: `${-22 * sparkle.value}deg` }] }));
  const rightSparkle = useAnimatedStyle(() => ({ opacity: sparkle.value, transform: [{ translateX: 28 * sparkle.value }, { translateY: -28 * sparkle.value }, { rotate: `${22 * sparkle.value}deg` }] }));

  return <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={onDismiss}><View style={styles.backdrop}><Animated.View style={[styles.sparkle, styles.leftSparkle, leftSparkle]}><MaterialCommunityIcons name="star-four-points" size={24} color="#F7D66D" /></Animated.View><Animated.View style={[styles.sparkle, styles.rightSparkle, rightSparkle]}><MaterialCommunityIcons name="star-four-points" size={27} color="#2FD47A" /></Animated.View><Animated.View style={[styles.card, cardStyle]}><View style={styles.icon}><MaterialCommunityIcons name={icon} size={34} color="#07160D" /></View><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text><Pressable onPress={onDismiss} style={styles.button}><Text style={styles.buttonText}>متابعة</Text></Pressable></Animated.View></View></Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.76)", justifyContent: "center", alignItems: "center", padding: 28 },
  card: { width: "100%", maxWidth: 340, borderRadius: 26, borderWidth: 1, borderColor: "#3C7C57", backgroundColor: "#101714", alignItems: "center", padding: 25 },
  icon: { width: 70, height: 70, borderRadius: 24, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center" },
  title: { color: BRAND.text, fontSize: 21, fontWeight: "900", marginTop: 16, textAlign: "center" },
  message: { color: BRAND.muted, fontSize: 13, lineHeight: 21, textAlign: "center", marginTop: 6 },
  button: { minHeight: 44, paddingHorizontal: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: BRAND.primarySoft, marginTop: 19 },
  buttonText: { color: BRAND.primary, fontSize: 13, fontWeight: "900" },
  sparkle: { position: "absolute" }, leftSparkle: { left: "23%", top: "35%" }, rightSparkle: { right: "23%", top: "34%" },
});

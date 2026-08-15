import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function FocusTimerMotion({ active, children }: { active: boolean; children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); }, []);
  useEffect(() => {
    if (reduceMotion) { scale.value = 1; borderOpacity.value = active ? 0.4 : 0; return; }
    scale.value = withTiming(active ? 1.012 : 1, { duration: 260, easing: Easing.out(Easing.cubic) });
    borderOpacity.value = withTiming(active ? 0.7 : 0, { duration: 240 });
  }, [active, reduceMotion, borderOpacity, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], shadowOpacity: borderOpacity.value * 0.3 }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

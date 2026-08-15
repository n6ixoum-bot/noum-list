import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export const haptic = {
  success: () => { if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); },
  light: () => { if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); },
};

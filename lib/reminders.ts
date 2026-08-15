import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { defaultReminderSettings, normalizeReminderSettings, reminderBody, type ReminderSettings } from "./reminder-utils";

const REMINDER_STORAGE_KEY = "khutwati.daily-reminder.v1";
const REMINDER_CHANNEL_ID = "khutwati-daily-learning";

export type ReminderResult = {
  settings: ReminderSettings;
  status: "scheduled" | "denied" | "unavailable" | "disabled";
};

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const raw = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
  if (!raw) return defaultReminderSettings;
  try {
    return normalizeReminderSettings(JSON.parse(raw) as Partial<ReminderSettings>);
  } catch {
    return defaultReminderSettings;
  }
}

async function persistReminderSettings(settings: ReminderSettings) {
  await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  return settings;
}

async function requestReminderPermission() {
  if (Platform.OS === "web") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: "تذكيرات خطوتي",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: "#315BCE",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === "granted") return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

export async function scheduleDailyReminder(settings: ReminderSettings): Promise<ReminderResult> {
  if (Platform.OS === "web") {
    return { settings: { ...settings, enabled: false, notificationId: null }, status: "unavailable" };
  }

  const hasPermission = await requestReminderPermission();
  if (!hasPermission) {
    const disabled = await persistReminderSettings({ ...settings, enabled: false, notificationId: null });
    return { settings: disabled, status: "denied" };
  }

  if (settings.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(settings.notificationId).catch(() => undefined);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "خطوتي: حافظ على سلسلتك",
      body: reminderBody(settings.hour, settings.minute),
      data: { destination: "/stats" },
      sound: "default",
    },
    trigger: {
      hour: settings.hour,
      minute: settings.minute,
      repeats: true,
      channelId: REMINDER_CHANNEL_ID,
    } as any,
  });

  const scheduled = await persistReminderSettings({ ...settings, enabled: true, notificationId });
  return { settings: scheduled, status: "scheduled" };
}

export async function disableDailyReminder(settings: ReminderSettings): Promise<ReminderResult> {
  if (settings.notificationId && Platform.OS !== "web") {
    await Notifications.cancelScheduledNotificationAsync(settings.notificationId).catch(() => undefined);
  }
  const disabled = await persistReminderSettings({ ...settings, enabled: false, notificationId: null });
  return { settings: disabled, status: "disabled" };
}

export async function updateReminderTime(settings: ReminderSettings, hour: number, minute: number): Promise<ReminderResult> {
  const next = normalizeReminderSettings({ ...settings, hour, minute });
  if (next.enabled) return scheduleDailyReminder(next);
  const saved = await persistReminderSettings(next);
  return { settings: saved, status: "disabled" };
}

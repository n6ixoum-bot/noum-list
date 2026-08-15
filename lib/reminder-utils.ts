export type ReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId: string | null;
};

export const defaultReminderSettings: ReminderSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
  notificationId: null,
};

export function normalizeReminderSettings(value: Partial<ReminderSettings> | null | undefined): ReminderSettings {
  const hour = typeof value?.hour === "number" && value.hour >= 0 && value.hour <= 23 ? value.hour : defaultReminderSettings.hour;
  const minute = typeof value?.minute === "number" && value.minute >= 0 && value.minute <= 59 ? value.minute : defaultReminderSettings.minute;
  return {
    enabled: value?.enabled === true,
    hour,
    minute,
    notificationId: typeof value?.notificationId === "string" ? value.notificationId : null,
  };
}

export function formatReminderTime(hour: number, minute: number) {
  const safeHour = Math.min(23, Math.max(0, hour));
  const suffix = safeHour < 12 ? "ص" : "م";
  const displayHour = safeHour % 12 || 12;
  return `${displayHour}:${String(Math.min(59, Math.max(0, minute))).padStart(2, "0")} ${suffix}`;
}

export function reminderBody(hour: number, minute: number) {
  return `حان وقت خطوة اليوم (${formatReminderTime(hour, minute)}). أكمل مهمة صغيرة لتحافظ على سلسلة إنجازاتك.`;
}

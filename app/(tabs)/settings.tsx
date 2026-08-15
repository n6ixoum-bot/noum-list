import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { clearLearningPaths } from "@/lib/learning-paths";
import { disableDailyReminder, loadReminderSettings, scheduleDailyReminder, updateReminderTime } from "@/lib/reminders";
import { formatReminderTime, type ReminderSettings } from "@/lib/reminder-utils";

const timeChoices = [
  { hour: 18, minute: 0 },
  { hour: 20, minute: 0 },
  { hour: 22, minute: 0 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [reminder, setReminder] = useState<ReminderSettings | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReminderSettings().then(setReminder);
  }, []);

  const toggleReminder = async (enabled: boolean) => {
    if (!reminder) return;
    setSavingReminder(true);
    const result = enabled ? await scheduleDailyReminder(reminder) : await disableDailyReminder(reminder);
    setReminder(result.settings);
    setSavingReminder(false);
    if (result.status === "scheduled") setReminderMessage(`سيصلك تذكير يومي عند ${formatReminderTime(result.settings.hour, result.settings.minute)}.`);
    if (result.status === "denied") setReminderMessage("لم يتم منح إذن الإشعارات. فعّله من إعدادات الهاتف ثم حاول مرة أخرى.");
    if (result.status === "unavailable") setReminderMessage("جرّب التذكير من نسخة أندرويد المثبتة؛ المتصفح لا يدعم الإشعارات المحلية هنا.");
    if (result.status === "disabled") setReminderMessage("تم إيقاف التذكير اليومي.");
  };

  const chooseTime = async (hour: number, minute: number) => {
    if (!reminder) return;
    setSavingReminder(true);
    const result = await updateReminderTime(reminder, hour, minute);
    setReminder(result.settings);
    setSavingReminder(false);
    setReminderMessage(result.status === "scheduled" ? `تم تعديل التذكير إلى ${formatReminderTime(hour, minute)}.` : `سيكون التذكير عند ${formatReminderTime(hour, minute)} عند تشغيله.`);
  };

  const clearData = () => {
    Alert.alert("حذف المسارات؟", "سيتم حذف كل المسارات والمهام المحفوظة على هذا الجهاز. لا يمكن التراجع عن هذا الإجراء.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await clearLearningPaths();
          router.replace("/" as any);
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>الإعدادات</Text>
        <Text style={styles.subtitle}>نسخة بسيطة تحفظ بياناتك على الهاتف فقط.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="translate" size={21} color={BRAND.primary} /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>لغة المصادر</Text><Text style={styles.rowDescription}>عربي وإنجليزي في كل مهمة</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="cellphone-lock" size={21} color={BRAND.primary} /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>خصوصية البيانات</Text><Text style={styles.rowDescription}>مساراتك وتقدّمك محفوظة محليًا</Text></View>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Switch
              value={reminder?.enabled ?? false}
              onValueChange={(value) => void toggleReminder(value)}
              disabled={!reminder || savingReminder}
              trackColor={{ false: "#CBD5E1", true: "#9DB4F5" }}
              thumbColor={reminder?.enabled ? BRAND.primary : "#FFFFFF"}
            />
            <View style={styles.reminderTitleWrap}>
              <Text style={styles.rowTitle}>تذكير السلسلة اليومي</Text>
              <Text style={styles.rowDescription}>أنجز مهمة واحدة لتحافظ على استمراريتك</Text>
            </View>
            <View style={styles.reminderIcon}><MaterialCommunityIcons name="bell-ring-outline" size={21} color={BRAND.primary} /></View>
          </View>

          <Text style={styles.timeLabel}>اختر وقت التذكير</Text>
          <View style={styles.timeChoices}>
            {timeChoices.map((choice) => {
              const selected = reminder?.hour === choice.hour && reminder?.minute === choice.minute;
              return (
                <TouchableOpacity key={`${choice.hour}-${choice.minute}`} style={[styles.timeChoice, selected && styles.timeChoiceSelected]} onPress={() => void chooseTime(choice.hour, choice.minute)} disabled={!reminder || savingReminder} activeOpacity={0.8}>
                  <Text style={[styles.timeChoiceText, selected && styles.timeChoiceTextSelected]}>{formatReminderTime(choice.hour, choice.minute)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {savingReminder ? <ActivityIndicator style={styles.reminderLoader} color={BRAND.primary} /> : null}
          {reminderMessage ? <Text style={styles.reminderMessage}>{reminderMessage}</Text> : null}
          {Platform.OS === "web" ? <Text style={styles.webHint}>تُفعّل الإشعارات اليومية عند تثبيت التطبيق على Android.</Text> : null}
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={clearData} activeOpacity={0.84} accessibilityRole="button">
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={BRAND.danger} />
          <Text style={styles.dangerText}>حذف كل المسارات</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  card: { marginTop: 24, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 3 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowTitle: { color: BRAND.text, fontSize: 15, fontWeight: "800", textAlign: "right" },
  rowDescription: { color: BRAND.muted, fontSize: 12, marginTop: 3, textAlign: "right" },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 15 },
  dangerButton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 50, marginTop: 20, borderWidth: 1, borderColor: "#F5C7CC", borderRadius: 16, backgroundColor: "#FFF7F8" },
  dangerText: { color: BRAND.danger, fontWeight: "800", fontSize: 14 },
  reminderCard: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  reminderHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  reminderIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  reminderTitleWrap: { flex: 1 },
  timeLabel: { color: BRAND.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 17, marginBottom: 9 },
  timeChoices: { flexDirection: "row", gap: 8 },
  timeChoice: { flex: 1, minHeight: 39, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, backgroundColor: "#F8FAFC" },
  timeChoiceSelected: { backgroundColor: BRAND.primarySoft, borderColor: BRAND.primary },
  timeChoiceText: { color: BRAND.muted, fontSize: 12, fontWeight: "800" },
  timeChoiceTextSelected: { color: BRAND.primary },
  reminderLoader: { marginTop: 11 },
  reminderMessage: { color: BRAND.muted, fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 10 },
  webHint: { color: BRAND.warning, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 7 },
});

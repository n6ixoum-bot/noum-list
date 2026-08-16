import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { clearLearningPaths } from "@/lib/learning-paths";
import { disableDailyReminder, loadReminderSettings, scheduleDailyReminder, updateReminderTime } from "@/lib/reminders";
import { formatReminderTime, type ReminderSettings } from "@/lib/reminder-utils";
import { loadSuccessSoundEnabled, setSuccessSoundEnabled } from "@/lib/success-sounds";
import { useLocale } from "@/lib/locale-provider";

const timeChoices = [
  { hour: 18, minute: 0 },
  { hour: 20, minute: 0 },
  { hour: 22, minute: 0 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [reminder, setReminder] = useState<ReminderSettings | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [successSoundsEnabled, setSuccessSoundsEnabled] = useState(true);

  useEffect(() => {
    loadReminderSettings().then(setReminder);
    loadSuccessSoundEnabled().then(setSuccessSoundsEnabled);
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

  const applyCustomTime = async () => {
    const match = customTime.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) { setReminderMessage("اكتب الوقت بصيغة 24 ساعة، مثل 19:30."); return; }
    await chooseTime(Number(match[1]), Number(match[2]));
    setCustomTime("");
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
        <Text style={styles.title}>{t("settings")}</Text>
        <Text style={styles.subtitle}>{t("privacy")}</Text>

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

        <View style={styles.preferenceCard}>
          <View style={styles.preferenceRow}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="translate" size={21} color={BRAND.primary} /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>{t("language")}</Text><Text style={styles.rowDescription}>{locale === "ar" ? "العربية" : "English"}</Text></View>
          </View>
          <View style={styles.languageChoices}>
            <TouchableOpacity style={[styles.languageChoice, locale === "ar" && styles.languageChoiceSelected]} onPress={() => setLocale("ar")} activeOpacity={0.8}><Text style={[styles.languageChoiceText, locale === "ar" && styles.languageChoiceTextSelected]}>{t("arabic")}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.languageChoice, locale === "en" && styles.languageChoiceSelected]} onPress={() => setLocale("en")} activeOpacity={0.8}><Text style={[styles.languageChoiceText, locale === "en" && styles.languageChoiceTextSelected]}>{t("english")}</Text></TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.preferenceRow}>
            <View style={styles.darkLocked}><MaterialCommunityIcons name="check" size={15} color="#07160D" /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>المظهر الداكن</Text><Text style={styles.rowDescription}>مفعّل دائمًا لحماية العين وتركيز أفضل</Text></View>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="theme-light-dark" size={21} color={BRAND.primary} /></View>
          </View>
        </View>

        <View style={styles.soundCard}>
          <View style={styles.preferenceRow}>
            <Switch value={successSoundsEnabled} onValueChange={(value) => { setSuccessSoundsEnabled(value); void setSuccessSoundEnabled(value); }} trackColor={{ false: "#334039", true: "#1B7040" }} thumbColor={successSoundsEnabled ? BRAND.primary : "#DCE6DF"} />
            <View style={styles.rowText}><Text style={styles.rowTitle}>أصوات النجاح</Text><Text style={styles.rowDescription}>صوت قصير عند الشارة أو إكمال جلسة التركيز</Text></View>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="volume-high" size={21} color={BRAND.primary} /></View>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Switch
              value={reminder?.enabled ?? false}
              onValueChange={(value) => void toggleReminder(value)}
              disabled={!reminder || savingReminder}
              trackColor={{ false: "#334039", true: "#1B7040" }}
              thumbColor={reminder?.enabled ? BRAND.primary : "#DCE6DF"}
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
          <View style={styles.customTimeRow}><TextInput value={customTime} onChangeText={setCustomTime} placeholder="وقت مخصص 19:30" placeholderTextColor={BRAND.muted} keyboardType="numbers-and-punctuation" style={styles.customTimeInput} textAlign="center" /><TouchableOpacity style={styles.customTimeButton} onPress={() => void applyCustomTime()} disabled={!reminder || savingReminder}><Text style={styles.customTimeButtonText}>تطبيق</Text></TouchableOpacity></View>
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
  dangerButton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 50, marginTop: 20, borderWidth: 1, borderColor: "#66333A", borderRadius: 16, backgroundColor: "#241014" },
  dangerText: { color: BRAND.danger, fontWeight: "800", fontSize: 14 },
  preferenceCard: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  preferenceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  darkLocked: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primary },
  languageChoices: { flexDirection: "row", gap: 8, marginTop: 12 },
  languageChoice: { flex: 1, minHeight: 39, borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.background },
  languageChoiceSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  languageChoiceText: { color: BRAND.muted, fontSize: 12, fontWeight: "800" },
  languageChoiceTextSelected: { color: BRAND.primary },
  soundCard: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  reminderCard: { marginTop: 16, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  reminderHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  reminderIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  reminderTitleWrap: { flex: 1 },
  timeLabel: { color: BRAND.text, fontSize: 13, fontWeight: "800", textAlign: "right", marginTop: 17, marginBottom: 9 },
  timeChoices: { flexDirection: "row", gap: 8 },
  timeChoice: { flex: 1, minHeight: 39, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.background },
  timeChoiceSelected: { backgroundColor: BRAND.primarySoft, borderColor: BRAND.primary },
  timeChoiceText: { color: BRAND.muted, fontSize: 12, fontWeight: "800" },
  timeChoiceTextSelected: { color: BRAND.primary },
  customTimeRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  customTimeInput: { flex: 1, height: 39, borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, color: BRAND.text, backgroundColor: BRAND.background, fontSize: 12 },
  customTimeButton: { width: 70, height: 39, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft, borderWidth: 1, borderColor: BRAND.primary },
  customTimeButtonText: { color: BRAND.primary, fontSize: 12, fontWeight: "900" },
  reminderLoader: { marginTop: 11 },
  reminderMessage: { color: BRAND.muted, fontSize: 12, lineHeight: 19, textAlign: "right", marginTop: 10 },
  webHint: { color: BRAND.warning, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 7 },
});

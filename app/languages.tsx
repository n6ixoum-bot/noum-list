import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { getLanguagePlan, type LanguageKey } from "@/lib/language-plans";

const languages: LanguageKey[] = ["English", "Spanish", "Turkish", "German"];

export default function LanguagesScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageKey>("English");
  const plan = useMemo(() => getLanguagePlan(language), [language]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={plan.weeks}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View><View style={styles.topbar}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-right" size={21} color={BRAND.text} /></TouchableOpacity><Text style={styles.topbarTitle}>اللغات</Text><View style={styles.backButton} /></View><View style={styles.hero}><View style={styles.heroIcon}><MaterialCommunityIcons name="translate" size={29} color={BRAND.primary} /></View><Text style={styles.title}>لغة جديدة، كل يوم</Text><Text style={styles.subtitle}>خطة احترافية قصيرة لتبدأ من الصفر بلا تشتيت.</Text></View><Text style={styles.sectionLabel}>اختر اللغة</Text><View style={styles.languageGrid}>{languages.map((item) => <TouchableOpacity key={item} style={[styles.languageChip, language === item && styles.languageChipSelected]} onPress={() => setLanguage(item)} activeOpacity={0.8}><Text style={[styles.languageText, language === item && styles.languageTextSelected]}>{item}</Text></TouchableOpacity>)}</View><View style={styles.todayCard}><View style={styles.todayIcon}><MaterialCommunityIcons name="calendar-check-outline" size={20} color={BRAND.primary} /></View><View style={styles.todayCopy}><Text style={styles.todayTitle}>مهمتك اليوم</Text><Text style={styles.todayText}>{plan.weeks[0].tasks[0]}</Text></View></View><Text style={styles.sectionLabel}>خطة أول 4 أسابيع</Text></View>}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => <View style={styles.weekCard}><View style={styles.weekHeading}><View style={styles.weekNumber}><Text style={styles.weekNumberText}>{index + 1}</Text></View><View style={styles.weekCopy}><Text style={styles.weekTitle}>{item.title}</Text><Text style={styles.weekFocus}>{item.focus}</Text></View></View><View style={styles.taskList}>{item.tasks.map((task) => <View key={task} style={styles.taskRow}><View style={styles.taskDot} /><Text style={styles.taskText}>{task}</Text></View>)}</View></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface },
  topbarTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900" },
  hero: { alignItems: "center", padding: 20, borderWidth: 1, borderColor: BRAND.border, borderRadius: 24, backgroundColor: BRAND.surface },
  heroIcon: { width: 56, height: 56, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft },
  title: { color: BRAND.text, fontSize: 22, fontWeight: "900", marginTop: 11 },
  subtitle: { color: BRAND.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 4 },
  sectionLabel: { color: BRAND.text, fontSize: 16, fontWeight: "900", textAlign: "right", marginTop: 22, marginBottom: 10 },
  languageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  languageChip: { width: "48%", minHeight: 42, borderRadius: 13, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, alignItems: "center", justifyContent: "center" },
  languageChipSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  languageText: { color: BRAND.muted, fontSize: 13, fontWeight: "900" },
  languageTextSelected: { color: BRAND.primary },
  todayCard: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 18, backgroundColor: "#0C2316", borderWidth: 1, borderColor: "#245E3C", marginTop: 15 },
  todayIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: BRAND.primarySoft },
  todayCopy: { flex: 1 },
  todayTitle: { color: BRAND.primary, fontSize: 12, fontWeight: "900", textAlign: "right" },
  todayText: { color: BRAND.text, fontSize: 13, lineHeight: 20, fontWeight: "800", textAlign: "right", marginTop: 3 },
  weekCard: { padding: 15, borderRadius: 19, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface },
  weekHeading: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  weekNumber: { width: 29, height: 29, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primary },
  weekNumberText: { color: "#07160D", fontSize: 12, fontWeight: "900" },
  weekCopy: { flex: 1 },
  weekTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900", textAlign: "right" },
  weekFocus: { color: BRAND.muted, fontSize: 12, lineHeight: 18, marginTop: 3, textAlign: "right" },
  taskList: { marginTop: 13, gap: 8 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  taskDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: BRAND.primary },
  taskText: { flex: 1, color: BRAND.text, fontSize: 12, lineHeight: 18, textAlign: "right" },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { addLearningPath } from "@/lib/learning-paths";
import { createLearningPath } from "@/lib/plan-builder";
import { trpc } from "@/lib/trpc";

type Level = "مبتدئ" | "متوسط";
type Duration = 2 | 4;

export default function CreatePathScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<Level>("مبتدئ");
  const [durationWeeks, setDurationWeeks] = useState<Duration>(2);
  const [error, setError] = useState<string | null>(null);
  const generatePlan = trpc.learning.generate.useMutation();

  const submit = async () => {
    const trimmedGoal = goal.trim();
    if (trimmedGoal.length < 3) {
      setError("اكتب هدفًا أوضح، مثل: أريد تعلم أساسيات الشطرنج.");
      return;
    }
    setError(null);
    try {
      const generated = await generatePlan.mutateAsync({ goal: trimmedGoal, level, durationWeeks });
      const path = createLearningPath(trimmedGoal, level, durationWeeks, generated);
      await addLearningPath(path);
      router.replace(`/plan/${path.id}` as any);
    } catch {
      setError("تعذّر تجهيز المسار الآن. تأكد من اتصالك وحاول مرة أخرى.");
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.content}>
          <View style={styles.topbar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.72} accessibilityLabel="رجوع">
              <MaterialCommunityIcons name="arrow-right" size={22} color={BRAND.text} />
            </TouchableOpacity>
            <Text style={styles.topbarTitle}>مسار جديد</Text>
            <View style={styles.topbarSpacer} />
          </View>

          <Text style={styles.title}>ماذا تريد أن تتعلّم؟</Text>
          <Text style={styles.subtitle}>اكتب الهدف بأسلوب طبيعي، وسنرتبه لك من الأساسيات إلى التطبيق.</Text>

          <TextInput
            value={goal}
            onChangeText={setGoal}
            placeholder="مثال: أريد تعلم الشطرنج من الصفر"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            multiline
            textAlign="right"
            textAlignVertical="top"
            returnKeyType="done"
            maxLength={160}
          />

          <Text style={styles.fieldLabel}>مستواك الآن</Text>
          <View style={styles.optionRow}>
            {(["مبتدئ", "متوسط"] as Level[]).map((option) => (
              <TouchableOpacity key={option} onPress={() => setLevel(option)} style={[styles.option, level === option && styles.optionSelected]} activeOpacity={0.8}>
                <Text style={[styles.optionText, level === option && styles.optionTextSelected]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>مدة المسار</Text>
          <View style={styles.optionRow}>
            {([2, 4] as Duration[]).map((option) => (
              <TouchableOpacity key={option} onPress={() => setDurationWeeks(option)} style={[styles.option, durationWeeks === option && styles.optionSelected]} activeOpacity={0.8}>
                <Text style={[styles.optionText, durationWeeks === option && styles.optionTextSelected]}>{option === 2 ? "أسبوعان" : "4 أسابيع"}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.note}><MaterialCommunityIcons name="youtube" size={19} color={BRAND.danger} /><Text style={styles.noteText}>ستحصل على روابط بحث عربية وإنجليزية مرتبة مع كل مهمة.</Text></View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.flex} />
          <TouchableOpacity style={[styles.submit, generatePlan.isPending && styles.submitDisabled]} onPress={() => void submit()} disabled={generatePlan.isPending} activeOpacity={0.86} accessibilityRole="button">
            {generatePlan.isPending ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.submitText}>جهّز مساري</Text><MaterialCommunityIcons name="arrow-left" size={21} color="#FFFFFF" /></>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, padding: 20 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 27 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BRAND.border },
  topbarTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900" },
  topbarSpacer: { width: 42 },
  title: { color: BRAND.text, fontSize: 27, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 5, textAlign: "right" },
  input: { minHeight: 122, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, borderRadius: 19, color: BRAND.text, fontSize: 16, lineHeight: 25, padding: 16, marginTop: 22 },
  fieldLabel: { color: BRAND.text, fontSize: 14, fontWeight: "900", textAlign: "right", marginTop: 20, marginBottom: 9 },
  optionRow: { flexDirection: "row", gap: 10 },
  option: { flex: 1, minHeight: 45, borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, alignItems: "center", justifyContent: "center" },
  optionSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  optionText: { color: BRAND.muted, fontSize: 14, fontWeight: "800" },
  optionTextSelected: { color: BRAND.primary },
  note: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 19, padding: 12, borderRadius: 15, backgroundColor: BRAND.warningSoft },
  noteText: { flex: 1, color: "#83560B", fontSize: 12, lineHeight: 18, textAlign: "right" },
  error: { color: BRAND.danger, fontSize: 13, lineHeight: 20, textAlign: "right", marginTop: 12 },
  submit: { flexDirection: "row", gap: 9, minHeight: 55, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: BRAND.primary, marginTop: 20 },
  submitDisabled: { opacity: 0.72 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});

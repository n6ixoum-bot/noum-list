import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { FocusSoundControl } from "@/components/focus-sound";
import { BRAND } from "@/constants/brand";
import { loadLearningPaths } from "@/lib/learning-paths";
import { saveFocusSession } from "@/lib/noum-core";
import { awardActivityXp } from "@/lib/noum-core";
import { haptic } from "@/lib/haptics";
import type { LearningPath } from "@/lib/plan-builder";

const durations = [15, 25, 50, 90];

export default function FocusScreen() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [minutes, setMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pathId, setPathId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    loadLearningPaths().then((next) => { setPaths(next); setLoading(false); });
  }, []));

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(interval);
          setRunning(false);
          void saveFocusSession(pathId, minutes).then(async (session) => { await awardActivityXp(session.id, Math.max(10, minutes)); haptic.success(); setMessage(`أحسنت. سجلت ${minutes} دقيقة وكسَبت XP.`); });
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, pathId, minutes]);

  const displayTime = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const selectedPath = useMemo(() => paths.find((path) => path.id === pathId), [paths, pathId]);

  const chooseDuration = (value: number) => {
    if (running) return;
    setMinutes(value);
    setRemaining(value * 60);
    setMessage(null);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(minutes * 60);
    setMessage(null);
  };

  return (
    <ScreenContainer>
      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.header}><View><Text style={styles.title}>تركيز عميق</Text><Text style={styles.subtitle}>جلسة واحدة بلا تشتيت تقرّبك من هدفك.</Text></View><View style={styles.headerIcon}><MaterialCommunityIcons name="brain" size={27} color={BRAND.primary} /></View></View>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>{selectedPath?.title ?? "جلسة عامة"}</Text>
              <Text style={styles.timer}>{displayTime}</Text>
              <Text style={styles.timerHint}>{running ? "ركّز على خطوة واحدة فقط" : "اختر مدة ثم ابدأ"}</Text>
              <View style={styles.durationRow}>{durations.map((value) => <TouchableOpacity key={value} style={[styles.durationChip, minutes === value && styles.durationChipSelected]} onPress={() => chooseDuration(value)} activeOpacity={0.8}><Text style={[styles.durationText, minutes === value && styles.durationTextSelected]}>{value} د</Text></TouchableOpacity>)}</View>
              <View style={styles.controlRow}><TouchableOpacity style={styles.resetButton} onPress={reset} activeOpacity={0.8}><MaterialCommunityIcons name="restart" size={20} color={BRAND.muted} /></TouchableOpacity><TouchableOpacity style={styles.startButton} onPress={() => setRunning((value) => !value)} activeOpacity={0.86}><MaterialCommunityIcons name={running ? "pause" : "play"} size={20} color="#FFFFFF" /><Text style={styles.startText}>{running ? "إيقاف مؤقت" : remaining === 0 ? "ابدأ من جديد" : "ابدأ الجلسة"}</Text></TouchableOpacity></View>
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
            <FocusSoundControl />
            <Text style={styles.sectionTitle}>اربط الجلسة بمسار</Text>
            <TouchableOpacity style={[styles.pathChoice, pathId === null && styles.pathChoiceSelected]} onPress={() => setPathId(null)} activeOpacity={0.8}><MaterialCommunityIcons name="inbox-arrow-down-outline" size={19} color={pathId === null ? BRAND.primary : BRAND.muted} /><Text style={[styles.pathChoiceText, pathId === null && styles.pathChoiceTextSelected]}>جلسة عامة</Text></TouchableOpacity>
            {loading ? <ActivityIndicator style={styles.loader} color={BRAND.primary} /> : null}
          </View>
        }
        renderItem={({ item }) => <TouchableOpacity style={[styles.pathChoice, pathId === item.id && styles.pathChoiceSelected]} onPress={() => setPathId(item.id)} activeOpacity={0.8}><MaterialCommunityIcons name="target" size={19} color={pathId === item.id ? BRAND.primary : BRAND.muted} /><Text style={[styles.pathChoiceText, pathId === item.id && styles.pathChoiceTextSelected]}>{item.title}</Text></TouchableOpacity>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 35 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  headerIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  timerCard: { padding: 20, borderRadius: 26, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, alignItems: "center" },
  timerLabel: { color: BRAND.primary, fontSize: 13, fontWeight: "900" },
  timer: { color: BRAND.text, fontSize: 65, lineHeight: 78, fontWeight: "900", letterSpacing: 2, marginTop: 9 },
  timerHint: { color: BRAND.muted, fontSize: 13 },
  durationRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  durationChip: { minWidth: 57, minHeight: 37, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, alignItems: "center", justifyContent: "center" },
  durationChipSelected: { backgroundColor: BRAND.primarySoft, borderColor: BRAND.primary },
  durationText: { color: BRAND.muted, fontSize: 12, fontWeight: "800" },
  durationTextSelected: { color: BRAND.primary },
  controlRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 19 },
  resetButton: { width: 50, height: 50, borderRadius: 16, backgroundColor: BRAND.background, alignItems: "center", justifyContent: "center" },
  startButton: { minHeight: 50, paddingHorizontal: 18, borderRadius: 16, backgroundColor: BRAND.primary, flexDirection: "row", alignItems: "center", gap: 7 },
  startText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  message: { color: BRAND.success, fontSize: 12, fontWeight: "800", textAlign: "center", marginTop: 14 },
  sectionTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900", textAlign: "right", marginTop: 25, marginBottom: 11 },
  pathChoice: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, marginBottom: 9 },
  pathChoiceSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  pathChoiceText: { flex: 1, color: BRAND.muted, fontSize: 13, fontWeight: "800", textAlign: "right" },
  pathChoiceTextSelected: { color: BRAND.primary },
  loader: { marginTop: 20 },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { findLearningPath, toggleLearningTask } from "@/lib/learning-paths";
import { getPathProgress, type LearningPath, type LearningTask } from "@/lib/plan-builder";

type ListItem =
  | { type: "stage"; id: string; index: number; title: string; description: string }
  | { type: "task"; id: string; stageIndex: number; task: LearningTask };

export default function PlanDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setPath(await findLearningPath(id));
    setLoading(false);
  }, [id]);

  useEffect(() => { void refresh(); }, [refresh]);

  const items = useMemo<ListItem[]>(() => {
    if (!path) return [];
    return path.stages.flatMap((stage, stageIndex) => [
      { type: "stage" as const, id: `stage-row-${stage.id}`, index: stageIndex, title: stage.title, description: stage.description },
      ...stage.tasks.map((task) => ({ type: "task" as const, id: `task-row-${task.id}`, stageIndex, task })),
    ]);
  }, [path]);

  const toggleTask = async (taskId: string) => {
    if (!path) return;
    const updated = await toggleLearningTask(path.id, taskId);
    setPath(updated);
  };

  if (loading) {
    return <ScreenContainer><View style={styles.center}><ActivityIndicator color={BRAND.primary} /></View></ScreenContainer>;
  }

  if (!path) {
    return <ScreenContainer><EmptyState icon="map-marker-off" title="لم نجد هذا المسار" description="قد يكون تم حذفه من الجهاز." actionLabel="العودة للرئيسية" onAction={() => router.replace("/" as any)} /></ScreenContainer>;
  }

  const progress = getPathProgress(path);
  return (
    <ScreenContainer>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topbar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.72} accessibilityLabel="رجوع"><MaterialCommunityIcons name="arrow-right" size={22} color={BRAND.text} /></TouchableOpacity>
              <Text style={styles.topbarLabel}>مسار تعلّم</Text>
              <View style={styles.backButtonPlaceholder} />
            </View>
            <View style={styles.hero}>
              <Text style={styles.title}>{path.title}</Text>
              <Text style={styles.overview}>{path.overview}</Text>
              <View style={styles.stats}><View style={styles.stat}><MaterialCommunityIcons name="calendar-range-outline" size={17} color={BRAND.primary} /><Text style={styles.statText}>{path.durationWeeks === 2 ? "أسبوعان" : "4 أسابيع"}</Text></View><View style={styles.stat}><MaterialCommunityIcons name="signal-cellular-2" size={17} color={BRAND.primary} /><Text style={styles.statText}>{path.level}</Text></View></View>
              <View style={styles.progressHeading}><Text style={styles.progressTitle}>تقدمك</Text><Text style={styles.progressValue}>{progress}%</Text></View>
              <ProgressBar value={progress} />
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === "stage") {
            return <View style={styles.stageHeader}><View style={styles.stageNumber}><Text style={styles.stageNumberText}>{item.index + 1}</Text></View><View style={styles.stageTextWrap}><Text style={styles.stageTitle}>{item.title}</Text><Text style={styles.stageDescription}>{item.description}</Text></View></View>;
          }

          const { task } = item;
          return (
            <View style={[styles.taskCard, task.completed && styles.completedCard]}>
              <TouchableOpacity style={styles.taskMain} onPress={() => void toggleTask(task.id)} activeOpacity={0.82} accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }}>
                <View style={[styles.check, task.completed && styles.checked]}>{task.completed ? <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" /> : null}</View>
                <View style={styles.taskCopy}><View style={styles.taskTitleRow}><Text style={[styles.taskTitle, task.completed && styles.completedText]}>{task.title}</Text><Text style={styles.duration}>{task.durationMinutes} د</Text></View><Text style={styles.outcome}>{task.outcome}</Text></View>
              </TouchableOpacity>
              <View style={styles.sourceRow}>
                {task.sources.map((source) => (
                  <TouchableOpacity key={source.id} style={styles.sourceButton} onPress={() => void WebBrowser.openBrowserAsync(source.url, { toolbarColor: BRAND.primary, showTitle: true })} activeOpacity={0.78} accessibilityRole="link">
                    <MaterialCommunityIcons name="youtube" size={16} color={source.language === "ar" ? BRAND.danger : BRAND.primary} />
                    <Text style={styles.sourceText}>{source.language === "ar" ? "عربي" : "English"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 34 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 19 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BRAND.border },
  backButtonPlaceholder: { width: 42 },
  topbarLabel: { color: BRAND.muted, fontSize: 14, fontWeight: "800" },
  hero: { backgroundColor: BRAND.surface, borderRadius: 23, padding: 18, borderWidth: 1, borderColor: BRAND.border, marginBottom: 25 },
  title: { color: BRAND.text, fontSize: 24, lineHeight: 34, fontWeight: "900", textAlign: "right" },
  overview: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 6, textAlign: "right" },
  stats: { flexDirection: "row", gap: 9, marginTop: 16 },
  stat: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: BRAND.primarySoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11 },
  statText: { color: BRAND.primary, fontSize: 12, fontWeight: "800" },
  progressHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 8 },
  progressTitle: { color: BRAND.text, fontSize: 13, fontWeight: "800" },
  progressValue: { color: BRAND.primary, fontSize: 13, fontWeight: "900" },
  stageHeader: { flexDirection: "row", gap: 11, alignItems: "flex-start", marginTop: 3, marginBottom: 10 },
  stageNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", marginTop: 1 },
  stageNumberText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  stageTextWrap: { flex: 1 },
  stageTitle: { color: BRAND.text, fontSize: 17, lineHeight: 24, fontWeight: "900", textAlign: "right" },
  stageDescription: { color: BRAND.muted, fontSize: 12, lineHeight: 18, marginTop: 2, textAlign: "right" },
  taskCard: { backgroundColor: BRAND.surface, borderRadius: 19, borderWidth: 1, borderColor: BRAND.border, padding: 14, marginBottom: 12 },
  completedCard: { backgroundColor: "#FBFEFC", borderColor: "#C8E7D7" },
  taskMain: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  check: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: "#B6C3D6", alignItems: "center", justifyContent: "center", marginTop: 2 },
  checked: { borderColor: BRAND.success, backgroundColor: BRAND.success },
  taskCopy: { flex: 1 },
  taskTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  taskTitle: { flex: 1, color: BRAND.text, fontSize: 15, lineHeight: 22, fontWeight: "900", textAlign: "right" },
  completedText: { color: BRAND.success, textDecorationLine: "line-through" },
  duration: { color: BRAND.primary, backgroundColor: BRAND.primarySoft, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, fontSize: 11, fontWeight: "800" },
  outcome: { color: BRAND.muted, fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: 4 },
  sourceRow: { flexDirection: "row", gap: 8, marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: BRAND.border },
  sourceButton: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: "#F8FAFC" },
  sourceText: { color: BRAND.text, fontSize: 12, fontWeight: "800" },
});

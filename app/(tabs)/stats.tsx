import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { loadLearningPaths } from "@/lib/learning-paths";
import { getPathProgress, type LearningPath } from "@/lib/plan-builder";
import { calculateLearningStatistics } from "@/lib/statistics";

export default function StatsScreen() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPaths(await loadLearningPaths());
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const stats = useMemo(() => calculateLearningStatistics(paths), [paths]);

  return (
    <ScreenContainer>
      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>إحصائياتي</Text>
                <Text style={styles.subtitle}>انظر إلى ما بنيته خطوة بخطوة.</Text>
              </View>
              <View style={styles.headerIcon}><MaterialCommunityIcons name="chart-donut-variant" size={27} color={BRAND.primary} /></View>
            </View>

            {loading ? <ActivityIndicator style={styles.loader} color={BRAND.primary} /> : null}
            {paths.length > 0 ? (
              <>
                <View style={styles.heroCard}>
                  <View style={styles.ring}>
                    <Text style={styles.ringValue}>{stats.overallProgress}%</Text>
                    <Text style={styles.ringLabel}>التقدم الكلي</Text>
                  </View>
                  <View style={styles.heroCopy}>
                    <Text style={styles.heroTitle}>أحسنت الاستمرار</Text>
                    <Text style={styles.heroDescription}>{stats.encouragement}</Text>
                  </View>
                </View>

                <View style={styles.metrics}>
                  <MetricCard icon="check-circle-outline" value={`${stats.completedTasks}/${stats.totalTasks}`} label="مهام مكتملة" tone="success" />
                  <MetricCard icon="map-marker-path" value={`${stats.activePaths}`} label="مسارات نشطة" tone="primary" />
                  <MetricCard icon="trophy-outline" value={`${stats.completedPaths}`} label="مسارات مكتملة" tone="warning" />
                </View>

                <Text style={styles.sectionTitle}>تقدم المسارات</Text>
              </>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={!loading ? <EmptyState icon="chart-timeline-variant" title="إحصائياتك ستظهر هنا" description="أنشئ مسارًا وعلّم أول مهمة كمكتملة لتبدأ رحلة التقدم." actionLabel="ابدأ هدفًا" onAction={() => router.push("/create" as any)} /> : null}
        renderItem={({ item }) => {
          const progress = getPathProgress(item);
          return (
            <TouchableOpacity style={styles.pathCard} onPress={() => router.push(`/plan/${item.id}` as any)} activeOpacity={0.84} accessibilityRole="button">
              <View style={styles.pathHeading}>
                <View style={[styles.pathIcon, progress === 100 && styles.pathIconComplete]}><MaterialCommunityIcons name={progress === 100 ? "check" : "book-open-page-variant-outline"} size={20} color={progress === 100 ? BRAND.success : BRAND.primary} /></View>
                <View style={styles.pathTitleWrap}><Text style={styles.pathTitle}>{item.title}</Text><Text style={styles.pathMeta}>{progress === 100 ? "تم إنجاز هذا المسار" : `${item.durationWeeks === 2 ? "أسبوعان" : "4 أسابيع"} · ${item.level}`}</Text></View>
              </View>
              <View style={styles.pathProgress}><ProgressBar value={progress} /><Text style={styles.pathPercent}>{progress}%</Text></View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}

function MetricCard({ icon, value, label, tone }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; value: string; label: string; tone: "primary" | "success" | "warning" }) {
  const colors = tone === "success" ? { main: BRAND.success, soft: BRAND.successSoft } : tone === "warning" ? { main: BRAND.warning, soft: BRAND.warningSoft } : { main: BRAND.primary, soft: BRAND.primarySoft };
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: colors.soft }]}><MaterialCommunityIcons name={icon} size={18} color={colors.main} /></View>
      <Text style={[styles.metricValue, { color: colors.main }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  headerIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  loader: { marginVertical: 30 },
  heroCard: { flexDirection: "row", alignItems: "center", gap: 17, padding: 18, borderRadius: 23, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border },
  ring: { width: 96, height: 96, borderRadius: 48, borderWidth: 9, borderColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center", backgroundColor: "#FBFCFF" },
  ringValue: { color: BRAND.primary, fontSize: 23, fontWeight: "900" },
  ringLabel: { color: BRAND.muted, fontSize: 9, fontWeight: "800", marginTop: 1 },
  heroCopy: { flex: 1 },
  heroTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900", textAlign: "right" },
  heroDescription: { color: BRAND.muted, fontSize: 13, lineHeight: 20, marginTop: 5, textAlign: "right" },
  metrics: { flexDirection: "row", gap: 9, marginTop: 13 },
  metricCard: { flex: 1, minHeight: 112, paddingVertical: 12, paddingHorizontal: 7, borderWidth: 1, borderColor: BRAND.border, borderRadius: 18, backgroundColor: BRAND.surface, alignItems: "center", justifyContent: "center" },
  metricIcon: { width: 31, height: 31, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  metricValue: { fontSize: 17, fontWeight: "900", marginTop: 7 },
  metricLabel: { color: BRAND.muted, fontSize: 10, marginTop: 3, fontWeight: "700", textAlign: "center" },
  sectionTitle: { color: BRAND.text, fontSize: 17, fontWeight: "900", textAlign: "right", marginTop: 24, marginBottom: 12 },
  pathCard: { borderRadius: 19, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, padding: 15 },
  pathHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
  pathIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  pathIconComplete: { backgroundColor: BRAND.successSoft },
  pathTitleWrap: { flex: 1 },
  pathTitle: { color: BRAND.text, fontSize: 15, lineHeight: 22, fontWeight: "900", textAlign: "right" },
  pathMeta: { color: BRAND.muted, fontSize: 12, marginTop: 3, textAlign: "right" },
  pathProgress: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 15 },
  pathPercent: { color: BRAND.primary, fontSize: 13, fontWeight: "900" },
});

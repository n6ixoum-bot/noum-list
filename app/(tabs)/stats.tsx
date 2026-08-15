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
import { loadStreakStatus } from "@/lib/streaks";
import { getLevelFromXp, getLevelProgress, loadFocusSessions, loadProfile } from "@/lib/noum-core";
import { loadFlashcardReviews } from "@/lib/flashcards";
import { getAchievements } from "@/lib/achievements";
import type { StreakStatus } from "@/lib/streak-calculator";

export default function StatsScreen() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakStatus | null>(null);
  const [xp, setXp] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [nextPaths, nextStreak, profile, sessions, reviews] = await Promise.all([loadLearningPaths(), loadStreakStatus(), loadProfile(), loadFocusSessions(), loadFlashcardReviews()]);
    setPaths(nextPaths);
    setStreak(nextStreak);
    setXp(profile.xp);
    setFocusMinutes(sessions.reduce((sum, session) => sum + session.minutes, 0));
    setReviewCount(reviews.length);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const stats = useMemo(() => calculateLearningStatistics(paths), [paths]);
  const achievements = useMemo(() => getAchievements({ xp, focusMinutes, reviewCount, streak: streak?.bestStreak ?? 0 }), [xp, focusMinutes, reviewCount, streak?.bestStreak]);

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
                <View style={[styles.streakCard, streak?.isActiveToday && styles.streakCardActive]}>
                  <View style={[styles.streakIcon, streak?.isActiveToday && styles.streakIconActive]}><MaterialCommunityIcons name="fire" size={25} color={streak?.isActiveToday ? "#FFFFFF" : "#E76F22"} /></View>
                  <View style={styles.streakCopy}><Text style={styles.streakTitle}>{streak?.visibleCurrentStreak ?? 0} {streak?.visibleCurrentStreak === 1 ? "يوم متتالٍ" : "أيام متتالية"}</Text><Text style={styles.streakDescription}>{streak?.message ?? "أنجز مهمة اليوم لتبدأ سلسلة جديدة."}</Text></View>
                  <View style={styles.bestBadge}><Text style={styles.bestBadgeNumber}>الأفضل {streak?.bestStreak ?? 0}</Text><Text style={styles.bestBadgeLabel}>يومًا</Text></View>
                </View>
                <View style={styles.gamificationCard}><View style={styles.levelCircle}><Text style={styles.levelNumber}>{getLevelFromXp(xp)}</Text><Text style={styles.levelLabel}>LVL</Text></View><View style={styles.gamificationCopy}><Text style={styles.gamificationTitle}>المستوى {getLevelFromXp(xp)} · {xp} XP</Text><Text style={styles.gamificationDescription}>{getLevelProgress(xp)}/100 XP للمستوى التالي · {Math.round(focusMinutes / 60 * 10) / 10} ساعة تركيز</Text><ProgressBar value={getLevelProgress(xp)} /></View></View>
                <View style={styles.badges}><Text style={styles.badgesTitle}>شاراتك</Text><View style={styles.badgeRow}>{achievements.map((badge) => <View key={badge.id} style={[styles.badge, badge.unlocked && styles.badgeUnlocked]}><MaterialCommunityIcons name={badge.icon as any} size={16} color={badge.unlocked ? BRAND.primary : BRAND.muted} /><Text style={[styles.badgeText, badge.unlocked && styles.badgeTextUnlocked]}>{badge.title}</Text></View>)}</View></View>
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
  streakCard: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 13, padding: 14, borderWidth: 1, borderColor: "#604116", borderRadius: 20, backgroundColor: "#21180C" },
  streakCardActive: { backgroundColor: "#2B1F0F", borderColor: "#A97027" },
  streakIcon: { width: 45, height: 45, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#4A3011" },
  streakIconActive: { backgroundColor: "#E76F22" },
  streakCopy: { flex: 1 },
  streakTitle: { color: "#F2C878", fontSize: 15, fontWeight: "900", textAlign: "right" },
  streakDescription: { color: "#C5A871", fontSize: 11, lineHeight: 17, marginTop: 2, textAlign: "right" },
  bestBadge: { alignItems: "center", minWidth: 49, paddingHorizontal: 6 },
  bestBadgeNumber: { color: "#F2C878", fontSize: 11, fontWeight: "900" },
  bestBadgeLabel: { color: "#C5A871", fontSize: 10, marginTop: 1 },
  gamificationCard: { flexDirection: "row", alignItems: "center", gap: 13, marginBottom: 13, padding: 15, borderRadius: 21, backgroundColor: BRAND.text },
  levelCircle: { width: 55, height: 55, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primary },
  levelNumber: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  levelLabel: { color: "#DDFBE7", fontSize: 8, fontWeight: "900", marginTop: -2 },
  gamificationCopy: { flex: 1, gap: 7 },
  gamificationTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", textAlign: "right" },
  gamificationDescription: { color: "#B9D9C4", fontSize: 11, lineHeight: 17, textAlign: "right" },
  badges: { marginBottom: 13, padding: 14, borderRadius: 19, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface },
  badgesTitle: { color: BRAND.text, fontSize: 13, fontWeight: "900", textAlign: "right", marginBottom: 9 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 7, borderRadius: 10, backgroundColor: BRAND.background, opacity: 0.65 },
  badgeUnlocked: { backgroundColor: BRAND.primarySoft, opacity: 1 },
  badgeText: { color: BRAND.muted, fontSize: 10, fontWeight: "800" },
  badgeTextUnlocked: { color: BRAND.primary },
  heroCard: { flexDirection: "row", alignItems: "center", gap: 17, padding: 18, borderRadius: 23, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border },
  ring: { width: 96, height: 96, borderRadius: 48, borderWidth: 9, borderColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center", backgroundColor: "#0A0E0C" },
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

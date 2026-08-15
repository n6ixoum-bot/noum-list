import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { loadLearningPaths } from "@/lib/learning-paths";
import { getFirstOpenTask, getPathProgress, type LearningPath } from "@/lib/plan-builder";
import { useLocale } from "@/lib/locale-provider";

/**
 * Home Screen - NativeWind Example
 *
 * This template uses NativeWind (Tailwind CSS for React Native).
 * You can use familiar Tailwind classes directly in className props.
 *
 * Key patterns:
 * - Use `className` instead of `style` for most styling
 * - Theme colors: use tokens directly (bg-background, text-foreground, bg-primary, etc.); no dark: prefix needed
 * - Responsive: standard Tailwind breakpoints work on web
 * - Custom colors defined in tailwind.config.js
 */
export default function HomeScreen() {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = locale === "en" ? {
    eyebrow: "Your learning OS",
    title: "Noum List",
    subtitle: "Turn any goal into clear steps.",
    newGoal: "Start a new goal",
    current: "Current path",
    completed: "Path completed",
    next: "Next",
    emptyTitle: "No path yet",
    emptyDescription: "Write a goal and we will turn it into short, organized steps.",
    emptyAction: "Create your first path",
  } : {
    eyebrow: "نظامك للتعلّم والمعرفة",
    title: "Noum List",
    subtitle: "حوّل أي هدف إلى خطوات واضحة.",
    newGoal: "ابدأ هدفًا جديدًا",
    current: "مسارك الحالي",
    completed: "أتممت هذا المسار",
    next: "التالي",
    emptyTitle: "ما عندك مسار بعد",
    emptyDescription: "اكتب هدفًا تريد تعلّمه، وسنقسّمه إلى خطوات قصيرة ومرتبة.",
    emptyAction: "أنشئ أول مسار",
  };
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPaths(await loadLearningPaths());
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const activePath = paths.find((path) => getPathProgress(path) < 100) ?? paths[0];

  return (
    <ScreenContainer>
      <FlatList
        data={activePath ? [activePath] : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
                <Text style={styles.title}>{copy.title}</Text>
                <Text style={styles.subtitle}>{copy.subtitle}</Text>
              </View>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="compass-rose" size={27} color={BRAND.primary} />
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/create" as any)} activeOpacity={0.86} accessibilityRole="button">
              <MaterialCommunityIcons name="plus" size={21} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{copy.newGoal}</Text>
            </TouchableOpacity>
            {loading ? <ActivityIndicator style={styles.loader} color={BRAND.primary} /> : null}
          </View>
        }
        renderItem={({ item }) => {
          const progress = getPathProgress(item);
          const nextTask = getFirstOpenTask(item);
          return (
            <TouchableOpacity
              style={styles.pathCard}
              activeOpacity={0.82}
              onPress={() => router.push(`/plan/${item.id}` as any)}
              accessibilityRole="button"
            >
              <View style={styles.cardTopline}>
                <Text style={styles.cardLabel}>{copy.current}</Text>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
              <Text style={styles.pathTitle}>{item.title}</Text>
              <Text style={styles.pathDescription} numberOfLines={2}>{item.overview}</Text>
              <ProgressBar value={progress} />
              <View style={styles.nextRow}>
                <MaterialCommunityIcons name={progress === 100 ? "check-circle" : "arrow-left-bottom"} size={18} color={progress === 100 ? BRAND.success : BRAND.primary} />
                <Text style={styles.nextText}>{progress === 100 ? copy.completed : `${copy.next}: ${nextTask?.title ?? (locale === "en" ? "Continue reviewing" : "أكمل المراجعة")}`}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={!loading ? <EmptyState icon="map-marker-path" title={copy.emptyTitle} description={copy.emptyDescription} actionLabel={copy.emptyAction} onAction={() => router.push("/create" as any)} /> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 30, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  eyebrow: { fontSize: 13, lineHeight: 20, color: BRAND.primary, fontWeight: "800" },
  title: { fontSize: 34, lineHeight: 42, color: BRAND.text, fontWeight: "900", marginTop: 2 },
  subtitle: { fontSize: 15, lineHeight: 24, color: BRAND.muted, marginTop: 2 },
  headerIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  primaryButton: { minHeight: 54, borderRadius: 17, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginBottom: 22 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  loader: { marginVertical: 12 },
  pathCard: { backgroundColor: BRAND.surface, borderRadius: 22, padding: 18, borderColor: BRAND.border, borderWidth: 1, shadowColor: "#1E2A4A", shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  cardTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardLabel: { color: BRAND.primary, fontSize: 13, fontWeight: "800" },
  progressText: { color: BRAND.muted, fontSize: 14, fontWeight: "800" },
  pathTitle: { color: BRAND.text, fontSize: 20, lineHeight: 29, fontWeight: "900", textAlign: "right" },
  pathDescription: { color: BRAND.muted, fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 17, textAlign: "right" },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 14 },
  nextText: { flex: 1, color: BRAND.text, fontSize: 13, lineHeight: 20, fontWeight: "700", textAlign: "right" },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { loadLearningPaths } from "@/lib/learning-paths";
import { getPathProgress, type LearningPath } from "@/lib/plan-builder";

export default function LibraryScreen() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPaths(await loadLearningPaths());
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  return (
    <ScreenContainer>
      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>مكتبتي</Text><Text style={styles.subtitle}>كل المسارات التي أنشأتها محفوظة على جهازك.</Text></View>}
        ListEmptyComponent={loading ? <ActivityIndicator style={styles.loader} color={BRAND.primary} /> : <EmptyState icon="bookshelf" title="مكتبتك فارغة" description="أنشئ مسار تعلم جديدًا وسيظهر هنا لتكمل منه في أي وقت." actionLabel="ابدأ هدفًا" onAction={() => router.push("/create" as any)} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const progress = getPathProgress(item);
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.84} onPress={() => router.push(`/plan/${item.id}` as any)} accessibilityRole="button">
              <View style={styles.cardHeading}>
                <View style={styles.iconWrap}><MaterialCommunityIcons name={progress === 100 ? "trophy-outline" : "book-open-page-variant-outline"} size={22} color={progress === 100 ? BRAND.success : BRAND.primary} /></View>
                <View style={styles.cardTitleWrap}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.meta}>{item.durationWeeks} {item.durationWeeks === 2 ? "أسبوعان" : "أسابيع"} · {item.level}</Text></View>
              </View>
              <View style={styles.progressRow}><ProgressBar value={progress} /><Text style={styles.progressLabel}>{progress}%</Text></View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  header: { marginBottom: 22 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  loader: { marginTop: 40 },
  card: { borderRadius: 20, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, padding: 16 },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: BRAND.text, fontSize: 16, lineHeight: 23, fontWeight: "900", textAlign: "right" },
  meta: { color: BRAND.muted, fontSize: 12, marginTop: 3, textAlign: "right" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  progressLabel: { color: BRAND.primary, fontSize: 13, fontWeight: "800" },
});

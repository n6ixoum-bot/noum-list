import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { createFlashcard, getDueCards, loadFlashcards, reviewFlashcard, type Flashcard, type ReviewRating } from "@/lib/flashcards";

const languages = ["English", "Spanish", "Turkish", "German"];
const ratings: Array<{ key: ReviewRating; label: string; color: string }> = [
  { key: "again", label: "مرة أخرى", color: "#FA7885" },
  { key: "hard", label: "صعبة", color: "#F0BE5B" },
  { key: "good", label: "جيدة", color: "#4ACD7D" },
  { key: "easy", label: "سهلة", color: "#2FD47A" },
];

export default function FlashcardsScreen() {
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [language, setLanguage] = useState("English");
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const refresh = useCallback(async () => setCards(await loadFlashcards()), []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const dueCards = useMemo(() => getDueCards(cards), [cards]);
  const activeCard = dueCards[reviewIndex] ?? null;

  const addCard = async () => {
    if (!front.trim() || !back.trim()) { Alert.alert("أكمل البطاقة", "اكتب المفردة ومعناها أو شرحها أولًا."); return; }
    await createFlashcard({ front, back, language });
    setFront(""); setBack(""); setCreatorOpen(false); await refresh();
  };

  const rateCard = async (rating: ReviewRating) => {
    if (!activeCard) return;
    await reviewFlashcard(activeCard.id, rating);
    setShowAnswer(false);
    setReviewIndex(0);
    await refresh();
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={cards.slice(0, 8)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View><View style={styles.topbar}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-right" size={21} color={BRAND.text} /></TouchableOpacity><Text style={styles.topbarTitle}>بطاقات تعليمية</Text><TouchableOpacity style={styles.addIcon} onPress={() => setCreatorOpen((value) => !value)}><MaterialCommunityIcons name={creatorOpen ? "close" : "plus"} size={21} color={BRAND.primary} /></TouchableOpacity></View><View style={styles.summary}><View><Text style={styles.summaryTitle}>{dueCards.length} بطاقة للمراجعة</Text><Text style={styles.summaryText}>راجع بضع بطاقات الآن، وسنرتب الموعد التالي تلقائيًا.</Text></View><View style={styles.summaryIcon}><MaterialCommunityIcons name="cards-outline" size={28} color={BRAND.primary} /></View></View>{creatorOpen ? <View style={styles.creator}><Text style={styles.creatorTitle}>بطاقة جديدة</Text><TextInput value={front} onChangeText={setFront} placeholder="المفردة أو السؤال" placeholderTextColor={BRAND.muted} style={styles.input} textAlign="right" /><TextInput value={back} onChangeText={setBack} placeholder="المعنى أو الإجابة" placeholderTextColor={BRAND.muted} style={styles.input} textAlign="right" /><View style={styles.languageRow}>{languages.map((item) => <TouchableOpacity key={item} onPress={() => setLanguage(item)} style={[styles.languageChip, language === item && styles.languageChipSelected]}><Text style={[styles.languageText, language === item && styles.languageTextSelected]}>{item}</Text></TouchableOpacity>)}</View><TouchableOpacity style={styles.createButton} onPress={() => void addCard()}><Text style={styles.createText}>حفظ البطاقة</Text></TouchableOpacity></View> : null}{activeCard ? <View style={styles.reviewCard}><View style={styles.reviewHeader}><Text style={styles.reviewCounter}>مستحقة الآن · {reviewIndex + 1}/{dueCards.length}</Text><Text style={styles.reviewLanguage}>{activeCard.language}</Text></View><TouchableOpacity style={styles.cardFace} onPress={() => setShowAnswer((value) => !value)} activeOpacity={0.88}><Text style={styles.cardPrompt}>{showAnswer ? "الإجابة" : "المفردة"}</Text><Text style={styles.cardText}>{showAnswer ? activeCard.back : activeCard.front}</Text><Text style={styles.tapHint}>{showAnswer ? "قيّم مدى تذكرك الآن" : "اضغط لإظهار الإجابة"}</Text></TouchableOpacity>{showAnswer ? <View style={styles.ratingRow}>{ratings.map((item) => <TouchableOpacity key={item.key} onPress={() => void rateCard(item.key)} style={[styles.rating, { borderColor: item.color }]}><Text style={[styles.ratingText, { color: item.color }]}>{item.label}</Text></TouchableOpacity>)}</View> : null}</View> : <View style={styles.emptyReview}><MaterialCommunityIcons name="party-popper" size={28} color={BRAND.primary} /><Text style={styles.emptyTitle}>لا توجد مراجعات مستحقة</Text><Text style={styles.emptyText}>أضف بطاقات أو عد لاحقًا عند حلول موعد المراجعة.</Text></View>}<Text style={styles.sectionTitle}>بطاقاتك الأخيرة</Text></View>}
        ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
        ListEmptyComponent={<View />}
        renderItem={({ item }) => <View style={styles.cardRow}><View style={styles.miniIcon}><MaterialCommunityIcons name="translate" size={18} color={BRAND.primary} /></View><View style={styles.cardCopy}><Text style={styles.rowFront}>{item.front}</Text><Text style={styles.rowBack}>{item.back}</Text><ProgressBar value={Math.min(100, item.repetitions * 20)} /></View><Text style={styles.interval}>{item.intervalDays || 0}د</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, flexGrow: 1 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.surface },
  topbarTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900" },
  addIcon: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: BRAND.primary, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft },
  summary: { minHeight: 92, padding: 16, borderRadius: 22, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTitle: { color: BRAND.text, fontSize: 18, fontWeight: "900", textAlign: "right" },
  summaryText: { color: BRAND.muted, fontSize: 12, lineHeight: 18, textAlign: "right", marginTop: 4, maxWidth: 235 },
  summaryIcon: { width: 52, height: 52, borderRadius: 17, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  creator: { padding: 15, borderRadius: 20, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, marginTop: 14 },
  creatorTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900", textAlign: "right", marginBottom: 10 },
  input: { minHeight: 43, borderRadius: 12, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.background, color: BRAND.text, marginBottom: 9, paddingHorizontal: 11 },
  languageRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  languageChip: { paddingHorizontal: 10, minHeight: 31, borderRadius: 10, borderWidth: 1, borderColor: BRAND.border, justifyContent: "center" },
  languageChipSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.primarySoft },
  languageText: { color: BRAND.muted, fontSize: 11, fontWeight: "800" },
  languageTextSelected: { color: BRAND.primary },
  createButton: { minHeight: 43, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primary, marginTop: 12 },
  createText: { color: "#07160D", fontSize: 13, fontWeight: "900" },
  reviewCard: { padding: 15, borderRadius: 22, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, marginTop: 14 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 11 },
  reviewCounter: { color: BRAND.muted, fontSize: 11, fontWeight: "800" },
  reviewLanguage: { color: BRAND.primary, fontSize: 11, fontWeight: "900" },
  cardFace: { minHeight: 185, borderRadius: 18, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: BRAND.background, borderWidth: 1, borderColor: BRAND.primarySoft },
  cardPrompt: { color: BRAND.primary, fontSize: 12, fontWeight: "900" },
  cardText: { color: BRAND.text, fontSize: 28, fontWeight: "900", textAlign: "center", marginTop: 12 },
  tapHint: { color: BRAND.muted, fontSize: 11, marginTop: 18 },
  ratingRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  rating: { flex: 1, minHeight: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  ratingText: { fontSize: 10, fontWeight: "900" },
  emptyReview: { alignItems: "center", padding: 25, borderRadius: 21, backgroundColor: "#0B2416", borderWidth: 1, borderColor: "#245E3C", marginTop: 14 },
  emptyTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900", marginTop: 9 },
  emptyText: { color: BRAND.muted, fontSize: 12, textAlign: "center", marginTop: 4 },
  sectionTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900", textAlign: "right", marginTop: 23, marginBottom: 10 },
  cardRow: { minHeight: 66, padding: 11, borderRadius: 16, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, flexDirection: "row", gap: 10, alignItems: "center" },
  miniIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft },
  cardCopy: { flex: 1, gap: 3 },
  rowFront: { color: BRAND.text, fontSize: 13, fontWeight: "900", textAlign: "right" },
  rowBack: { color: BRAND.muted, fontSize: 11, textAlign: "right" },
  interval: { color: BRAND.primary, fontSize: 11, fontWeight: "900" },
});

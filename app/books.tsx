import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ProgressBar } from "@/components/progress-bar";
import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { bookCoverLetters, getBookProgress, importPdfBook, loadBooks, updateBook, type LocalBook } from "@/lib/books";
import { trpc } from "@/lib/trpc";

export default function BooksScreen() {
  const router = useRouter();
  const [books, setBooks] = useState<LocalBook[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [readingNote, setReadingNote] = useState("");
  const [pageInput, setPageInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [importing, setImporting] = useState(false);
  const generateQuestions = trpc.books.generateQuestions.useMutation();

  const refresh = useCallback(async () => setBooks(await loadBooks()), []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  const selected = books.find((book) => book.id === selectedId) ?? null;

  const selectBook = (book: LocalBook) => {
    setSelectedId(book.id);
    setPageInput(String(book.currentPage));
    setTotalInput(book.totalPages ? String(book.totalPages) : "");
    setReadingNote(book.readingNote ?? "");
  };

  const importBook = async () => {
    try {
      setImporting(true);
      const book = await importPdfBook();
      if (book) { await refresh(); selectBook(book); }
    } catch { Alert.alert("تعذر استيراد الكتاب", "تأكد من اختيار ملف PDF صالح ثم حاول مجددًا."); }
    finally { setImporting(false); }
  };

  const saveProgress = async () => {
    if (!selected) return;
    const currentPage = Math.max(0, Number(pageInput) || 0);
    const totalPages = Math.max(1, Number(totalInput) || selected.totalPages || 1);
    await updateBook(selected.id, { currentPage: Math.min(currentPage, totalPages), totalPages, readingNote: readingNote.trim() });
    await refresh();
  };

  const openBook = async () => {
    if (!selected) return;
    try { await Linking.openURL(selected.uri); }
    catch { Alert.alert("تعذر فتح الكتاب", "تأكد من وجود قارئ PDF على هاتفك ثم حاول مرة أخرى."); }
  };

  const analyse = async () => {
    if (!selected || summary.trim().length < 20) { Alert.alert("أضف ملخصًا أولًا", "اكتب بضعة أسطر عن ما قرأته ليتم توليد أسئلة مراجعة دقيقة."); return; }
    try {
      const result = await generateQuestions.mutateAsync({ title: selected.title, summary: summary.trim() });
      await updateBook(selected.id, { analysisSource: summary.trim(), questions: result.questions });
      await refresh(); setSummary("");
    } catch { Alert.alert("تعذر التحليل الآن", "تأكد من اتصالك ثم حاول مرة أخرى."); }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View>
          <View style={styles.topbar}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><MaterialCommunityIcons name="arrow-right" size={21} color={BRAND.text} /></TouchableOpacity><Text style={styles.topbarTitle}>مكتبتي PDF</Text><View style={styles.backButton} /></View>
          <View style={styles.hero}><View><Text style={styles.title}>القراءة بتركيز</Text><Text style={styles.subtitle}>أضف كتبك من هاتفك وسجّل التقدم والأسئلة.</Text></View><View style={styles.heroIcon}><MaterialCommunityIcons name="book-open-page-variant" size={29} color={BRAND.primary} /></View></View>
          <TouchableOpacity style={styles.importButton} onPress={() => void importBook()} disabled={importing} activeOpacity={0.86}>{importing ? <ActivityIndicator color="#07160D" /> : <><MaterialCommunityIcons name="file-pdf-box" size={21} color="#07160D" /><Text style={styles.importText}>إضافة كتاب PDF من الهاتف</Text></>}</TouchableOpacity>
          {selected ? <View style={styles.detailCard}>
            <View style={styles.selectedHeading}><View style={styles.cover}><Text style={styles.coverText}>{bookCoverLetters(selected.title)}</Text></View><View style={styles.selectedCopy}><Text style={styles.selectedTitle}>{selected.title}</Text><Text style={styles.selectedMeta}>{selected.fileName}</Text></View></View>
            <TouchableOpacity style={styles.openBook} onPress={() => void openBook()}><MaterialCommunityIcons name="open-in-new" size={17} color={BRAND.primary} /><Text style={styles.openBookText}>فتح الكتاب في قارئ الجهاز</Text></TouchableOpacity>
            <View style={styles.fields}><View style={styles.fieldWrap}><Text style={styles.fieldLabel}>الصفحة الحالية</Text><TextInput value={pageInput} onChangeText={setPageInput} keyboardType="numeric" placeholder="0" placeholderTextColor={BRAND.muted} style={styles.fieldInput} /></View><View style={styles.fieldWrap}><Text style={styles.fieldLabel}>إجمالي الصفحات</Text><TextInput value={totalInput} onChangeText={setTotalInput} keyboardType="numeric" placeholder="مثال: 240" placeholderTextColor={BRAND.muted} style={styles.fieldInput} /></View></View>
            <Text style={styles.analysisLabel}>ملاحظة جلسة القراءة</Text><TextInput value={readingNote} onChangeText={setReadingNote} multiline textAlign="right" textAlignVertical="top" placeholder="اكتب سطرًا أو فكرة تريد العودة إليها..." placeholderTextColor={BRAND.muted} style={styles.noteInput} />
            <TouchableOpacity style={styles.saveProgress} onPress={() => void saveProgress()}><Text style={styles.saveProgressText}>حفظ التقدم والملاحظة</Text></TouchableOpacity>
            <Text style={styles.analysisLabel}>ملخص ما قرأت</Text><TextInput value={summary} onChangeText={setSummary} multiline textAlign="right" textAlignVertical="top" placeholder="اكتب الأفكار أو النقاط التي قرأتها، ثم حوّلها إلى أسئلة مراجعة..." placeholderTextColor={BRAND.muted} style={styles.summaryInput} />
            <TouchableOpacity style={styles.analyseButton} onPress={() => void analyse()} disabled={generateQuestions.isPending}>{generateQuestions.isPending ? <ActivityIndicator color={BRAND.primary} /> : <><MaterialCommunityIcons name="auto-fix" size={18} color={BRAND.primary} /><Text style={styles.analyseText}>حلّل الملخص وأنشئ أسئلة</Text></>}</TouchableOpacity>
            {selected.questions.length > 0 ? <View style={styles.questions}><Text style={styles.questionsTitle}>أسئلة مراجعة</Text>{selected.questions.map((item, index) => <View key={`${item.question}-${index}`} style={styles.question}><Text style={styles.questionText}>{index + 1}. {item.question}</Text><Text style={styles.hint}>تلميح: {item.hint}</Text></View>)}</View> : null}
          </View> : <View style={styles.helper}><MaterialCommunityIcons name="bookshelf" size={28} color={BRAND.primary} /><Text style={styles.helperTitle}>مكتبتك الخاصة</Text><Text style={styles.helperText}>اختر ملف PDF من هاتفك ليظهر هنا مع غلاف تلقائي وتقدم قراءة.</Text></View>}
          <Text style={styles.sectionTitle}>الكتب المضافة</Text>
        </View>}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<View />}
        renderItem={({ item }) => <TouchableOpacity style={[styles.bookRow, selectedId === item.id && styles.bookRowSelected]} onPress={() => selectBook(item)} activeOpacity={0.84}><View style={styles.miniCover}><Text style={styles.miniCoverText}>{bookCoverLetters(item.title)}</Text></View><View style={styles.bookCopy}><Text style={styles.bookTitle}>{item.title}</Text><Text style={styles.bookMeta}>{item.totalPages ? `الصفحة ${item.currentPage} من ${item.totalPages}` : "أضف عدد الصفحات لتتبع التقدم"}</Text><ProgressBar value={getBookProgress(item)} /></View></TouchableOpacity>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36, flexGrow: 1 }, topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface }, topbarTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900" }, hero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }, title: { color: BRAND.text, fontSize: 27, fontWeight: "900", textAlign: "right" }, subtitle: { color: BRAND.muted, fontSize: 13, lineHeight: 20, textAlign: "right", marginTop: 4 }, heroIcon: { width: 55, height: 55, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft }, importButton: { minHeight: 52, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: BRAND.primary }, importText: { color: "#07160D", fontWeight: "900", fontSize: 15 }, helper: { alignItems: "center", padding: 26, borderRadius: 22, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, marginTop: 14 }, helperTitle: { color: BRAND.text, fontSize: 17, fontWeight: "900", marginTop: 10 }, helperText: { color: BRAND.muted, fontSize: 12, lineHeight: 19, textAlign: "center", marginTop: 4 }, detailCard: { backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, padding: 16, borderRadius: 22, marginTop: 14 }, selectedHeading: { flexDirection: "row", gap: 12, alignItems: "center" }, cover: { width: 58, height: 74, borderRadius: 13, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BRAND.primary }, coverText: { color: BRAND.primary, fontWeight: "900", fontSize: 17 }, selectedCopy: { flex: 1 }, selectedTitle: { color: BRAND.text, fontSize: 17, fontWeight: "900", textAlign: "right" }, selectedMeta: { color: BRAND.muted, fontSize: 11, textAlign: "right", marginTop: 4 }, openBook: { minHeight: 39, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, borderWidth: 1, borderColor: BRAND.primary, marginTop: 13 }, openBookText: { color: BRAND.primary, fontSize: 12, fontWeight: "900" }, fields: { flexDirection: "row", gap: 10, marginTop: 16 }, fieldWrap: { flex: 1 }, fieldLabel: { color: BRAND.muted, fontSize: 11, fontWeight: "800", textAlign: "right", marginBottom: 6 }, fieldInput: { height: 43, color: BRAND.text, backgroundColor: BRAND.background, borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, paddingHorizontal: 10, textAlign: "right" }, saveProgress: { minHeight: 42, borderRadius: 13, justifyContent: "center", alignItems: "center", backgroundColor: BRAND.primarySoft, marginTop: 11 }, saveProgressText: { color: BRAND.primary, fontWeight: "900", fontSize: 13 }, analysisLabel: { color: BRAND.text, fontSize: 13, fontWeight: "900", textAlign: "right", marginTop: 18, marginBottom: 7 }, summaryInput: { minHeight: 94, color: BRAND.text, backgroundColor: BRAND.background, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 20 }, noteInput: { minHeight: 62, color: BRAND.text, backgroundColor: BRAND.background, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 20 }, analyseButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: BRAND.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7, marginTop: 11 }, analyseText: { color: BRAND.primary, fontSize: 13, fontWeight: "900" }, questions: { marginTop: 17 }, questionsTitle: { color: BRAND.text, fontSize: 15, fontWeight: "900", textAlign: "right", marginBottom: 8 }, question: { borderRightWidth: 2, borderRightColor: BRAND.primary, backgroundColor: BRAND.background, padding: 10, marginBottom: 7, borderRadius: 10 }, questionText: { color: BRAND.text, fontSize: 13, lineHeight: 20, textAlign: "right", fontWeight: "800" }, hint: { color: BRAND.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 3 }, sectionTitle: { color: BRAND.text, fontSize: 16, fontWeight: "900", textAlign: "right", marginTop: 24, marginBottom: 10 }, bookRow: { flexDirection: "row", gap: 11, padding: 13, backgroundColor: BRAND.surface, borderRadius: 18, borderWidth: 1, borderColor: BRAND.border }, bookRowSelected: { borderColor: BRAND.primary, backgroundColor: "#102219" }, miniCover: { width: 42, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft }, miniCoverText: { color: BRAND.primary, fontWeight: "900", fontSize: 12 }, bookCopy: { flex: 1, gap: 5 }, bookTitle: { color: BRAND.text, fontSize: 14, fontWeight: "900", textAlign: "right" }, bookMeta: { color: BRAND.muted, fontSize: 11, textAlign: "right" },
});

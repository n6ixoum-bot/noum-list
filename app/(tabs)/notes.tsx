import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { loadLearningPaths } from "@/lib/learning-paths";
import { loadKnowledgeNotes, renderMarkdown, saveKnowledgeNote, type KnowledgeNote } from "@/lib/noum-core";
import type { LearningPath } from "@/lib/plan-builder";

export default function NotesScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState<KnowledgeNote[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [nextNotes, nextPaths] = await Promise.all([loadKnowledgeNotes(), loadLearningPaths()]);
    setNotes(nextNotes);
    setPaths(nextPaths);
  }, []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const save = async () => {
    if (!title.trim() && !body.trim()) return;
    await saveKnowledgeNote({ title, body, linkedPathIds: selectedPathId ? [selectedPathId] : [] });
    setTitle(""); setBody(""); setSelectedPathId(null); setEditorOpen(false); await refresh();
  };

  return (
    <ScreenContainer>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View><View style={styles.header}><View><Text style={styles.title}>المعرفة</Text><Text style={styles.subtitle}>ملاحظاتك وروابطك في مكان واحد.</Text></View><View style={styles.headerIcon}><MaterialCommunityIcons name="brain" size={27} color={BRAND.primary} /></View></View><TouchableOpacity style={styles.newButton} onPress={() => setEditorOpen((value) => !value)} activeOpacity={0.86}><MaterialCommunityIcons name={editorOpen ? "close" : "plus"} size={20} color="#FFFFFF" /><Text style={styles.newButtonText}>{editorOpen ? "إغلاق المحرر" : "ملاحظة جديدة"}</Text></TouchableOpacity>{editorOpen ? <View style={styles.editor}><TextInput value={title} onChangeText={setTitle} placeholder="عنوان الملاحظة" placeholderTextColor={BRAND.muted} textAlign="right" style={styles.titleInput} /><TextInput value={body} onChangeText={setBody} placeholder={'اكتب باستخدام Markdown...\n# عنوان\n- فكرة مهمة\n**نص بارز**\n$E = mc^2$'} placeholderTextColor={BRAND.muted} textAlign="right" textAlignVertical="top" multiline style={styles.bodyInput} /><Text style={styles.label}>اربطها بمسار (اختياري)</Text><View style={styles.linkRow}>{paths.map((path) => <TouchableOpacity key={path.id} style={[styles.linkChip, selectedPathId === path.id && styles.linkChipSelected]} onPress={() => setSelectedPathId(selectedPathId === path.id ? null : path.id)} activeOpacity={0.8}><Text style={[styles.linkText, selectedPathId === path.id && styles.linkTextSelected]} numberOfLines={1}>{path.title}</Text></TouchableOpacity>)}</View><TouchableOpacity style={styles.saveButton} onPress={() => void save()} activeOpacity={0.86}><Text style={styles.saveButtonText}>حفظ الملاحظة</Text></TouchableOpacity></View> : null}<Text style={styles.sectionTitle}>ملاحظاتك</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="notebook-outline" size={30} color={BRAND.primary} /><Text style={styles.emptyTitle}>ابنِ ذاكرتك الخارجية</Text><Text style={styles.emptyText}>اكتب أول ملاحظة أو ملخص واربطه بأحد مساراتك.</Text></View>}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <View style={styles.noteCard}><View style={styles.noteHeading}><MaterialCommunityIcons name="note-text-outline" size={20} color={BRAND.primary} /><Text style={styles.noteTitle}>{item.title}</Text></View><Text style={styles.noteBody}>{renderMarkdown(item.body)}</Text>{item.linkedPathIds.length > 0 ? <TouchableOpacity style={styles.linkedBadge} onPress={() => router.push(`/plan/${item.linkedPathIds[0]}` as any)} activeOpacity={0.8}><MaterialCommunityIcons name="link-variant" size={14} color={BRAND.primary} /><Text style={styles.linkedText}>فتح المسار المرتبط</Text></TouchableOpacity> : null}</View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 35, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  headerIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  newButton: { minHeight: 51, borderRadius: 16, backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  newButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  editor: { marginTop: 14, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface },
  titleInput: { minHeight: 45, color: BRAND.text, fontSize: 17, fontWeight: "900", borderBottomWidth: 1, borderBottomColor: BRAND.border },
  bodyInput: { minHeight: 145, color: BRAND.text, fontSize: 14, lineHeight: 23, paddingTop: 14 },
  label: { color: BRAND.text, fontSize: 12, fontWeight: "900", textAlign: "right", marginTop: 7 },
  linkRow: { flexDirection: "row", gap: 7, marginTop: 9 },
  linkChip: { maxWidth: 145, paddingHorizontal: 10, minHeight: 32, borderRadius: 10, borderWidth: 1, borderColor: BRAND.border, justifyContent: "center" },
  linkChipSelected: { backgroundColor: BRAND.primarySoft, borderColor: BRAND.primary },
  linkText: { color: BRAND.muted, fontSize: 11, fontWeight: "800" },
  linkTextSelected: { color: BRAND.primary },
  saveButton: { minHeight: 44, borderRadius: 13, backgroundColor: BRAND.text, alignItems: "center", justifyContent: "center", marginTop: 15 },
  saveButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  sectionTitle: { color: BRAND.text, fontSize: 17, fontWeight: "900", textAlign: "right", marginTop: 25, marginBottom: 11 },
  noteCard: { padding: 15, borderRadius: 19, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border },
  noteHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteTitle: { flex: 1, color: BRAND.text, fontSize: 15, fontWeight: "900", textAlign: "right" },
  noteBody: { color: BRAND.muted, fontSize: 13, lineHeight: 21, marginTop: 10, textAlign: "right" },
  linkedBadge: { alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 4, marginTop: 11, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: BRAND.primarySoft },
  linkedText: { color: BRAND.primary, fontSize: 11, fontWeight: "800" },
  empty: { alignItems: "center", paddingTop: 35 },
  emptyTitle: { color: BRAND.text, fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyText: { color: BRAND.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 5 },
});

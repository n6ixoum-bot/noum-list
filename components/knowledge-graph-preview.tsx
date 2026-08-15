import Svg, { Circle, Line } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";

import { BRAND } from "@/constants/brand";
import type { KnowledgeNote } from "@/lib/noum-core";
import type { LearningPath } from "@/lib/plan-builder";

export function KnowledgeGraphPreview({ notes, paths }: { notes: KnowledgeNote[]; paths: LearningPath[] }) {
  const linkedNotes = notes.filter((note) => note.linkedPathIds.length > 0);
  const nodes = [...paths.slice(0, 3).map((path) => ({ id: path.id, label: path.title, kind: "path" as const })), ...linkedNotes.slice(0, 3).map((note) => ({ id: note.id, label: note.title, kind: "note" as const }))];
  const positions = [{ x: 42, y: 42 }, { x: 220, y: 38 }, { x: 148, y: 106 }, { x: 56, y: 146 }, { x: 238, y: 151 }, { x: 145, y: 182 }];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}><Text style={styles.title}>خريطة المعرفة</Text><Text style={styles.meta}>{linkedNotes.length} رابط محفوظ</Text></View>
      <View style={styles.canvas}>
        <Svg width="100%" height="202" viewBox="0 0 280 202" style={StyleSheet.absoluteFill}>
          {nodes.slice(0, 6).map((node, index) => <Line key={node.id} x1="140" y1="101" x2={positions[index].x} y2={positions[index].y} stroke={node.kind === "path" ? "#2FD47A" : "#315BCE"} strokeWidth="1.3" strokeOpacity="0.55" />)}
          <Circle cx="140" cy="101" r="19" fill="#173C27" stroke="#2FD47A" strokeWidth="2" />
          {nodes.slice(0, 6).map((node, index) => <Circle key={`dot-${node.id}`} cx={positions[index].x} cy={positions[index].y} r="13" fill={node.kind === "path" ? "#10291A" : "#121D33"} stroke={node.kind === "path" ? "#2FD47A" : "#6E8FFF"} strokeWidth="1.5" />)}
        </Svg>
        <View style={styles.centerLabel}><Text style={styles.centerText}>Noum</Text></View>
        {nodes.slice(0, 6).map((node, index) => <View key={`label-${node.id}`} style={[styles.nodeLabel, { left: positions[index].x - 41, top: positions[index].y + 15 }]}><Text style={styles.nodeText} numberOfLines={1}>{node.label}</Text></View>)}
      </View>
      <Text style={styles.caption}>المسارات باللون الأخضر والملاحظات المرتبطة باللون الأزرق.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: BRAND.border, backgroundColor: BRAND.surface, borderRadius: 20, padding: 14, marginTop: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: BRAND.text, fontSize: 14, fontWeight: "900" },
  meta: { color: BRAND.primary, fontSize: 11, fontWeight: "800" },
  canvas: { height: 202, marginTop: 5, overflow: "hidden" },
  centerLabel: { position: "absolute", left: 118, top: 89, width: 44, alignItems: "center" },
  centerText: { color: "#BFF7D3", fontSize: 10, fontWeight: "900" },
  nodeLabel: { position: "absolute", width: 82, alignItems: "center" },
  nodeText: { color: BRAND.muted, fontSize: 9, fontWeight: "700", textAlign: "center" },
  caption: { color: BRAND.muted, fontSize: 10, textAlign: "right", marginTop: 3 },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BRAND } from "@/constants/brand";
import { clearLearningPaths } from "@/lib/learning-paths";

export default function SettingsScreen() {
  const router = useRouter();

  const clearData = () => {
    Alert.alert("حذف المسارات؟", "سيتم حذف كل المسارات والمهام المحفوظة على هذا الجهاز. لا يمكن التراجع عن هذا الإجراء.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await clearLearningPaths();
          router.replace("/" as any);
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>الإعدادات</Text>
        <Text style={styles.subtitle}>نسخة بسيطة تحفظ بياناتك على الهاتف فقط.</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="translate" size={21} color={BRAND.primary} /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>لغة المصادر</Text><Text style={styles.rowDescription}>عربي وإنجليزي في كل مهمة</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name="cellphone-lock" size={21} color={BRAND.primary} /></View>
            <View style={styles.rowText}><Text style={styles.rowTitle}>خصوصية البيانات</Text><Text style={styles.rowDescription}>مساراتك وتقدّمك محفوظة محليًا</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={clearData} activeOpacity={0.84} accessibilityRole="button">
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={BRAND.danger} />
          <Text style={styles.dangerText}>حذف كل المسارات</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { color: BRAND.text, fontSize: 29, lineHeight: 38, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 14, lineHeight: 22, marginTop: 4, textAlign: "right" },
  card: { marginTop: 24, padding: 16, borderWidth: 1, borderColor: BRAND.border, borderRadius: 21, backgroundColor: BRAND.surface },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 3 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: BRAND.primarySoft, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowTitle: { color: BRAND.text, fontSize: 15, fontWeight: "800", textAlign: "right" },
  rowDescription: { color: BRAND.muted, fontSize: 12, marginTop: 3, textAlign: "right" },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 15 },
  dangerButton: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", minHeight: 50, marginTop: 20, borderWidth: 1, borderColor: "#F5C7CC", borderRadius: 16, backgroundColor: "#FFF7F8" },
  dangerText: { color: BRAND.danger, fontWeight: "800", fontSize: 14 },
});

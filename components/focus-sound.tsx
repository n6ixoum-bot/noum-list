import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { BRAND } from "@/constants/brand";
import { importFocusTrack, loadFocusTracks, type FocusTrack } from "@/lib/focus-audio";

export function FocusSoundControl() {
  const [tracks, setTracks] = useState<FocusTrack[]>([]);
  const [selected, setSelected] = useState<FocusTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [importing, setImporting] = useState(false);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  const refresh = useCallback(async () => setTracks(await loadFocusTracks()), []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => () => { playerRef.current?.remove(); }, []);

  const importTrack = async () => {
    try {
      setImporting(true);
      const track = await importFocusTrack();
      if (track) { await refresh(); setSelected(track); }
    } finally { setImporting(false); }
  };

  const togglePlay = async () => {
    if (!selected) return;
    if (playing) {
      playerRef.current?.pause();
      setPlaying(false);
      return;
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      if (!playerRef.current) playerRef.current = createAudioPlayer(selected.uri);
      playerRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const chooseTrack = (track: FocusTrack) => {
    if (selected?.id === track.id) return;
    playerRef.current?.remove();
    playerRef.current = null;
    setPlaying(false);
    setSelected(track);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}><View style={styles.icon}><MaterialCommunityIcons name="music-note-outline" size={21} color={BRAND.primary} /></View><View style={styles.copy}><Text style={styles.title}>صوت التركيز</Text><Text style={styles.subtitle}>أضف مقطعًا هادئًا من هاتفك لتشغيله أثناء الجلسة.</Text></View></View>
      {tracks.length > 0 ? <View style={styles.tracks}>{tracks.slice(0, 3).map((track) => <TouchableOpacity key={track.id} onPress={() => chooseTrack(track)} style={[styles.track, selected?.id === track.id && styles.trackSelected]} activeOpacity={0.8}><MaterialCommunityIcons name={selected?.id === track.id ? "music-note" : "music-note-outline"} size={16} color={selected?.id === track.id ? BRAND.primary : BRAND.muted} /><Text style={[styles.trackText, selected?.id === track.id && styles.trackTextSelected]} numberOfLines={1}>{track.name}</Text></TouchableOpacity>)}</View> : <Text style={styles.empty}>لا يوجد مقطع بعد. استخدم ملفات صوتية تملك حق استخدامها.</Text>}
      <View style={styles.controls}><TouchableOpacity style={styles.addButton} onPress={() => void importTrack()} disabled={importing} activeOpacity={0.84}>{importing ? <ActivityIndicator color={BRAND.primary} /> : <><MaterialCommunityIcons name="plus" size={18} color={BRAND.primary} /><Text style={styles.addText}>إضافة صوت</Text></>}</TouchableOpacity><TouchableOpacity style={[styles.playButton, !selected && styles.playButtonDisabled]} onPress={() => void togglePlay()} disabled={!selected} activeOpacity={0.84}><MaterialCommunityIcons name={playing ? "pause" : "play"} size={18} color="#07160D" /><Text style={styles.playText}>{playing ? "إيقاف" : "تشغيل"}</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 15, padding: 14, borderRadius: 20, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: BRAND.primarySoft },
  copy: { flex: 1 },
  title: { color: BRAND.text, fontSize: 14, fontWeight: "900", textAlign: "right" },
  subtitle: { color: BRAND.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 2 },
  empty: { color: BRAND.muted, fontSize: 11, lineHeight: 17, textAlign: "right", marginTop: 12 },
  tracks: { gap: 7, marginTop: 12 },
  track: { minHeight: 35, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10, backgroundColor: BRAND.background, borderWidth: 1, borderColor: BRAND.border },
  trackSelected: { backgroundColor: BRAND.primarySoft, borderColor: BRAND.primary },
  trackText: { flex: 1, color: BRAND.muted, fontSize: 11, fontWeight: "800", textAlign: "right" },
  trackTextSelected: { color: BRAND.primary },
  controls: { flexDirection: "row", gap: 8, marginTop: 13 },
  addButton: { flex: 1, minHeight: 41, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5, borderWidth: 1, borderColor: BRAND.primary },
  addText: { color: BRAND.primary, fontSize: 12, fontWeight: "900" },
  playButton: { flex: 1, minHeight: 41, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5, backgroundColor: BRAND.primary },
  playButtonDisabled: { opacity: 0.38 },
  playText: { color: "#07160D", fontSize: 12, fontWeight: "900" },
});

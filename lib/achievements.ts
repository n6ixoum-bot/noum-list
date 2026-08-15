export type Achievement = { id: string; title: string; description: string; icon: string; unlocked: boolean };

export function getAchievements(input: { xp: number; focusMinutes: number; reviewCount: number; streak: number }): Achievement[] {
  return [
    { id: "first-step", title: "البداية", description: "اكسب 25 XP", icon: "flag-checkered", unlocked: input.xp >= 25 },
    { id: "focus-hour", title: "ساعة تركيز", description: "أكمل 60 دقيقة تركيز", icon: "timer-outline", unlocked: input.focusMinutes >= 60 },
    { id: "memory-builder", title: "باني الذاكرة", description: "أكمل 20 مراجعة", icon: "cards-outline", unlocked: input.reviewCount >= 20 },
    { id: "streak-seven", title: "ثابت", description: "حافظ على 7 أيام متتالية", icon: "fire", unlocked: input.streak >= 7 },
  ];
}

export async function loadSeenAchievementIds() {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const raw = await AsyncStorage.getItem("noum-list.seen-achievements.v1");
  if (!raw) return [] as string[];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

export async function markAchievementSeen(id: string) {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const existing = await loadSeenAchievementIds();
  if (!existing.includes(id)) await AsyncStorage.setItem("noum-list.seen-achievements.v1", JSON.stringify([...existing, id]));
}

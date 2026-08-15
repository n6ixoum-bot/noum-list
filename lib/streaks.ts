import AsyncStorage from "@react-native-async-storage/async-storage";

import { emptyStreak, getStreakStatus, registerDailyCompletion, type StreakRecord } from "./streak-calculator";

const STREAK_STORAGE_KEY = "khutwati.daily-streak.v1";

export async function loadStreakRecord(): Promise<StreakRecord> {
  const raw = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
  if (!raw) return emptyStreak;

  try {
    const parsed = JSON.parse(raw) as Partial<StreakRecord>;
    return {
      currentStreak: typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
      bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
      lastCompletionDate: typeof parsed.lastCompletionDate === "string" ? parsed.lastCompletionDate : null,
    };
  } catch {
    return emptyStreak;
  }
}

export async function recordDailyCompletion() {
  const current = await loadStreakRecord();
  const updated = registerDailyCompletion(current);
  if (updated !== current) {
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
  }
  return getStreakStatus(updated);
}

export async function loadStreakStatus() {
  return getStreakStatus(await loadStreakRecord());
}

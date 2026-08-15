export type StreakRecord = {
  currentStreak: number;
  bestStreak: number;
  lastCompletionDate: string | null;
};

export type StreakStatus = StreakRecord & {
  isActiveToday: boolean;
  isAtRisk: boolean;
  visibleCurrentStreak: number;
  message: string;
};

export const emptyStreak: StreakRecord = {
  currentStreak: 0,
  bestStreak: 0,
  lastCompletionDate: null,
};

export function toDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function distanceInDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export function registerDailyCompletion(record: StreakRecord, referenceDate = new Date()): StreakRecord {
  const today = toDayKey(referenceDate);
  if (record.lastCompletionDate === today) return record;

  const continuesYesterday = record.lastCompletionDate
    ? distanceInDays(record.lastCompletionDate, today) === 1
    : false;
  const currentStreak = continuesYesterday ? record.currentStreak + 1 : 1;

  return {
    currentStreak,
    bestStreak: Math.max(record.bestStreak, currentStreak),
    lastCompletionDate: today,
  };
}

export function getStreakStatus(record: StreakRecord, referenceDate = new Date()): StreakStatus {
  const today = toDayKey(referenceDate);
  const gap = record.lastCompletionDate ? distanceInDays(record.lastCompletionDate, today) : null;
  const isActiveToday = gap === 0;
  const isAtRisk = gap === 1;
  const visibleCurrentStreak = gap === null || gap > 1 ? 0 : record.currentStreak;
  const message = isActiveToday
    ? "أنجزت مهمة اليوم — حافظت على سلسلتك."
    : isAtRisk
      ? "أنجز مهمة واحدة اليوم لتحافظ على سلسلتك."
      : visibleCurrentStreak === 0
        ? "أنجز مهمة اليوم لتبدأ سلسلة جديدة."
        : "استمر بخطوة صغيرة كل يوم.";

  return { ...record, isActiveToday, isAtRisk, visibleCurrentStreak, message };
}

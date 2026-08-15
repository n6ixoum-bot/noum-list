import { describe, expect, it } from "vitest";

import { emptyStreak, getStreakStatus, registerDailyCompletion } from "../lib/streak-calculator";

describe("daily streak calculator", () => {
  it("يبدأ السلسلة عند أول إنجاز يومي ولا يزيدها مرتين في اليوم نفسه", () => {
    const first = registerDailyCompletion(emptyStreak, new Date("2026-08-15T12:00:00"));
    const duplicate = registerDailyCompletion(first, new Date("2026-08-15T20:00:00"));

    expect(first.currentStreak).toBe(1);
    expect(first.bestStreak).toBe(1);
    expect(duplicate).toEqual(first);
  });

  it("يزيد السلسلة في اليوم التالي ويعيدها بعد انقطاع يومين", () => {
    const dayOne = registerDailyCompletion(emptyStreak, new Date("2026-08-14T12:00:00"));
    const dayTwo = registerDailyCompletion(dayOne, new Date("2026-08-15T12:00:00"));
    const afterGap = registerDailyCompletion(dayTwo, new Date("2026-08-18T12:00:00"));

    expect(dayTwo.currentStreak).toBe(2);
    expect(dayTwo.bestStreak).toBe(2);
    expect(afterGap.currentStreak).toBe(1);
    expect(afterGap.bestStreak).toBe(2);
  });

  it("يعرض السلسلة في خطر إذا كانت المهمة الأخيرة بالأمس", () => {
    const record = { currentStreak: 4, bestStreak: 4, lastCompletionDate: "2026-08-14" };
    const status = getStreakStatus(record, new Date("2026-08-15T12:00:00"));

    expect(status.isAtRisk).toBe(true);
    expect(status.visibleCurrentStreak).toBe(4);
  });
});

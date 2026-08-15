import { describe, expect, it } from "vitest";

import { createLearningPath } from "../lib/plan-builder";
import { calculateLearningStatistics } from "../lib/statistics";

describe("calculateLearningStatistics", () => {
  it("يحسب التقدم الكلي والمهام والمسارات المكتملة", () => {
    const path = createLearningPath("تعلم الشطرنج", "مبتدئ", 2, {
      title: "أساسيات الشطرنج",
      overview: "تعلم القواعد ثم طبّقها.",
      stages: [{
        title: "البدء",
        description: "تعرف القطع.",
        tasks: [{ title: "حركة القطع", outcome: "حرّك القطع.", durationMinutes: 20, arabicQuery: "حركة قطع الشطرنج", englishQuery: "chess pieces moves" }],
      }, {
        title: "التطبيق",
        description: "العب لعبة قصيرة.",
        tasks: [{ title: "مباراة قصيرة", outcome: "أنهِ اللعبة.", durationMinutes: 25, arabicQuery: "لعبة شطرنج للمبتدئين", englishQuery: "beginner chess game" }],
      }],
    });
    path.stages[0].tasks[0].completed = true;

    const stats = calculateLearningStatistics([path]);

    expect(stats.totalPaths).toBe(1);
    expect(stats.totalTasks).toBe(2);
    expect(stats.completedTasks).toBe(1);
    expect(stats.overallProgress).toBe(50);
    expect(stats.activePaths).toBe(1);
  });
});

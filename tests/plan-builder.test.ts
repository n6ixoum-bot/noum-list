import { describe, expect, it } from "vitest";

import { createLearningPath, getPathProgress } from "../lib/plan-builder";

describe("createLearningPath", () => {
  it("يبني مسارًا محليًا ويولّد روابط بحث عربية وإنجليزية صالحة", () => {
    const path = createLearningPath("تعلم الشطرنج", "مبتدئ", 2, {
      title: "أساسيات الشطرنج",
      overview: "ابدأ بالقواعد ثم حل تمارين قصيرة.",
      stages: [{
        title: "البداية",
        description: "تعرّف الرقعة والقطع.",
        tasks: [{
          title: "تعلم حركة القطع",
          outcome: "حرّك كل قطعة مرة واحدة على الرقعة.",
          durationMinutes: 25,
          arabicQuery: "تعلم حركة قطع الشطرنج للمبتدئين",
          englishQuery: "chess piece moves for beginners",
        }],
      }, {
        title: "التطبيق",
        description: "طبّق القواعد في لعبة قصيرة.",
        tasks: [{
          title: "العب مباراة تدريبية",
          outcome: "أنهِ مباراة قصيرة وسجل ملاحظتين.",
          durationMinutes: 35,
          arabicQuery: "مباراة شطرنج للمبتدئين شرح",
          englishQuery: "beginner chess game walkthrough",
        }],
      }],
    });

    expect(path.stages).toHaveLength(2);
    expect(path.stages[0].tasks[0].sources).toHaveLength(2);
    expect(path.stages[0].tasks[0].sources[0].url).toContain("youtube.com/results");
    expect(getPathProgress(path)).toBe(0);
  });
});

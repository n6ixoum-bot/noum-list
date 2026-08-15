export type SourceLanguage = "ar" | "en";

export type LearningSource = {
  id: string;
  title: string;
  language: SourceLanguage;
  query: string;
  url: string;
};

export type LearningTask = {
  id: string;
  title: string;
  outcome: string;
  durationMinutes: number;
  completed: boolean;
  sources: LearningSource[];
};

export type LearningStage = {
  id: string;
  title: string;
  description: string;
  tasks: LearningTask[];
};

export type LearningPath = {
  id: string;
  goal: string;
  title: string;
  overview: string;
  level: "مبتدئ" | "متوسط";
  durationWeeks: 2 | 4;
  createdAt: string;
  stages: LearningStage[];
};

export type GeneratedPlan = {
  title: string;
  overview: string;
  stages: Array<{
    title: string;
    description: string;
    tasks: Array<{
      title: string;
      outcome: string;
      durationMinutes: number;
      arabicQuery: string;
      englishQuery: string;
    }>;
  }>;
};

const youTubeSearchUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`;

const safeText = (value: string, fallback: string) => value.trim().slice(0, 160) || fallback;

export function createLearningPath(
  goal: string,
  level: "مبتدئ" | "متوسط",
  durationWeeks: 2 | 4,
  generated: GeneratedPlan,
): LearningPath {
  const stamp = Date.now().toString(36);
  const normalizedStages = generated.stages.slice(0, 6).map((stage, stageIndex) => ({
    id: `stage-${stamp}-${stageIndex}`,
    title: safeText(stage.title, `المرحلة ${stageIndex + 1}`),
    description: safeText(stage.description, "تقدم خطوة صغيرة وواضحة في هذه المرحلة."),
    tasks: stage.tasks.slice(0, 5).map((task, taskIndex) => {
      const arabicQuery = safeText(task.arabicQuery, `${goal} شرح للمبتدئين`);
      const englishQuery = safeText(task.englishQuery, `${goal} beginner tutorial`);
      return {
        id: `task-${stamp}-${stageIndex}-${taskIndex}`,
        title: safeText(task.title, "مهمة تعلّم"),
        outcome: safeText(task.outcome, "طبّق ما تعلمته في تمرين صغير."),
        durationMinutes: Math.min(120, Math.max(10, Number(task.durationMinutes) || 30)),
        completed: false,
        sources: [
          {
            id: `source-${stamp}-${stageIndex}-${taskIndex}-ar`,
            title: "ابحث عن شرح عربي",
            language: "ar" as const,
            query: arabicQuery,
            url: youTubeSearchUrl(arabicQuery),
          },
          {
            id: `source-${stamp}-${stageIndex}-${taskIndex}-en`,
            title: "Search in English",
            language: "en" as const,
            query: englishQuery,
            url: youTubeSearchUrl(englishQuery),
          },
        ],
      };
    }),
  }));

  return {
    id: `path-${stamp}`,
    goal: safeText(goal, "هدف تعلّم"),
    title: safeText(generated.title, goal),
    overview: safeText(generated.overview, "مسار عملي من مهام قصيرة ومتدرجة."),
    level,
    durationWeeks,
    createdAt: new Date().toISOString(),
    stages: normalizedStages,
  };
}

export function getPathProgress(path: LearningPath) {
  const tasks = path.stages.flatMap((stage) => stage.tasks);
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100);
}

export function getFirstOpenTask(path: LearningPath) {
  return path.stages.flatMap((stage) => stage.tasks).find((task) => !task.completed);
}

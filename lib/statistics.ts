import { getPathProgress, type LearningPath } from "./plan-builder";

export type LearningStatistics = {
  totalPaths: number;
  activePaths: number;
  completedPaths: number;
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
  encouragement: string;
};

function getEncouragement(progress: number, totalPaths: number) {
  if (totalPaths === 0) return "كل رحلة تبدأ بهدف واحد واضح. ابدأ اليوم بخطوة صغيرة.";
  if (progress === 100) return "إنجاز رائع! أكملت كل مساراتك الحالية. اختر هدفك القادم.";
  if (progress >= 75) return "اقتربت من النهاية. أكمل المهام الصغيرة المتبقية لتحصد إنجازك.";
  if (progress >= 50) return "نصف الطريق وأكثر. ثباتك اليومي يحوّل الهدف إلى مهارة.";
  if (progress >= 25) return "تقدّمك واضح. استمر بمهمة واحدة في كل مرة.";
  return "بداية ممتازة. المهمة التالية هي أفضل خطوة الآن.";
}

export function calculateLearningStatistics(paths: LearningPath[]): LearningStatistics {
  const allTasks = paths.flatMap((path) => path.stages.flatMap((stage) => stage.tasks));
  const completedTasks = allTasks.filter((task) => task.completed).length;
  const totalTasks = allTasks.length;
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const completedPaths = paths.filter((path) => getPathProgress(path) === 100).length;

  return {
    totalPaths: paths.length,
    activePaths: paths.length - completedPaths,
    completedPaths,
    totalTasks,
    completedTasks,
    overallProgress,
    encouragement: getEncouragement(overallProgress, paths.length),
  };
}

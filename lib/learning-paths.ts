import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LearningPath } from "@/lib/plan-builder";

const STORAGE_KEY = "khutwati.learning-paths.v1";

export async function loadLearningPaths(): Promise<LearningPath[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as LearningPath[];
    return Array.isArray(data) ? data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch {
    return [];
  }
}

export async function saveLearningPaths(paths: LearningPath[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
}

export async function addLearningPath(path: LearningPath) {
  const paths = await loadLearningPaths();
  await saveLearningPaths([path, ...paths]);
}

export async function findLearningPath(id: string) {
  const paths = await loadLearningPaths();
  return paths.find((path) => path.id === id) ?? null;
}

export async function toggleLearningTask(pathId: string, taskId: string) {
  const paths = await loadLearningPaths();
  const updatedPaths = paths.map((path) => {
    if (path.id !== pathId) return path;
    return {
      ...path,
      stages: path.stages.map((stage) => ({
        ...stage,
        tasks: stage.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      })),
    };
  });
  await saveLearningPaths(updatedPaths);
  return updatedPaths.find((path) => path.id === pathId) ?? null;
}

export async function deleteLearningPath(id: string) {
  const paths = await loadLearningPaths();
  await saveLearningPaths(paths.filter((path) => path.id !== id));
}

export async function clearLearningPaths() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

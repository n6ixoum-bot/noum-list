import AsyncStorage from "@react-native-async-storage/async-storage";

import type { LearningPath } from "@/lib/plan-builder";

export type KnowledgeNote = {
  id: string;
  title: string;
  body: string;
  linkedPathIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProgressProfile = {
  xp: number;
  completedTaskIds: string[];
};

export type FocusSession = {
  id: string;
  pathId: string | null;
  minutes: number;
  completedAt: string;
};

const NOTES_KEY = "noum-list.knowledge-notes.v1";
const XP_KEY = "noum-list.xp.v1";
const FOCUS_KEY = "noum-list.focus-sessions.v1";

export async function loadKnowledgeNotes(): Promise<KnowledgeNote[]> {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as KnowledgeNote[]; } catch { return []; }
}

export async function saveKnowledgeNote(input: Pick<KnowledgeNote, "title" | "body" | "linkedPathIds">) {
  const notes = await loadKnowledgeNotes();
  const now = new Date().toISOString();
  const note: KnowledgeNote = {
    id: `note-${Date.now().toString(36)}`,
    title: input.title.trim() || "بدون عنوان",
    body: input.body,
    linkedPathIds: input.linkedPathIds,
    createdAt: now,
    updatedAt: now,
  };
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify([note, ...notes]));
  return note;
}

export async function loadProfile(): Promise<ProgressProfile> {
  const raw = await AsyncStorage.getItem(XP_KEY);
  if (!raw) return { xp: 0, completedTaskIds: [] };
  try {
    const value = JSON.parse(raw) as Partial<ProgressProfile>;
    return { xp: typeof value.xp === "number" ? value.xp : 0, completedTaskIds: Array.isArray(value.completedTaskIds) ? value.completedTaskIds : [] };
  } catch { return { xp: 0, completedTaskIds: [] }; }
}

export async function awardTaskXp(taskId: string, amount = 25) {
  const profile = await loadProfile();
  if (profile.completedTaskIds.includes(taskId)) return profile;
  const next = { xp: profile.xp + amount, completedTaskIds: [...profile.completedTaskIds, taskId] };
  await AsyncStorage.setItem(XP_KEY, JSON.stringify(next));
  return next;
}

export function getLevelFromXp(xp: number) {
  return Math.floor(Math.max(0, xp) / 100) + 1;
}

export function getLevelProgress(xp: number) {
  return Math.max(0, xp % 100);
}

export async function loadFocusSessions(): Promise<FocusSession[]> {
  const raw = await AsyncStorage.getItem(FOCUS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FocusSession[]; } catch { return []; }
}

export async function saveFocusSession(pathId: string | null, minutes: number) {
  const sessions = await loadFocusSessions();
  const session: FocusSession = { id: `focus-${Date.now().toString(36)}`, pathId, minutes, completedAt: new Date().toISOString() };
  await AsyncStorage.setItem(FOCUS_KEY, JSON.stringify([session, ...sessions]));
  return session;
}

export function getPathLabel(pathId: string | null, paths: LearningPath[]) {
  if (!pathId) return "جلسة عامة";
  return paths.find((path) => path.id === pathId)?.title ?? "مسار غير متاح";
}

export function renderMarkdown(markdown: string) {
  return markdown
    .replace(/^### (.*)$/gm, "▸ $1")
    .replace(/^## (.*)$/gm, "◆ $1")
    .replace(/^# (.*)$/gm, "▰ $1")
    .replace(/^[-*] (.*)$/gm, "• $1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .trim();
}

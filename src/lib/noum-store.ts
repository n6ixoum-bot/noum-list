import type { Flashcard, KnowledgeNote, LibraryBook, LearningPath, NoumState, Task } from "../types";

const STORE_KEY = "noum-list-web-v1";

export const seedPaths: LearningPath[] = [
  {
    id: "chess",
    title: "إتقان أساسيات الشطرنج",
    description: "مسار عملي من قواعد القطع إلى بناء خطة لعب واضحة.",
    category: "تعلّم ذاتي",
    color: "mint",
    steps: 18,
    completedSteps: 12,
    streak: 6,
    nextAction: "حل 3 ألغاز تكتيكية قصيرة",
  },
  {
    id: "english",
    title: "English for daily work",
    description: "مفردات، استماع، وبطاقات مراجعة لروتين عملي يومي.",
    category: "لغة",
    color: "blue",
    steps: 28,
    completedSteps: 9,
    streak: 4,
    nextAction: "Review the due vocabulary cards",
  },
  {
    id: "editing",
    title: "مونتاج فيديو للمبتدئين",
    description: "مهارات تحرير منظمة من القص إلى الإيقاع البصري.",
    category: "مهارة مهنية",
    color: "amber",
    steps: 22,
    completedSteps: 5,
    streak: 2,
    nextAction: "تطبيق تمرين قصّ على لقطة قصيرة",
  },
];

export const seedTasks: Task[] = [
  { id: "task-1", title: "حل 3 ألغاز تكتيكية قصيرة", pathId: "chess", completed: false, due: "اليوم", priority: "high", minutes: 20 },
  { id: "task-2", title: "مراجعة 12 بطاقة إنجليزية", pathId: "english", completed: false, due: "اليوم", priority: "medium", minutes: 15 },
  { id: "task-3", title: "شاهد درس الإيقاع في المونتاج", pathId: "editing", completed: true, due: "اليوم", priority: "low", minutes: 25 },
  { id: "task-4", title: "اكتب ملاحظة عن الافتتاحيات", pathId: "chess", completed: false, due: "غدًا", priority: "medium", minutes: 10 },
];

export const seedNotes: KnowledgeNote[] = [
  {
    id: "note-1",
    title: "قاعدة التحسين الصغير",
    body: "# تحسين صغير كل يوم\n\nلا أحتاج إلى جلسة طويلة لأتقدم. أحتاج إلى **خطوة واحدة واضحة** قابلة للبدء الآن.\n\n- حدّد أصغر نتيجة مفيدة\n- اربطها بمسارك [[إتقان أساسيات الشطرنج]]",
    linkedPathIds: ["chess"],
    updatedAt: "منذ 18 دقيقة",
    tags: ["تركيز", "نظام"],
  },
  {
    id: "note-2",
    title: "قائمة مفردات العمل",
    body: "## Words worth keeping\n\n**deadline** — الموعد النهائي\n\n**feedback** — ملاحظات لتحسين العمل\n\nاستخدمها ضمن جمل قصيرة بدل حفظها منفصلة.",
    linkedPathIds: ["english"],
    updatedAt: "أمس",
    tags: ["English", "مفردات"],
  },
];

export const seedFlashcards: Flashcard[] = [
  { id: "card-1", front: "deadline", back: "الموعد النهائي", language: "English", due: true, interval: 1, reviews: 2 },
  { id: "card-2", front: "consistent", back: "منتظم / ثابت", language: "English", due: true, interval: 2, reviews: 1 },
  { id: "card-3", front: "attention", back: "انتباه", language: "English", due: true, interval: 1, reviews: 3 },
  { id: "card-4", front: "capture", back: "يلتقط / يسجل فكرة", language: "English", due: false, interval: 5, reviews: 4 },
];

export const seedBooks: LibraryBook[] = [
  { id: "book-1", title: "Atomic Habits", author: "James Clear", progress: 62, pages: 320, accent: "#35d89a", question: "ما التغيير الصغير الذي يمكنك ربطه بعادة موجودة؟" },
  { id: "book-2", title: "Deep Work", author: "Cal Newport", progress: 28, pages: 304, accent: "#70a7ff", question: "كيف ستمنع المشتتات في جلستك القادمة؟" },
  { id: "book-3", title: "The Creative Act", author: "Rick Rubin", progress: 9, pages: 432, accent: "#d8aa58", question: "ما الفكرة التي تريد التقاطها قبل أن تختفي؟" },
];

export const seedState: NoumState = {
  locale: "ar",
  tasks: seedTasks,
  paths: seedPaths,
  notes: seedNotes,
  flashcards: seedFlashcards,
  books: seedBooks,
  focusMinutes: 30,
  soundEnabled: true,
};

function copySeed(): NoumState {
  return JSON.parse(JSON.stringify(seedState)) as NoumState;
}

export function loadNoumState(): NoumState {
  if (typeof window === "undefined") return copySeed();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return copySeed();
    return { ...copySeed(), ...(JSON.parse(raw) as Partial<NoumState>) };
  } catch {
    return copySeed();
  }
}

export function saveNoumState(state: NoumState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function resetNoumState(): NoumState {
  const fresh = copySeed();
  saveNoumState(fresh);
  return fresh;
}

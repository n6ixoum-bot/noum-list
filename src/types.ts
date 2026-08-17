export type Locale = "ar" | "en";

export type ViewId = "dashboard" | "paths" | "brain" | "learning" | "library" | "focus" | "stats" | "settings";

export type TaskPriority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  pathId: string;
  completed: boolean;
  due: string;
  priority: TaskPriority;
  minutes: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  color: "mint" | "blue" | "amber" | "violet";
  steps: number;
  completedSteps: number;
  streak: number;
  nextAction: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  body: string;
  linkedPathIds: string[];
  updatedAt: string;
  tags: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  language: string;
  due: boolean;
  interval: number;
  reviews: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  progress: number;
  pages: number;
  accent: string;
  question: string;
}

export interface FocusSession {
  id: string;
  completedAt: string;
  minutes: number;
  pathId: string | null;
}

export interface NoumState {
  locale: Locale;
  tasks: Task[];
  paths: LearningPath[];
  notes: KnowledgeNote[];
  flashcards: Flashcard[];
  books: LibraryBook[];
  focusMinutes: number;
  focusSessions: FocusSession[];
  notificationReadIds: string[];
  soundEnabled: boolean;
}

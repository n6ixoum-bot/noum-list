import type { Locale, NoumState, ViewId } from "../types";

export type LocalNotification = {
  id: string;
  title: string;
  detail: string;
  target: ViewId;
  tone: "mint" | "blue" | "amber";
};

export function buildLocalNotifications(state: NoumState, locale: Locale): LocalNotification[] {
  const isArabic = locale === "ar";
  const dueToday = state.tasks.filter((task) => !task.completed && (task.due === "اليوم" || task.due === "Today"));
  const notifications: LocalNotification[] = dueToday.map((task) => ({
    id: `task:${task.id}`,
    title: isArabic ? "مهمة اليوم تحتاج خطوة" : "A task needs your next step",
    detail: task.title,
    target: "dashboard",
    tone: task.priority === "high" ? "amber" : "mint",
  }));

  const dueCards = state.flashcards.filter((card) => card.due);
  if (dueCards.length) {
    notifications.push({
      id: `review:${dueCards.map((card) => card.id).join(",")}`,
      title: isArabic ? "مراجعة قصيرة مستحقة" : "A short review is due",
      detail: isArabic ? `${dueCards.length} بطاقات تنتظر مراجعتك` : `${dueCards.length} cards are ready to review`,
      target: "learning",
      tone: "blue",
    });
  }

  const recentFocus = state.focusSessions[0];
  if (recentFocus && Date.now() - Date.parse(recentFocus.completedAt) < 86_400_000) {
    notifications.push({
      id: `focus:${recentFocus.id}`,
      title: isArabic ? "جلسة تركيز مكتملة" : "Focus session completed",
      detail: isArabic ? `${recentFocus.minutes} دقيقة مركزة أُضيفت إلى سجلك` : `${recentFocus.minutes} focused minutes were saved`,
      target: "focus",
      tone: "mint",
    });
  }

  return notifications;
}

import { describe, expect, it } from "vitest";
import { buildLocalNotifications } from "../src/lib/notifications";
import { resetNoumState } from "../src/lib/noum-store";

describe("local notification center", () => {
  it("derives actionable alerts from due tasks and flashcards", () => {
    const state = resetNoumState();
    state.tasks.push({ id: "today-task", title: "ابدأ الدرس", pathId: "inbox", completed: false, due: "اليوم", priority: "high", minutes: 20 });
    state.flashcards.push({ id: "due-card", front: "focus", back: "تركيز", language: "English", due: true, interval: 1, reviews: 0 });

    const notifications = buildLocalNotifications(state, "ar");

    expect(notifications).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "task:today-task", target: "dashboard", tone: "amber" }),
      expect.objectContaining({ id: "review:due-card", target: "learning", tone: "blue" }),
    ]));
  });

  it("does not create stale alerts after tasks and reviews are completed", () => {
    const state = resetNoumState();
    state.tasks.push({ id: "done-task", title: "منتهية", pathId: "inbox", completed: true, due: "اليوم", priority: "low", minutes: 10 });
    state.flashcards.push({ id: "later-card", front: "later", back: "لاحقًا", language: "English", due: false, interval: 3, reviews: 1 });

    expect(buildLocalNotifications(state, "ar")).toHaveLength(0);
  });
});

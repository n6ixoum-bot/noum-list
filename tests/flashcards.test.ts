import { describe, expect, it } from "vitest";

import { getDueCards, getWeeklyReviewCount, scheduleReview, type Flashcard } from "../lib/flashcards";

const card: Flashcard = { id: "card-1", front: "hello", back: "مرحبا", language: "English", dueAt: "2026-08-15T00:00:00.000Z", intervalDays: 1, ease: 2.3, repetitions: 0, createdAt: "2026-08-15T00:00:00.000Z" };

describe("spaced repetition", () => {
  it("يؤخر البطاقة حسب تقييم التذكر", () => {
    const again = scheduleReview(card, "again", new Date("2026-08-15T12:00:00.000Z"));
    const easy = scheduleReview(card, "easy", new Date("2026-08-15T12:00:00.000Z"));
    expect(again.intervalDays).toBe(1);
    expect(easy.intervalDays).toBe(4);
    expect(new Date(easy.dueAt).getTime()).toBeGreaterThan(new Date(again.dueAt).getTime());
  });

  it("يعرض فقط البطاقات المستحقة اليوم أو قبله", () => {
    const upcoming = { ...card, id: "card-2", dueAt: "2026-08-18T00:00:00.000Z" };
    expect(getDueCards([card, upcoming], new Date("2026-08-15T12:00:00.000Z")).map((item) => item.id)).toEqual(["card-1"]);
  });

  it("يحسب مراجعات الأيام السبعة الأخيرة فقط", () => {
    const reviews = [
      { cardId: "1", rating: "good" as const, reviewedAt: "2026-08-15T10:00:00.000Z" },
      { cardId: "2", rating: "easy" as const, reviewedAt: "2026-08-07T10:00:00.000Z" },
    ];
    expect(getWeeklyReviewCount(reviews, new Date("2026-08-15T12:00:00.000Z"))).toBe(1);
  });
});

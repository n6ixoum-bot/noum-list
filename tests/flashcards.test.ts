import { describe, expect, it } from "vitest";

import { getDueCards, scheduleReview, type Flashcard } from "../lib/flashcards";

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
});

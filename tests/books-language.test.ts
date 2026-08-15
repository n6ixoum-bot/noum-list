import { describe, expect, it } from "vitest";

import { bookCoverLetters, getBookProgress } from "../lib/book-utils";
import { getLanguagePlan } from "../lib/language-plans";

describe("books and language planning", () => {
  it("يحسب تقدم القراءة ويستخرج حروف الغلاف تلقائيًا", () => {
    expect(getBookProgress({ totalPages: 200, currentPage: 50 } as any)).toBe(25);
    expect(getBookProgress({ totalPages: null, currentPage: 50 } as any)).toBe(0);
    expect(bookCoverLetters("العادات الذرية")).toBe("اا");
  });

  it("ينشئ خطة لغة من أربع مراحل عملية للمبتدئ", () => {
    const plan = getLanguagePlan("English");
    expect(plan.weeks).toHaveLength(4);
    expect(plan.weeks[0].tasks.length).toBeGreaterThan(0);
  });
});

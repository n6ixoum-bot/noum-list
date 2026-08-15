import { describe, expect, it } from "vitest";

import { getLevelFromXp, getLevelProgress, renderMarkdown } from "../lib/noum-core";

describe("Noum List knowledge and gamification", () => {
  it("يحسب المستوى وتقدم XP داخل المستوى", () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(125)).toBe(2);
    expect(getLevelProgress(125)).toBe(25);
  });

  it("يعرض أساسيات Markdown كنص منظم", () => {
    expect(renderMarkdown("# عنوان\n- فكرة\n**مهم**")).toContain("▰ عنوان");
    expect(renderMarkdown("# عنوان\n- فكرة\n**مهم**")).toContain("• فكرة");
    expect(renderMarkdown("# عنوان\n- فكرة\n**مهم**")).toContain("مهم");
  });
});

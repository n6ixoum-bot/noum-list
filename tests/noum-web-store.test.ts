import { describe, expect, it } from "vitest";
import { loadNoumState, resetNoumState, seedState } from "../src/lib/noum-store";

describe("Noum List web store", () => {
  it("creates an isolated empty local-first state", () => {
    const first = loadNoumState();
    const second = loadNoumState();

    first.tasks.push({ id: "local-only", title: "مهمة محلية", pathId: "", completed: false, due: "اليوم", priority: "low", minutes: 10 });

    expect(second.tasks).toHaveLength(0);
    expect(first.paths).toHaveLength(seedState.paths.length);
    expect(first.notes).toHaveLength(0);
  });

  it("resets to a clean workspace", () => {
    const reset = resetNoumState();

    expect(reset.flashcards).toHaveLength(0);
    expect(reset.books).toHaveLength(0);
    expect(reset.focusMinutes).toBe(0);
    expect(reset.soundEnabled).toBe(false);
  });
});

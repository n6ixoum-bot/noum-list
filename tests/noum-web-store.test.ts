import { describe, expect, it } from "vitest";
import { loadNoumState, resetNoumState, seedState } from "../src/lib/noum-store";

describe("Noum List web store", () => {
  it("creates an isolated local-first initial state", () => {
    const first = loadNoumState();
    const second = loadNoumState();

    first.tasks[0].title = "modified only in this instance";

    expect(second.tasks[0].title).toBe(seedState.tasks[0].title);
    expect(first.paths).toHaveLength(seedState.paths.length);
    expect(first.notes[0].linkedPathIds).toContain("chess");
  });

  it("resets to the complete seeded workspace", () => {
    const reset = resetNoumState();

    expect(reset.flashcards.filter((card) => card.due)).toHaveLength(3);
    expect(reset.books).toHaveLength(3);
    expect(reset.soundEnabled).toBe(true);
  });
});

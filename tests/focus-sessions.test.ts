import { describe, expect, it } from "vitest";
import { createFocusSession } from "../src/lib/focus-sessions";

describe("focus session history", () => {
  it("creates a persisted, path-linked record with an ISO completion time", () => {
    const completedAt = new Date("2026-08-17T09:30:00.000Z");
    const session = createFocusSession(50, "language-path", completedAt);

    expect(session).toEqual({
      id: "focus-1786959000000",
      completedAt: "2026-08-17T09:30:00.000Z",
      minutes: 50,
      pathId: "language-path",
    });
  });

  it("keeps a valid duration if a malformed timer value is passed", () => {
    expect(createFocusSession(0, null).minutes).toBe(1);
    expect(createFocusSession(999, null).minutes).toBe(240);
  });
});

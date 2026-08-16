import { describe, expect, it } from "vitest";

describe("local success sounds configuration", () => {
  it("keeps success sounds local and explicitly enabled", () => {
    expect(process.env.NOUM_LIST_SUCCESS_SOUNDS_LOCAL).toBe("true");
  });
});

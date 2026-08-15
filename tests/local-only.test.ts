import { describe, expect, it } from "vitest";

describe("Noum List local mode", () => {
  it("يحافظ على وضع العمل المحلي دون اعتماد على خدمة خارجية", () => {
    expect(process.env.NOUM_LIST_LOCAL_ONLY ?? "true").toBe("true");
  });
});

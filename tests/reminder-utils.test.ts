import { describe, expect, it } from "vitest";

import { formatReminderTime, normalizeReminderSettings, reminderBody } from "../lib/reminder-utils";

describe("reminder utilities", () => {
  it("يعيد إعدادات تذكير سليمة عند وصول بيانات ناقصة أو غير صالحة", () => {
    const settings = normalizeReminderSettings({ enabled: true, hour: 30, minute: -4 });

    expect(settings.enabled).toBe(true);
    expect(settings.hour).toBe(20);
    expect(settings.minute).toBe(0);
  });

  it("ينسق وقت التذكير ويضمّنه في رسالة التحفيز", () => {
    expect(formatReminderTime(20, 5)).toBe("8:05 م");
    expect(reminderBody(18, 0)).toContain("6:00 م");
  });
});

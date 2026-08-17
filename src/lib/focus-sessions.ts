import type { FocusSession } from "../types";

export function createFocusSession(minutes: number, pathId: string | null, completedAt = new Date()): FocusSession {
  const duration = Math.max(1, Math.min(240, Math.round(minutes)));
  return {
    id: `focus-${completedAt.getTime()}`,
    completedAt: completedAt.toISOString(),
    minutes: duration,
    pathId,
  };
}

import { describe, expect, it } from "vitest";
import { BACKUP_FORMAT, BACKUP_VERSION, makeBackupEnvelope, parseBackup } from "../src/lib/noum-backup";
import { resetNoumState } from "../src/lib/noum-store";

describe("Noum List backups", () => {
  it("round-trips a valid local-first workspace backup", () => {
    const state = resetNoumState();
    const envelope = makeBackupEnvelope(state);
    const restored = parseBackup(JSON.stringify(envelope));

    expect(restored.format).toBe(BACKUP_FORMAT);
    expect(restored.version).toBe(BACKUP_VERSION);
    expect(restored.state.tasks).toHaveLength(state.tasks.length);
    expect(restored.state.notes[0].linkedPathIds).toContain("chess");
  });

  it("rejects malformed or incomplete files before restore", () => {
    expect(() => parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, createdAt: "today", state: {} }))).toThrow("INVALID_BACKUP");
    expect(() => parseBackup("not json")).toThrow();
  });
});

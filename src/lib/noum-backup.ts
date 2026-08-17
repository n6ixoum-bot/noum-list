import type { FocusSession, NoumState } from "../types";

export const BACKUP_FORMAT = "noum-list-backup" as const;
export const BACKUP_VERSION = 1 as const;

export type BackupEnvelope = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  state: NoumState;
};

export type CloudBackupPayload = { version: 1; payload: string; checksum: string };

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function makeBackupEnvelope(state: NoumState): BackupEnvelope {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, createdAt: new Date().toISOString(), state };
}

export async function makeCloudBackup(state: NoumState): Promise<CloudBackupPayload> {
  const payload = JSON.stringify(makeBackupEnvelope(state));
  return { version: BACKUP_VERSION, payload, checksum: await sha256(payload) };
}

function isFocusSession(value: unknown): value is FocusSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  return typeof session.id === "string"
    && typeof session.completedAt === "string"
    && Number.isFinite(Date.parse(session.completedAt))
    && typeof session.minutes === "number"
    && Number.isFinite(session.minutes)
    && session.minutes > 0
    && session.minutes <= 240
    && (typeof session.pathId === "string" || session.pathId === null);
}

function isNoumState(value: unknown): value is Omit<NoumState, "focusSessions"> & { focusSessions?: FocusSession[] } {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (data.locale === "ar" || data.locale === "en")
    && Array.isArray(data.tasks)
    && Array.isArray(data.paths)
    && Array.isArray(data.notes)
    && Array.isArray(data.flashcards)
    && Array.isArray(data.books)
    && typeof data.focusMinutes === "number"
    && typeof data.soundEnabled === "boolean"
    && (data.focusSessions === undefined || (Array.isArray(data.focusSessions) && data.focusSessions.every(isFocusSession)));
}

export function parseBackup(payload: string): BackupEnvelope {
  const parsed = JSON.parse(payload) as Partial<BackupEnvelope>;
  if (parsed.format !== BACKUP_FORMAT || parsed.version !== BACKUP_VERSION || typeof parsed.createdAt !== "string" || !isNoumState(parsed.state)) {
    throw new Error("INVALID_BACKUP");
  }
  const state = parsed.state;
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: parsed.createdAt,
    state: { ...state, focusSessions: state.focusSessions ?? [] },
  } as BackupEnvelope;
}

export async function parseCloudBackup(payload: string, checksum: string): Promise<BackupEnvelope> {
  if (await sha256(payload) !== checksum) throw new Error("CHECKSUM_MISMATCH");
  return parseBackup(payload);
}

export function downloadBackup(state: NoumState) {
  const contents = JSON.stringify(makeBackupEnvelope(state), null, 2);
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `noum-list-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readBackupFile(file: File): Promise<BackupEnvelope> {
  if (file.size > 2_000_000) throw new Error("BACKUP_TOO_LARGE");
  return parseBackup(await file.text());
}

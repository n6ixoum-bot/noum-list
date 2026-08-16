import type { CloudBackupPayload } from "./noum-backup";

export type SyncUser = { id: number; name: string | null };
export type RemoteSnapshot = { payload: string; checksum: string; updatedAt: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.error === "string" ? body.error : "SYNC_UNAVAILABLE");
  }
  return response.json() as Promise<T>;
}

export async function getSyncStatus() {
  return request<{ user: SyncUser | null }>("/api/noum-sync/status");
}

export async function getRemoteSnapshot() {
  return request<{ snapshot: RemoteSnapshot | null }>("/api/noum-sync/snapshot");
}

export async function uploadSnapshot(snapshot: CloudBackupPayload) {
  return request<{ updatedAt: string }>("/api/noum-sync/snapshot", { method: "PUT", body: JSON.stringify(snapshot) });
}

export function startSyncLogin() {
  window.location.assign(`/api/noum-sync/login?returnTo=${encodeURIComponent(window.location.origin)}`);
}

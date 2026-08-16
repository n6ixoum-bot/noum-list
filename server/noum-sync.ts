import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { getNoumSyncSnapshot, upsertNoumSyncSnapshot } from "./db";
import { sdk } from "./_core/sdk";

const snapshotInput = z.object({
  version: z.literal(1),
  payload: z.string().min(40).max(2_000_000),
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
});

function getPublicUrl(req: Request) {
  return `${req.protocol}://${req.get("host")}`;
}

function getFrontendOrigin(req: Request) {
  const raw = typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;
  const fallback = process.env.EXPO_WEB_PREVIEW_URL || process.env.EXPO_PACKAGER_PROXY_URL || getPublicUrl(req);
  if (!raw) return fallback;
  try {
    const requested = new URL(raw);
    const fallbackUrl = new URL(fallback);
    const isLocalDevelopment = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(requested.hostname);
    if (requested.origin === fallbackUrl.origin || isLocalDevelopment) return requested.origin;
  } catch {
    return fallback;
  }
  return fallback;
}

function getLoginConfig() {
  const portal = process.env.VITE_OAUTH_PORTAL_URL ?? process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "";
  const appId = process.env.VITE_APP_ID ?? process.env.EXPO_PUBLIC_APP_ID ?? "";
  return { portal, appId };
}

async function getAuthenticatedUserId(req: Request) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user?.id) throw new Error("UNAUTHORIZED");
    return user.id;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

function validatePayload(payload: string, checksum: string) {
  const digest = createHash("sha256").update(payload).digest("hex");
  if (digest !== checksum) throw new Error("CHECKSUM_MISMATCH");
  const parsed = JSON.parse(payload) as { format?: unknown; version?: unknown; state?: unknown };
  if (parsed.format !== "noum-list-backup" || parsed.version !== 1 || !parsed.state || typeof parsed.state !== "object") {
    throw new Error("INVALID_BACKUP");
  }
}

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("SYNC_UNAVAILABLE");
  return createHash("sha256").update(`noum-sync:v1:${secret}`).digest();
}

function encryptPayload(payload: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

function decryptPayload(stored: string) {
  const [version, ivValue, tagValue, dataValue] = stored.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !dataValue) throw new Error("INVALID_BACKUP");
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataValue, "base64url")), decipher.final()]).toString("utf8");
}

function respondError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "SYNC_ERROR";
  if (message === "UNAUTHORIZED") {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }
  if (message === "CHECKSUM_MISMATCH" || message === "INVALID_BACKUP" || message.includes("JSON")) {
    res.status(400).json({ error: "INVALID_BACKUP" });
    return;
  }
  console.error("[Noum Sync]", error);
  res.status(500).json({ error: "SYNC_UNAVAILABLE" });
}

export function registerNoumSyncRoutes(app: Express) {
  app.get("/api/noum-sync/login", (req, res) => {
    const { portal, appId } = getLoginConfig();
    if (!portal || !appId) {
      res.status(503).json({ error: "LOGIN_UNAVAILABLE" });
      return;
    }
    const redirectUri = `${getFrontendOrigin(req)}/api/oauth/callback`;
    const url = new URL("app-auth", portal.endsWith("/") ? portal : `${portal}/`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", Buffer.from(redirectUri, "utf-8").toString("base64"));
    url.searchParams.set("type", "signIn");
    res.redirect(url.toString());
  });

  app.get("/api/noum-sync/status", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({ user: user ? { id: user.id, name: user.name ?? null } : null });
    } catch {
      res.json({ user: null });
    }
  });

  app.get("/api/noum-sync/snapshot", async (req, res) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      const snapshot = await getNoumSyncSnapshot(userId);
      res.json({ snapshot: snapshot ? { payload: decryptPayload(snapshot.payload), checksum: snapshot.checksum, updatedAt: snapshot.updatedAt.toISOString() } : null });
    } catch (error) {
      respondError(res, error);
    }
  });

  app.put("/api/noum-sync/snapshot", async (req, res) => {
    try {
      const userId = await getAuthenticatedUserId(req);
      const input = snapshotInput.parse(req.body);
      validatePayload(input.payload, input.checksum);
      const snapshot = await upsertNoumSyncSnapshot({ userId, version: input.version, payload: encryptPayload(input.payload), checksum: input.checksum });
      res.json({ updatedAt: snapshot?.updatedAt.toISOString() ?? new Date().toISOString() });
    } catch (error) {
      respondError(res, error);
    }
  });
}

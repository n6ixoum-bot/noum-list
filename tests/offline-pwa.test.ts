import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Noum List offline PWA", () => {
  it("registers the production service worker and exposes an installable manifest", () => {
    const entry = projectFile("src/main.tsx");
    const manifest = JSON.parse(projectFile("public/manifest.webmanifest")) as { display: string; icons: unknown[] };

    expect(entry).toContain('navigator.serviceWorker.register("/sw.js"');
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons).toHaveLength(1);
  });

  it("caches the application shell and keeps API calls out of the offline cache", () => {
    const worker = projectFile("public/sw.js");

    expect(worker).toContain('const APP_SHELL = ["/", "/offline.html", "/manifest.webmanifest", "/icon.png", "/favicon.png"]');
    expect(worker).toContain('url.pathname.startsWith("/api/")');
    expect(worker).toContain('caches.match("/offline.html")');
  });
});

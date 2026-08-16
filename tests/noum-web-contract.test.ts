import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("Noum List web contract", () => {
  it("publishes a mobile-installable manifest and accessible metadata", () => {
    const html = read("index.html");
    const manifest = read("public/manifest.webmanifest");
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('name="description"');
    expect(manifest).toContain('"display": "standalone"');
    expect(manifest).toContain('"name": "Noum List"');
  });

  it("keeps the host allowlist scoped to Manus and the published domain", () => {
    const config = read("vite.config.mjs");
    expect(config).toContain('".manus.computer"');
    expect(config).toContain('"learnpath-eqgbt4by.manus.space"');
    expect(config).not.toContain('allowedHosts: true');
  });
});

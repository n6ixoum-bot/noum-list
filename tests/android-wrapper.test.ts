import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (file: string) => readFileSync(resolve(process.cwd(), file), "utf8");

describe("Noum List Android wrapper", () => {
  it("uses the local production bundle and a stable Android application identity", () => {
    const config = projectFile("capacitor.config.ts");
    const manifest = projectFile("android/app/src/main/AndroidManifest.xml");

    expect(config).toContain('appId: "io.noumlist.app"');
    expect(config).toContain('webDir: "dist"');
    expect(manifest).toContain('android:label="@string/app_name"');
    expect(manifest).toContain('android.permission.INTERNET');
    expect(existsSync(resolve(process.cwd(), "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"))).toBe(true);
  });

  it("keeps a repeatable command for copying fresh web assets to Android", () => {
    const packageJson = JSON.parse(projectFile("package.json")) as { scripts: Record<string, string> };

    expect(packageJson.scripts["android:sync"]).toBe("pnpm build && cap sync android");
  });
});

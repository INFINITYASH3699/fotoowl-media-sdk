// Copies docs/*.md → apps/web/public/docs/*.md before build.
// Runs automatically via pnpm's "prebuild" hook.

import { mkdirSync, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const src = resolve(repoRoot, "docs");
const dest = resolve(__dirname, "../public/docs");

mkdirSync(dest, { recursive: true });

const files = ["sdk.md", "components.md"];
files.forEach((f) => {
  const from = resolve(src, f);
  const to = resolve(dest, f);
  if (existsSync(from)) {
    copyFileSync(from, to);
    console.log(`✓ copied ${f}`);
  } else {
    console.warn(`⚠ missing ${from}`);
  }
});
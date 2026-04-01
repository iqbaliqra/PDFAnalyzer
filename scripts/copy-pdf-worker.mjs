import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(
  root,
  "node_modules",
  "pdf-parse",
  "dist",
  "pdf-parse",
  "esm",
  "pdf.worker.mjs",
);
const destDir = join(root, "pdf-worker");
const dest = join(destDir, "pdf.worker.mjs");

if (!existsSync(src)) {
  console.warn(
    "[copy-pdf-worker] Skipping: pdf-parse worker not found at",
    src,
    "(install dependencies first).",
  );
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";
import { extractPageNumber, extractQuestions } from "../utils/regex";

const require = createRequire(import.meta.url);

/** Resolve pdf.js CMap / standard font dirs on disk (avoids missing assets when tracing omits them on Vercel). */
function getPdfJsDiskAssetUrls(): {
  cMapUrl: string;
  standardFontDataUrl: string;
} {
  const pkgRoot = dirname(require.resolve("pdfjs-dist/package.json"));
  const asDirUrl = (dir: string) =>
    `${pathToFileURL(dir).href.replace(/\/?$/, "")}/`;
  return {
    cMapUrl: asDirUrl(join(pkgRoot, "cmaps")),
    standardFontDataUrl: asDirUrl(join(pkgRoot, "standard_fonts")),
  };
}

/**
 * pdf.js loads the worker via `import(workerSrc)` (fake worker on Node). On Vercel the
 * traced bundle may omit deep paths under node_modules; `pdf-worker/` is copied at
 * install/build so the file always exists next to the app root.
 */
function resolvePdfWorkerFileUrl(): string {
  const copied = join(process.cwd(), "pdf-worker", "pdf.worker.mjs");
  if (existsSync(copied)) {
    return pathToFileURL(copied).href;
  }

  try {
    const mainEntry = require.resolve("pdf-parse");
    const fromPackage = join(dirname(mainEntry), "..", "esm", "pdf.worker.mjs");
    if (existsSync(fromPackage)) {
      return pathToFileURL(fromPackage).href;
    }
  } catch {
    /* fall through */
  }

  const fromCwd = join(
    process.cwd(),
    "node_modules",
    "pdf-parse",
    "dist",
    "pdf-parse",
    "esm",
    "pdf.worker.mjs",
  );
  if (existsSync(fromCwd)) {
    return pathToFileURL(fromCwd).href;
  }

  throw new Error(
    "PDF worker file is missing. Run `npm install` (postinstall copies pdf-worker/) or `npm run prebuild`.",
  );
}

let pdfWorkerInitialized = false;

function ensurePdfWorker(): void {
  if (pdfWorkerInitialized) return;
  PDFParse.setWorker(resolvePdfWorkerFileUrl());
  pdfWorkerInitialized = true;
}

export interface PageSummary {
  printedPage: number | null;
  range: string | null;
  questionStarts: number[];
}

export interface AnalyzedPDF {
  fileName: string;
  totalPages: number;
  printedPageSequence: (number | null)[];
  pageSummary: PageSummary[];
}

export const analyzePDF = async (buffer: Buffer, fileName: string): Promise<AnalyzedPDF> => {
  ensurePdfWorker();
  const assets = getPdfJsDiskAssetUrls();
  const parser = new PDFParse({
    data: buffer,
    useSystemFonts: true,
    useWorkerFetch: false,
    cMapPacked: true,
    cMapUrl: assets.cMapUrl,
    standardFontDataUrl: assets.standardFontDataUrl,
  });
  let textResult;
  try {
    textResult = await parser.getText();
  } finally {
    await parser.destroy();
  }

  const pages = textResult.pages.map((p) => p.text);
  const printedPageSequence: (number | null)[] = [];
  const pageSummary: PageSummary[] = [];

  pages.forEach((pageText) => {
    const printedPage = extractPageNumber(pageText);
    const questions = extractQuestions(pageText);

    printedPageSequence.push(printedPage);

    const range =
      questions.length > 0
        ? `${Math.min(...questions)}-${Math.max(...questions)}`
        : null;

    pageSummary.push({
      printedPage,
      range,
      questionStarts: questions,
    });
  });

  return {
    fileName,
    totalPages: pages.length,
    printedPageSequence,
    pageSummary,
  };
};
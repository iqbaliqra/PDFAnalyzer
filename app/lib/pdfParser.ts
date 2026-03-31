import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFParse } from "pdf-parse";
import { extractPageNumber, extractQuestions } from "../utils/regex";

// pdf.js fake worker imports this path; Next/Turbopack bundles it to a missing chunk unless we set an absolute file URL.
const workerSrc = pathToFileURL(
  join(process.cwd(), "node_modules", "pdf-parse", "dist", "pdf-parse", "esm", "pdf.worker.mjs")
).href;
PDFParse.setWorker(workerSrc);

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
  const parser = new PDFParse({ data: buffer });
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
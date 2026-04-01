import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthUserId } from "../../lib/auth";
import { connectDB } from "../../lib/db";
import { parseMultipartUpload, type ParsedUploadPart } from "../../lib/parseMultipartUpload";
import { analyzePDF, AnalyzedPDF } from "../../lib/pdfParser";
import Result from "../../models/Result";

export const runtime = "nodejs";

/** Vercel Pro/Enterprise: raise if PDFs are large or slow to parse (Hobby max is 10s). */
export const maxDuration = 60;

function isPdfPart(part: ParsedUploadPart): boolean {
  if (part.mimeType === "application/pdf") return true;
  return part.filename.toLowerCase().endsWith(".pdf");
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Sign in to analyze PDFs." },
        { status: 401 },
      );
    }

    if (!process.env.MONGO_URI) {
      return NextResponse.json(
        { error: "Server misconfiguration: database is not configured." },
        { status: 500 },
      );
    }

    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const parts = await parseMultipartUpload(req, { fileFieldName: "files" });
    if (parts.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded. Use field name \"files\" (multipart/form-data)." },
        { status: 400 },
      );
    }

    const results: AnalyzedPDF[] = [];

    for (const part of parts) {
      if (!isPdfPart(part)) {
        return NextResponse.json(
          { error: `Not a PDF: ${part.filename}` },
          { status: 400 },
        );
      }

      if (part.buffer.length === 0) {
        return NextResponse.json(
          { error: `Empty file: ${part.filename}` },
          { status: 400 },
        );
      }

      const analyzed = await analyzePDF(part.buffer, part.filename);

      await Result.create({
        userId: userObjectId,
        fileName: analyzed.fileName,
        totalPages: analyzed.totalPages,
        printedPageSequence: analyzed.printedPageSequence,
        pageSummary: analyzed.pageSummary,
      });

      results.push(analyzed);
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[analyze-pdf]", err);
    const message =
      err instanceof Error ? err.message : "PDF analysis failed unexpectedly.";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? message
            : "PDF analysis failed. If this persists, the file may be too large for the server or the deployment may be missing PDF worker assets.",
      },
      { status: 500 },
    );
  }
}
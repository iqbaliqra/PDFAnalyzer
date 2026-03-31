import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../lib/db";
import { getAuthUserId } from "../../lib/auth";
import Result from "../../models/Result";
import { analyzePDF, AnalyzedPDF } from "../../lib/pdfParser";

function isPdfUpload(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.type === "" && file.name.toLowerCase().endsWith(".pdf");
}

export async function POST(req: NextRequest) {
  const userId = getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized. Sign in to analyze PDFs." }, { status: 401 });
  }

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  const results: AnalyzedPDF[] = [];

  for (const file of files) {
    if (!isPdfUpload(file)) {
      return NextResponse.json(
        { error: `Not a PDF: ${file.name}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const analyzed = await analyzePDF(buffer, file.name);

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
}
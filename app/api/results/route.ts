import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../lib/db";
import { getAuthUserId } from "../../lib/auth";
import Result from "../../models/Result";
import type { AnalyzedPDF } from "../../lib/pdfParser";

export async function GET(req: NextRequest) {
  const userId = getAuthUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const oid = new mongoose.Types.ObjectId(userId);
    const docs = await Result.find({ userId: oid }).sort({ createdAt: -1 }).lean();

    const results: AnalyzedPDF[] = docs.map((d) => ({
      fileName: d.fileName,
      totalPages: d.totalPages,
      printedPageSequence: d.printedPageSequence as (number | null)[],
      pageSummary: d.pageSummary,
    }));

    return NextResponse.json({ results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load results." }, { status: 500 });
  }
}

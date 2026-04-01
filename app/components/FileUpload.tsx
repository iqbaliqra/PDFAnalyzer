"use client";

import { useState, useRef, useEffect, ChangeEvent, useMemo } from "react";
import toast from "react-hot-toast";
interface FileUploadProps {
  authToken: string;
  onAnalysisComplete: () => void;
  onUnauthorized?: () => void;
}

function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  // Some browsers omit MIME; rely on extension as a fallback for real PDFs.
  return file.type === "" && file.name.toLowerCase().endsWith(".pdf");
}

export default function FileUpload({
  authToken,
  onAnalysisComplete,
  onUnauthorized,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successFileCount, setSuccessFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!successOpen) return;
    const t = window.setTimeout(() => setSuccessOpen(false), 5000);
    return () => window.clearTimeout(t);
  }, [successOpen]);

  const nonPdfFiles = useMemo(
    () => files.filter((f) => !isPdfFile(f)),
    [files]
  );
  const hasInvalidFiles = nonPdfFiles.length > 0;

  const validationMessage = useMemo(() => {
    if (!hasInvalidFiles) return null;
    if (nonPdfFiles.length === 1) {
      const name = nonPdfFiles[0].name;
      return `${name} is not a PDF. Word (.docx) and other formats are not supported—use PDF only.`;
    }
    return `${nonPdfFiles.length} of the selected files are not PDFs. Remove them or convert to PDF to continue.`;
  }, [hasInvalidFiles, nonPdfFiles]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (hasInvalidFiles || files.length === 0) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    setPending(true);
    try {
      const res = await fetch("/api/analyze-pdf", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const text = await res.text();
      let data: { error?: string; results?: unknown } | null = null;
      try {
        data = text ? (JSON.parse(text) as { error?: string; results?: unknown }) : null;
      } catch {
        data = null;
      }

      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }

      if (!data) {
        toast.error(
          "The server returned a non-JSON response (often a crash or size limit). Try a smaller PDF or check Vercel logs.",
        );
        return;
      }

      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : `Request failed (${res.status}).`,
        );
        return;
      }

      const analyzedCount = files.length;
      onAnalysisComplete();
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessFileCount(analyzedCount);
      setSuccessOpen(true);
    } finally {
      setPending(false);
    }
  };

  const fileLabel =
    files.length === 0
      ? "No files selected"
      : files.length === 1
        ? files[0].name
        : `${files.length} file${files.length === 1 ? "" : "s"} selected`;

  const analyzeDisabled =
    files.length === 0 || pending || hasInvalidFiles;

  return (
    <div className="rounded-sm border border-border-classic bg-paper p-6 shadow-[0_1px_0_0_rgba(28,25,23,0.04)] md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        Step 1
      </p>
      <h3 className="font-serif-classic mt-2 text-2xl text-foreground">Upload PDFs</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Select one or more files. Only PDF format is accepted.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <label
          className={`relative flex min-h-[48px] flex-1 cursor-pointer items-center justify-center rounded-sm border bg-background px-4 py-3 text-center text-sm text-foreground transition-colors hover:bg-paper ${
            hasInvalidFiles
              ? "border-amber-800/50"
              : "border-border-classic hover:border-accent/40"
          }`}
        >
          <span className="truncate">{fileLabel}</span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleChange}
          />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={analyzeDisabled}
          className="min-h-[48px] shrink-0 rounded-sm border border-accent bg-accent px-8 font-mono text-xs uppercase tracking-[0.15em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:border-border-classic disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
        >
          {pending ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {validationMessage && (
        <p
          role="alert"
          className="mt-4 border-l-2 border-amber-800/70 bg-amber-50/80 px-3 py-2 text-sm leading-snug text-amber-950"
        >
          {validationMessage}
        </p>
      )}

      {successOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="analyze-success-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/55"
            aria-label="Close dialog"
            onClick={() => setSuccessOpen(false)}
          />
          <div
            className="relative w-full max-w-md rounded-sm border border-border-classic bg-paper p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
              Complete
            </p>
            <h2
              id="analyze-success-title"
              className="font-serif-classic mt-2 text-2xl text-foreground"
            >
              Analyzed successfully
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {successFileCount === 1
                ? "Your file was analyzed successfully. Results appear below."
                : `Your ${successFileCount} files were analyzed successfully. Results appear below.`}
            </p>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="mt-6 w-full rounded-sm border border-accent bg-accent py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-colors hover:bg-accent-hover"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
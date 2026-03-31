"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import ResultCard from "../components/ResultCard";
import { useAuth } from "../contexts/AuthContext";
import type { AnalyzedPDF } from "../lib/pdfParser";

export default function DashboardPage() {
  const { token, hydrated, logout } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<AnalyzedPDF[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  const refreshResults = useCallback(
    async (t: string) => {
      setResultsLoading(true);
      try {
        const r = await fetch("/api/results", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (r.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        const d = await r.json();
        setResults(Array.isArray(d.results) ? d.results : []);
      } finally {
        setResultsLoading(false);
      }
    },
    [logout, router]
  );

  useEffect(() => {
    if (!hydrated || !token) return;
    void refreshResults(token);
  }, [token, hydrated, refreshResults]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <FileUpload
        authToken={token}
        onAnalysisComplete={() => refreshResults(token)}
        onUnauthorized={() => {
          logout();
          router.replace("/login");
        }}
      />

      <section className="mt-14">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border-classic pb-3">
          <h2 className="font-serif-classic text-xl font-normal text-foreground">
            Your results
          </h2>
          {results.length > 0 && (
            <span className="font-mono text-xs text-ink-muted">
              {results.length} file{results.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {resultsLoading ? (
          <p className="text-center text-sm text-ink-muted">Loading your analyses…</p>
        ) : results.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border-classic bg-paper/50 px-8 py-14 text-center">
            <p className="font-serif-classic text-lg text-ink-muted">No analyses yet.</p>
            <p className="mt-2 text-sm text-ink-muted/90">
              Upload PDFs above to analyze. Only you can see analyses saved to your account.
            </p>
          </div>
        ) : (
          <ul className="space-y-8">
            {results.map((res, i) => (
              <li key={`${res.fileName}-${i}`}>
                <ResultCard result={res} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import ResultCard from "../components/ResultCard";
import { useAuth } from "../contexts/AuthContext";
import type { AnalyzedPDF } from "../lib/pdfParser";

export default function DashboardPage() {
  const { token, email, name, hydrated, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border-classic bg-paper/80 shadow-[inset_0_-1px_0_0_rgba(28,25,23,0.06)]">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-muted">
            Document tools
          </p>
          <h1 className="font-serif-classic mt-3 text-4xl font-normal tracking-tight text-foreground md:text-[2.75rem]">
            PDF Question Mapper
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Upload exam PDFs to summarize total pages, printed page numbers, and per-page
            question ranges—without re-sorting or filling gaps.
          </p>
          {email && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-ink-muted">
              <span>
                Signed in as{" "}
                <span className="text-foreground">
                  {name ? `${name} (${email})` : email}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-sm border border-border-classic bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:border-accent/40 hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
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
              <p className="font-serif-classic text-lg text-ink-muted">
                No analyses yet.
              </p>
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
      </main>

      <footer className="mt-auto border-t border-border-classic py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted/80">
          PDF Question Mapper
        </p>
      </footer>
    </div>
  );
}

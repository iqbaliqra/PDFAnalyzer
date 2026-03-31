import Link from "next/link";
import { DashboardAuthBar } from "./DashboardAuthBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border-classic bg-paper/80 shadow-[inset_0_-1px_0_0_rgba(28,25,23,0.06)]">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-muted">
            Document tools
          </p>
          <Link href="/" className="inline-block">
            <h1 className="font-serif-classic mt-3 text-4xl font-normal tracking-tight text-foreground md:text-[2.75rem]">
              PDF Question Mapper
            </h1>
          </Link>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Upload exam PDFs to summarize total pages, printed page numbers, and per-page
            question ranges—without re-sorting or filling gaps.
          </p>
          <DashboardAuthBar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>

      <footer className="mt-auto border-t border-border-classic py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted/80">
          PDF Question Mapper
        </p>
      </footer>
    </div>
  );
}

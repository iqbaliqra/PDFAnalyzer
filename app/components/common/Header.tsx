import Link from 'next/link';

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
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
          Upload exam PDFs to summarize total pages, printed page numbers, and
          per-page question ranges—without re-sorting or filling gaps.
        </p>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
}

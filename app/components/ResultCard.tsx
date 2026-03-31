import { AnalyzedPDF } from "../lib/pdfParser";

interface ResultCardProps {
  result: AnalyzedPDF;
}

function pageLabel(printed: number | null): string {
  if (printed === null) return "page ?";
  return `page ${printed}`;
}

export default function ResultCard({ result }: ResultCardProps) {
  const printed = result.printedPageSequence
    .map((n) => (n === null ? "—" : String(n)))
    .join(", ");

  return (
    <article className="overflow-hidden rounded-sm border border-border-classic bg-paper shadow-[0_1px_0_0_rgba(28,25,23,0.06)]">
      <div className="border-b border-border-classic bg-background/60 px-5 py-4">
        <h3 className="font-serif-classic text-lg font-normal leading-snug text-foreground">
          {result.fileName}
        </h3>

        <h4 className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
          Summary
        </h4>
        <ul className="mt-2 space-y-1.5 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-ink-muted" aria-hidden>
              ●
            </span>
            <span>
              total pages: <span className="tabular-nums">{result.totalPages}</span>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-ink-muted" aria-hidden>
              ●
            </span>
            <span>
              printed pages:{" "}
              <span className="font-mono text-[13px] tabular-nums text-foreground">{printed}</span>
            </span>
          </li>
        </ul>
      </div>

      <div className="px-5 py-4">
        <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
          Page details
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          {result.pageSummary.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-ink-muted" aria-hidden>
                ●
              </span>
              <span>
                {pageLabel(p.printedPage)}:{" "}
                {p.range ? (
                  <>
                    question <span className="tabular-nums">{p.range}</span>
                  </>
                ) : (
                  <span className="text-ink-muted">No question at all</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

import Link from "next/link";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-full bg-background">
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
        </div>
      </header>

      <main className="mx-auto max-w-md px-6 py-12">
        <LoginForm />
      </main>

      <footer className="mt-auto border-t border-border-classic py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted/80">
          PDF Question Mapper
        </p>
      </footer>
    </div>
  );
}

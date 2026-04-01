"use client";

export function AuthFieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted"
    >
      <span>{children}</span>
      {required && (
        <span className="text-red-700" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

export function AuthFieldError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="mt-1.5 min-h-[1.25rem] border-l-2 border-red-700/80 bg-red-50/80 py-1 pl-2.5 pr-2 text-xs font-medium leading-snug text-red-900"
    >
      {message}
    </p>
  );
}

export function authInputFieldClassNames(hasError: boolean): string {
  return [
    "w-full rounded-sm border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-[border-color,box-shadow]",
    "placeholder:text-ink-muted/50",
    "focus:ring-2 focus:ring-offset-0",
    hasError
      ? "border-red-700/70 focus:border-red-700 focus:ring-red-500/25"
      : "border-border-classic focus:border-accent focus:ring-accent/25",
  ].join(" ");
}

export function authInputClassNames(hasError: boolean): string {
  return `mt-1.5 ${authInputFieldClassNames(hasError)}`;
}

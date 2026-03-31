"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { validateAuthEmail, validateAuthPassword } from "../utils/regex";
import {
  AuthFieldError,
  AuthFieldLabel,
  authInputClassNames,
} from "./auth/AuthFormPrimitives";

function LoginFormInner() {
  const { login, token, hydrated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const emailErr = useMemo(() => validateAuthEmail(email), [email]);
  const passwordErr = useMemo(() => validateAuthPassword(password, false), [password]);
  const formValid = emailErr === null && passwordErr === null;

  const showEmailError = (touched.email || submitAttempted) && emailErr !== null;
  const showPasswordError = (touched.password || submitAttempted) && passwordErr !== null;

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard");
    }
  }, [hydrated, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(null);
    if (!formValid) return;

    setPending(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-sm border border-border-classic bg-paper p-6 shadow-[0_1px_0_0_rgba(28,25,23,0.04)] md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-muted">
        Account
      </p>
      <h2 className="font-serif-classic mt-2 text-2xl text-foreground">Sign in</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Sign in to upload PDFs and view your analyses.
      </p>

      {registered && (
        <p
          role="status"
          className="mt-4 rounded-sm border border-emerald-800/30 bg-emerald-50/90 px-3 py-2.5 text-sm text-emerald-950"
        >
          Registration successful. Please sign in with your email and password.
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <AuthFieldLabel htmlFor="login-email" required>
            Email
          </AuthFieldLabel>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? "login-email-error" : "login-email-hint"}
            className={authInputClassNames(showEmailError)}
          />
          <p id="login-email-hint" className="sr-only">
            Enter the email address for your account.
          </p>
          {showEmailError && emailErr && (
            <AuthFieldError id="login-email-error" message={emailErr} />
          )}
        </div>

        <div>
          <AuthFieldLabel htmlFor="login-password" required>
            Password
          </AuthFieldLabel>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={showPasswordError}
            aria-describedby={showPasswordError ? "login-password-error" : "login-password-hint"}
            className={authInputClassNames(showPasswordError)}
          />
          <p id="login-password-hint" className="sr-only">
            Enter your account password.
          </p>
          {showPasswordError && passwordErr && (
            <AuthFieldError id="login-password-error" message={passwordErr} />
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-sm border-l-2 border-red-800 bg-red-50 px-3 py-2.5 text-sm text-red-950"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!formValid || pending}
          title={!formValid ? "Fill in all fields correctly to continue" : undefined}
          className="w-full rounded-sm border border-accent bg-accent py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-300 disabled:text-stone-600 disabled:shadow-none"
        >
          {pending ? "Please wait…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-ink-muted">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-ink-muted">Loading…</p>}>
      <LoginFormInner />
    </Suspense>
  );
}

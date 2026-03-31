"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  validateAuthEmail,
  validateAuthName,
  validateAuthPassword,
} from "../utils/regex";
import {
  AuthFieldError,
  AuthFieldLabel,
  authInputClassNames,
} from "./auth/AuthFormPrimitives";

export default function RegisterForm() {
  const { register, token, hydrated } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nameErr = useMemo(() => validateAuthName(name), [name]);
  const emailErr = useMemo(() => validateAuthEmail(email), [email]);
  const passwordErr = useMemo(() => validateAuthPassword(password, true), [password]);
  const formValid = nameErr === null && emailErr === null && passwordErr === null;

  const showNameError = (touched.name || submitAttempted) && nameErr !== null;
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
      await register(name.trim(), email.trim(), password);
      router.push("/login?registered=1");
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
      <h2 className="font-serif-classic mt-2 text-2xl text-foreground">Create account</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        After registering you will be asked to sign in. Your analyses stay private to your account.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <AuthFieldLabel htmlFor="reg-name" required>
            Name
          </AuthFieldLabel>
          <input
            id="reg-name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            aria-invalid={showNameError}
            aria-describedby={
              showNameError ? "reg-name-error" : "reg-name-help"
            }
            className={authInputClassNames(showNameError)}
          />
          {showNameError && nameErr ? (
            <AuthFieldError id="reg-name-error" message={nameErr} />
          ) : (
            <p id="reg-name-help" className="mt-1.5 text-xs text-ink-muted">
              2–120 characters. Letters and common name punctuation only.
            </p>
          )}
        </div>

        <div>
          <AuthFieldLabel htmlFor="reg-email" required>
            Email
          </AuthFieldLabel>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? "reg-email-error" : "reg-email-help"}
            className={authInputClassNames(showEmailError)}
          />
          {!showEmailError && (
            <p id="reg-email-help" className="mt-1.5 text-xs text-ink-muted">
              We will never share your email.
            </p>
          )}
          {showEmailError && emailErr && (
            <AuthFieldError id="reg-email-error" message={emailErr} />
          )}
        </div>

        <div>
          <AuthFieldLabel htmlFor="reg-password" required>
            Password
          </AuthFieldLabel>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={showPasswordError}
            aria-describedby={
              showPasswordError ? "reg-password-error" : "reg-password-help"
            }
            className={authInputClassNames(showPasswordError)}
          />
          {showPasswordError && passwordErr ? (
            <AuthFieldError id="reg-password-error" message={passwordErr} />
          ) : (
            <p id="reg-password-help" className="mt-1.5 text-xs text-ink-muted">
              At least 8 characters.
            </p>
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
          {pending ? "Please wait…" : "Create account"}
        </button>

        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent-hover"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

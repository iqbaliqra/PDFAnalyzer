"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export function DashboardAuthBar() {
  const { token, email, name, hydrated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!hydrated || !token) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-ink-muted">
      <span>
        Signed in as{" "}
        <span className="text-foreground">
          {email
            ? name
              ? `${name} (${email})`
              : email
            : "your account"}
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
  );
}

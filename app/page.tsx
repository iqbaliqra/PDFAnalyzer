"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hydrated, token, router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background">
      <p className="text-sm text-ink-muted">Loading…</p>
    </div>
  );
}

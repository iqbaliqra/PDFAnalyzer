'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(token ? '/dashboard' : '/login');
  }, [hydrated, token, router]);

  return (
    <div className="flex min-h-full flex-col bg-background animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-border-classic bg-paper/80">
        <div className="mx-auto max-w-3xl px-6 py-10 text-center">
          <div className="mx-auto h-3 w-32 rounded bg-ink-muted/20" />
          <div className="mx-auto mt-4 h-8 w-64 rounded bg-ink-muted/20" />
          <div className="mx-auto mt-4 h-4 w-80 rounded bg-ink-muted/20" />
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="space-y-4">
          <div className="h-10 w-full rounded bg-ink-muted/20" />
          <div className="h-10 w-full rounded bg-ink-muted/20" />
          <div className="h-10 w-2/3 rounded bg-ink-muted/20" />
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-auto border-t border-border-classic py-8 text-center">
        <div className="mx-auto h-3 w-40 rounded bg-ink-muted/20" />
      </footer>
    </div>
  );
}

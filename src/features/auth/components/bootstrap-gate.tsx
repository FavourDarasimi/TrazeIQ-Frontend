"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/providers/auth-provider";

export function BootstrapGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
          starting session
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
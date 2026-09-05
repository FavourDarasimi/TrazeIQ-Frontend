"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shared crash UI for Next.js error boundaries (`error.tsx` files).
 * Monochrome + a single accent retry action per Design.md — the boundary
 * catches render failures in its segment so one broken view never takes
 * down the whole dashboard.
 */
export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      icon={Alert02Icon}
      title={title}
      body={body}
      action={
        <div className="flex items-center gap-2 self-center">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to dashboard
          </a>
        </div>
      }
    />
  );
}

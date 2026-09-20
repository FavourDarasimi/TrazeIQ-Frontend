"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

import { allNavItems } from "./docs-nav-data";

export function DocsPrevNext({
  activeId,
  onNavigate,
}: {
  activeId: string;
  onNavigate: (id: string) => void;
}) {
  const idx = allNavItems.findIndex((it) => it.id === activeId);
  const prev = idx > 0 ? allNavItems[idx - 1] : null;
  const next =
    idx >= 0 && idx < allNavItems.length - 1 ? allNavItems[idx + 1] : null;

  const pill =
    "inline-flex min-w-0 items-center gap-2.5 rounded-full border border-line bg-bg-panel px-4 py-2.5 text-left transition-colors hover:border-line-soft focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <nav
      aria-label="Docs pages"
      className="flex items-center justify-between gap-3 pt-2"
    >
      <span className="min-w-0">
        {prev ? (
          <button type="button" onClick={() => onNavigate(prev.id)} className={pill}>
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.8}
              className="shrink-0 text-muted"
            />
            <span className="flex min-w-0 flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Prev
              </span>
              <span className="truncate text-sm font-medium text-ink">
                {prev.label}
              </span>
            </span>
          </button>
        ) : null}
      </span>
      <span className="min-w-0 text-right">
        {next ? (
          <button type="button" onClick={() => onNavigate(next.id)} className={pill}>
            <span className="flex min-w-0 flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                Next
              </span>
              <span className="truncate text-sm font-medium text-ink">
                {next.label}
              </span>
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.8}
              className="shrink-0 text-muted"
            />
          </button>
        ) : null}
      </span>
    </nav>
  );
}

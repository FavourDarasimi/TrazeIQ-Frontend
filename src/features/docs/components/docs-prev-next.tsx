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
    "inline-flex min-w-0 items-center gap-2 rounded-full border border-line bg-bg-panel px-4 py-2 text-sm text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent";

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
            />
            <span className="hidden sm:inline">Prev,</span>
            <span className="truncate text-ink">{prev.label}</span>
          </button>
        ) : null}
      </span>
      <span className="min-w-0 text-right">
        {next ? (
          <button type="button" onClick={() => onNavigate(next.id)} className={pill}>
            <span className="truncate text-ink">{next.label}</span>
            <span className="hidden sm:inline">Next</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={15}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        ) : null}
      </span>
    </nav>
  );
}

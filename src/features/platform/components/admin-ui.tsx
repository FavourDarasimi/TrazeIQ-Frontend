"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import type { PlatformPageMeta } from "@/types";

/* Shared primitives for the platform admin console.
 * Dark ops-console DNA: black page, #111 cards, hairline #1F1F1F borders,
 * Inter type, tabular numerals. Mirrors the screenshot's layout with a
 * dark palette — same calm spacing, just on --color-bg.
 */

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function AdminLabel({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-muted">{children}</p>;
}

export function AdminStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <AdminCard className="p-5">
      <AdminLabel>{label}</AdminLabel>
      <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
      {sub ? <p className="mt-2 text-[13px] text-muted">{sub}</p> : null}
    </AdminCard>
  );
}

const DOT_COLORS = {
  green: "bg-ok",
  red: "bg-sev-critical",
  orange: "bg-sev-high",
  amber: "bg-sev-warning",
  blue: "bg-sev-low",
  indigo: "bg-accent",
  gray: "bg-muted",
} as const;

export type AdminDotColor = keyof typeof DOT_COLORS;

export function AdminDot({ color }: { color: AdminDotColor }) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[color]}`}
    />
  );
}

const PILL_STYLES = {
  neutral: "border border-line bg-white/[0.04] text-muted",
  green: "border border-ok/20 bg-ok/10 text-ok",
  red: "border border-sev-critical/20 bg-sev-critical/10 text-sev-critical",
  amber: "border border-sev-warning/20 bg-sev-warning/10 text-sev-warning",
  blue: "border border-sev-low/20 bg-sev-low/10 text-sev-low",
  indigo: "border border-accent/20 bg-accent/10 text-accent",
} as const;

export type AdminPillTone = keyof typeof PILL_STYLES;

export function AdminPill({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: AdminPillTone;
  dot?: AdminDotColor;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${PILL_STYLES[tone]}`}
    >
      {dot ? <AdminDot color={dot} /> : null}
      {children}
    </span>
  );
}

export function AdminLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-soft border-t-accent" />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export function AdminEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <AdminCard>
      <div className="flex flex-col items-start gap-1 p-5">
        <h3 className="text-sm font-semibold text-ink">Something went wrong</h3>
        <p className="text-[13px] text-muted">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-ink px-3.5 py-1.5 text-sm font-medium text-bg transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        ) : null}
      </div>
    </AdminCard>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{label}</span>
      <HugeiconsIcon
        icon={Search01Icon}
        size={15}
        color="currentColor"
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-bg pl-9 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:bg-white/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={13} color="currentColor" strokeWidth={1.5} />
        </button>
      ) : null}
    </label>
  );
}

export function AdminTableCard({
  title,
  count,
  search,
  head,
  children,
  minWidth = 720,
}: {
  title: string;
  count: number | null;
  search: ReactNode;
  head: ReactNode;
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <AdminCard className="overflow-hidden">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-ink">
          {title}
          {count !== null ? (
            <span className="ml-2 font-normal text-muted tabular-nums">{count}</span>
          ) : null}
        </h2>
        {search}
      </div>
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line text-xs font-medium text-muted">
              {head}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </AdminCard>
  );
}

export function AdminTh({
  children,
  className = "",
  right,
}: {
  children: ReactNode;
  className?: string;
  right?: boolean;
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-2.5 font-medium ${right ? "text-right" : ""} ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminPagination({
  pagination,
  onPage,
}: {
  pagination: PlatformPageMeta;
  onPage: (page: number) => void;
}) {
  if (pagination.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-line px-5 py-3">
      <p className="text-[13px] text-muted tabular-nums">
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!pagination.has_previous}
          onClick={() => onPage(pagination.page - 1)}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-line-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          disabled={!pagination.has_next}
          onClick={() => onPage(pagination.page + 1)}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-line-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={15} color="currentColor" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

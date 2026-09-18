"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getPlatformOverview } from "@/services/platform";
import type { IncidentSeverity, PlatformOverview } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatRelativeTime } from "@/utils/format";

import {
  AdminCard,
  AdminDot,
  AdminError,
  AdminLabel,
  AdminLoading,
  AdminPill,
  AdminStat,
} from "@/features/platform/components/admin-ui";

const SEVERITY_ORDER: IncidentSeverity[] = ["critical", "high", "medium", "low"];

const SEV_DOT = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "blue",
} as const;

export function AdminOverview() {
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPlatformOverview(controller.signal)
      .then(({ overview }) => {
        setOverview(overview);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load the platform overview.");
      });
    return () => controller.abort();
  }, []);

  if (error) return <AdminError message={error} onRetry={() => window.location.reload()} />;
  if (!overview) return <AdminLoading label="Loading platform overview…" />;

  const sev = overview.open_incidents_by_severity ?? {};
  const maxTop = Math.max(1, ...overview.top_projects.map((p) => p.events_24h));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Platform overview</h1>
        <p className="mt-1 text-sm text-muted">Fleet totals and 24-hour pulse. Read-only.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AdminStat label="Users" value={String(overview.users)} sub="Total accounts" />
        <AdminStat label="Organizations" value={String(overview.organizations)} sub="Active tenants" />
        <AdminStat label="Projects" value={String(overview.projects)} sub="Monitored services" />
        <AdminStat label="Events · 24h" value={String(overview.events_24h)} sub="Ingested in window" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between gap-2">
            <AdminLabel>Open incidents</AdminLabel>
            <AdminPill tone={overview.open_incidents > 0 ? "red" : "green"}>
              {overview.open_incidents} open
            </AdminPill>
          </div>
          <p className="mt-2 text-[28px] font-semibold leading-none text-ink tabular-nums">
            {overview.open_incidents}
          </p>
          <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/5">
            {SEVERITY_ORDER.map((level) =>
              (sev[level] ?? 0) > 0 ? (
                <div
                  key={level}
                  style={{ width: `${(sev[level] / Math.max(1, overview.open_incidents)) * 100}%` }}
                  className={
                    level === "critical"
                      ? "bg-sev-critical"
                      : level === "high"
                        ? "bg-sev-high"
                        : level === "medium"
                          ? "bg-sev-warning"
                          : "bg-sev-low"
                  }
                />
              ) : null,
            )}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {SEVERITY_ORDER.map((level) => (
              <li key={level} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 capitalize text-muted">
                  <AdminDot color={SEV_DOT[level] as never} />
                  {level}
                </span>
                <span className="tabular-nums text-muted">{sev[level] ?? 0}</span>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard className="p-5">
          <AdminLabel>Alert dispatches · 24h</AdminLabel>
          <p className="mt-2 text-[28px] font-semibold leading-none text-ink tabular-nums">
            {overview.alerts_24h}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Deliveries fired across all channels in the last 24 hours. Per-status breakdown lives under Health.
          </p>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-ink">Top projects · 24h</h2>
          <p className="mt-0.5 text-[13px] text-muted">Ranked by ingested event volume.</p>
          {overview.top_projects.length === 0 ? (
            <div className="mt-6 flex justify-center">
              <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-muted">
                No data available
              </span>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-4">
              {overview.top_projects.map((project, i) => (
                <li key={project.id} className="flex items-center gap-3">
                  <span className="w-6 shrink-0 text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                      <span className="shrink-0 text-xs text-muted tabular-nums">{project.events_24h}</span>
                    </div>
                    <p className="truncate text-xs text-muted">{project.organization}</p>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(4, (project.events_24h / maxTop) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {project.open_incidents > 0 ? (
                    <AdminPill tone="red" dot="red">
                      {project.open_incidents} open
                    </AdminPill>
                  ) : (
                    <AdminPill tone="green" dot="green">
                      clear
                    </AdminPill>
                  )}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-ink">Recent privileged actions</h2>
          <p className="mt-0.5 text-[13px] text-muted">Staff-level operations, newest first.</p>
          {overview.recent_audit.length === 0 ? (
            <div className="mt-6 flex justify-center">
              <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-muted">
                No data available
              </span>
            </div>
          ) : (
            <ol className="mt-4 flex flex-col divide-y divide-line border-y border-line">
              {overview.recent_audit.map((entry) => (
                <li key={entry.id} className="flex gap-3 py-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      <span className="font-medium text-accent">{entry.action}</span>
                      <span className="text-muted"> · </span>
                      <span className="text-muted">{entry.target}</span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {entry.actor_email} · {entry.organization} · {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

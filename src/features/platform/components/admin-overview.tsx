"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api";
import { getPlatformOverview } from "@/services/platform";
import type { IncidentSeverity, PlatformOverview } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatRelativeTime } from "@/utils/format";

const SEVERITY_STYLES: Record<IncidentSeverity, string> = {
  critical: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
  high: "border-sev-high/30 bg-sev-high/10 text-sev-high",
  medium: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  low: "border-sev-low/30 bg-sev-low/10 text-sev-low",
};

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <GlassCard className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </GlassCard>
  );
}

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

  if (error) {
    return (
      <EmptyState
        icon={Shield01Icon}
        title="Overview unavailable"
        body={error}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!overview) return <Spinner label="Loading platform overview…" />;

  const ai = overview.ai_24h ?? {};
  const sev = overview.open_incidents_by_severity ?? {};

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Users" value={String(overview.users)} />
        <MetricCard label="Organizations" value={String(overview.organizations)} />
        <MetricCard label="Projects" value={String(overview.projects)} />
        <MetricCard label="Events · 24h" value={String(overview.events_24h)} />
        <MetricCard
          label="Open incidents"
          value={String(overview.open_incidents)}
          hint={`critical ${sev.critical ?? 0} · high ${sev.high ?? 0} · medium ${sev.medium ?? 0} · low ${sev.low ?? 0}`}
        />
        <MetricCard
          label="AI analyses · 24h"
          value={String((ai.ready ?? 0) + (ai.pending ?? 0) + (ai.failed ?? 0))}
          hint={`ready ${ai.ready ?? 0} · pending ${ai.pending ?? 0} · failed ${ai.failed ?? 0}`}
        />
        <MetricCard label="Alert dispatches · 24h" value={String(overview.alerts_24h)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            Top projects · 24h volume
          </h3>
          {overview.top_projects.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No events in the last 24 hours.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-line">
              {overview.top_projects.map((project) => (
                <li key={project.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                    <p className="truncate font-mono text-[11px] text-muted">{project.organization}</p>
                  </div>
                  <span className="font-mono text-xs text-muted">{project.events_24h} events</span>
                  {project.open_incidents > 0 ? (
                    <span className="rounded-full border border-sev-critical/30 bg-sev-critical/10 px-2 py-0.5 font-mono text-[11px] text-sev-critical">
                      {project.open_incidents} open
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            Recent privileged actions
          </h3>
          {overview.recent_audit.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No audited actions yet.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-line">
              {overview.recent_audit.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 py-2.5">
                  <HugeiconsIcon icon={Shield01Icon} size={16} color="currentColor" strokeWidth={1.5} className="mt-0.5 shrink-0 text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      <span className="font-mono text-[12px] text-accent">{entry.action}</span>
                      <span className="text-muted"> · {entry.target}</span>
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted">
                      {entry.actor_email} · {entry.organization} · {formatRelativeTime(entry.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(SEVERITY_STYLES) as IncidentSeverity[]).map((level) => (
          <span
            key={level}
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${SEVERITY_STYLES[level]}`}
          >
            {level}: {sev[level] ?? 0} open
          </span>
        ))}
      </div>
    </div>
  );
}

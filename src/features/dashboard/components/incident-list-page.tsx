"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlashIcon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { SeverityBadge, StatusBadge } from "@/components/ui/incident-badges";
import { incidentDetailUrl } from "@/constants";
import { useProjectContext } from "@/features/dashboard/components/project-context";
import { listIncidents } from "@/services/incidents";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatRelativeTime } from "@/utils/format";

const SEVERITY_BAR: Record<IncidentSeverity, string> = {
  critical: "border-l-sev-critical",
  high: "border-l-sev-high",
  medium: "border-l-sev-warning",
  low: "border-l-sev-low",
};

type Filters = {
  status: IncidentStatus | "";
  severity: IncidentSeverity | "";
};

export function IncidentListPage() {
  const { selectedProjectId } = useProjectContext();
  const [filters, setFilters] = useState<Filters>({
    status: "",
    severity: "",
  });
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const hasFilters = filters.status !== "" || filters.severity !== "";
  const loading = incidents === null && error === null;

  useEffect(() => {
    const controller = new AbortController();
    listIncidents(
      {
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        project: selectedProjectId ?? undefined,
      },
      controller.signal,
    )
      .then(({ incidents: rows }) => {
        setError(null);
        setIncidents(rows);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [filters.status, filters.severity, selectedProjectId, attempt]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            <span className="text-accent">{"//"}</span> command center
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Incidents
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.severity}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                severity: event.target.value as IncidentSeverity | "",
              }))
            }
            aria-label="Filter by severity"
            className="h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
          >
            <option value="">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as IncidentStatus | "",
              }))
            }
            aria-label="Filter by status"
            className="h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-start gap-3">
          <InlineError>{error}</InlineError>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setAttempt((value) => value + 1);
            }}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? <Spinner label="loading incidents" /> : null}

      {!loading && !error && incidents && incidents.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={FlashIcon}
            title="No incidents match these filters"
            body="Try widening the severity or status filter to see more."
          />
        ) : (
          <EmptyState
            icon={FlashIcon}
            title="No incidents yet"
            body="Your dashboard is quiet. POST an error to /api/v1/events/ with your project's X-API-Key and it will show up here, grouped and deduplicated."
          />
        )
      ) : null}

      {!loading && !error && incidents && incidents.length > 0 ? (
        <div className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={incidentDetailUrl(incident.id)}
              className="group block"
            >
              <GlassCard
                className={`border-l-2 p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ${SEVERITY_BAR[incident.severity]}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[15px] font-medium tracking-tight text-ink group-hover:text-accent">
                        {incident.error_group.title}
                      </h2>
                      <span className="shrink-0 font-mono text-[11px] text-muted">
                        #{incident.id}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-muted">
                      {incident.latest_event?.message}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-muted">
                  <span className="font-medium text-ink/80">
                    {incident.project.name}
                  </span>
                  <span>{formatCount(incident.error_group.count)} occurrences</span>
                  <span>first {formatRelativeTime(incident.error_group.first_seen)}</span>
                  <span>last {formatRelativeTime(incident.error_group.last_seen)}</span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
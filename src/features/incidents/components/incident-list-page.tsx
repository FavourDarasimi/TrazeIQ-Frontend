"use client";

// Hallmark · genre: modern-minimal · macrostructure: console-feed · design-system: /Design.md · designed-as-app

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlashIcon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/incident-badges";
import { incidentDetailUrl } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { listIncidents } from "@/services/incidents";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatRelativeTime } from "@/utils/format";

const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
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

  // Phase 3B: live patch on Pusher events instead of refetching. The channel
  // is scoped to the selected project, and the provider re-checks the
  // selection before emitting, so no cross-project rows can land here.
  useRealtimeEvents(
    (event) => {
      if (event.type === "ai_analysis.ready") return;
      setIncidents((current) => {
        if (current === null) return current;
        if (event.type === "incident.created") {
          if (current.some((incident) => incident.id === event.incident.id)) {
            return current;
          }
          return [event.incident, ...current];
        }
        return current.map((incident) =>
          incident.id === event.incident.id ? event.incident : incident,
        );
      });
    },
    [],
  );

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
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              incident feed
            </p>
            <span className="flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ok">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok [animation-duration:3s] motion-reduce:animate-none"
              />
              live
            </span>
          </div>
          <ul>
            {incidents.map((incident) => (
              <li key={incident.id}>
                <Link
                  href={incidentDetailUrl(incident.id)}
                  className="flex flex-col gap-2 px-5 py-4 transition-colors duration-150 hover:bg-bg-panel focus-visible:bg-bg-panel focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[incident.severity]}`}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-medium tracking-tight text-ink">
                        {incident.error_group.title}
                      </h2>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted">
                        {incident.latest_event?.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                    <span className="text-ink/60">#{incident.id}</span>
                    <span className="tabular-nums">
                      {formatCount(incident.error_group.count)}
                    </span>
                    <span className="tabular-nums">
                      {formatRelativeTime(incident.error_group.last_seen)}
                    </span>
                    <StatusBadge status={incident.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
}
"use client";

// Hallmark · genre: modern-minimal · macrostructure: instrument-panel · design-system: /Design.md · designed-as-app

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { SeverityBadge, StatusBadge } from "@/components/ui/incident-badges";
import { StacktraceBlock } from "@/components/ui/stacktrace-block";
import { ROUTES } from "@/constants";
import { AIAnalysisPanel } from "@/features/incidents/components/ai-analysis-panel";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { getIncident, getIncidentTimeline } from "@/services/incidents";
import type {
  Incident,
  IncidentSeverity,
  IncidentTimelineEntry,
} from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import {
  formatClockTime,
  formatCount,
  formatDateTime,
} from "@/utils/format";

const SEVERITY_DOTS: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
};

const LEVEL_LABEL: Record<string, string> = {
  debug: "DEBUG",
  info: "INFO",
  warning: "WARN",
  error: "ERROR",
  fatal: "FATAL",
};

const LEVEL_COLOR: Record<string, string> = {
  debug: "text-muted",
  info: "text-muted",
  warning: "text-sev-warning",
  error: "text-sev-high",
  fatal: "text-sev-critical",
};

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-sm text-ink">{value}</p>
    </GlassCard>
  );
}

function Timeline({
  entries,
  severity,
}: {
  entries: IncidentTimelineEntry[];
  severity: IncidentSeverity;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          Timeline
        </h2>
        {entries.length > 0 ? (
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No recorded occurrences yet.
        </p>
      ) : (
        <ol className="relative mt-4 flex flex-col">
          <span
            aria-hidden
            className="absolute bottom-2 left-[5px] top-2 w-px bg-line"
          />
          {entries.map((entry) => (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              <span
                aria-hidden
                className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-bg-panel ${SEVERITY_DOTS[severity] ?? "bg-muted"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {formatClockTime(entry.created_at)}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${LEVEL_COLOR[entry.level] ?? "text-muted"}`}
                  >
                    {LEVEL_LABEL[entry.level] ?? entry.level.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {entry.service}
                    {entry.environment ? ` · ${entry.environment}` : ""}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
                  {entry.message}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </GlassCard>
  );
}

export function IncidentDetailPage({ incidentId }: { incidentId: string }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [entries, setEntries] = useState<IncidentTimelineEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getIncident(incidentId, controller.signal),
      getIncidentTimeline(incidentId, controller.signal),
    ])
      .then(([{ incident: result }, timeline]) => {
        setError(null);
        setIncident(result);
        setEntries(timeline.entries);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [incidentId, attempt]);

  // Phase 3B: live patch — an `incident.updated`/`incident.resolved` event
  // for this incident updates the header state without a refetch.
  useRealtimeEvents(
    (event) => {
      if (event.type === "ai_analysis.ready") return;
      if (event.incident.id !== incidentId) return;
      setIncident((current) => (current ? { ...event.incident } : current));
    },
    [incidentId],
  );

  const loading = incident === null && error === null;

  if (loading) {
    return <Spinner label="loading incident" />;
  }

  if (error) {
    return (
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
    );
  }

  if (!incident) {
    return (
      <EmptyState
        title="Incident not found"
        body="It may have been removed, or you don't have access to it."
        action={
          <Link
            href={ROUTES.incidents}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Back to incidents
          </Link>
        }
      />
    );
  }

  const latest = incident.latest_event;
  const { error_group: group, project } = incident;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ROUTES.incidents}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="currentColor" strokeWidth={1.5} />
        All incidents
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              {group.title}
            </h1>
            <span className="font-mono text-xs text-muted">#{incident.id}</span>
          </div>
          <p className="mt-1.5 max-w-2xl font-mono text-sm leading-relaxed text-muted">
            {latest?.message}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetaCard label="First seen" value={formatDateTime(group.first_seen)} />
        <MetaCard label="Last seen" value={formatDateTime(group.last_seen)} />
        <MetaCard label="Occurrences" value={formatCount(group.count)} />
        <MetaCard
          label="Environment"
          value={`${project.name} · ${project.environment}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {latest ? (
            <StacktraceBlock
              title="stacktrace"
              message={latest.message}
              stacktrace={latest.stacktrace}
              level={latest.level}
            />
          ) : (
            <p className="text-sm text-muted">No raw occurrence stored for this incident.</p>
          )}
          <Timeline entries={entries} severity={incident.severity} />
        </div>
        <div className="flex flex-col gap-6">
          <AIAnalysisPanel key={incident.id} incidentId={incident.id} />
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { SeverityBadge, StatusBadge } from "@/components/ui/incident-badges";
import { StacktraceBlock } from "@/components/ui/stacktrace-block";
import { ROUTES } from "@/constants";
import { getIncident, getIncidentTimeline } from "@/services/incidents";
import type {
  Incident,
  IncidentSeverity,
  IncidentTimelineEntry,
} from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatDateTime, formatRelativeTime } from "@/utils/format";

const SEVERITY_DOTS: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
};

function AIAnalysisPlaceholder() {
  return (
    <GlassCard className="border-accent/30 p-6 shadow-[0_0_30px_rgba(79,70,229,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-accent">
            <HugeiconsIcon icon={SparklesIcon} size={20} color="currentColor" strokeWidth={1.5} />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            AI Analysis
          </h2>
          <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent">
            AI
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          phase 2
        </span>
      </div>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        This panel isn&apos;t wired up yet. Root cause, suggested fix, and a
        confidence score will appear here once the AI pipeline lands in
        Phase 2.
      </p>
    </GlassCard>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-sm text-ink">{value}</p>
    </GlassCard>
  );
}

function Timeline({ entries, severity }: { entries: IncidentTimelineEntry[]; severity: IncidentSeverity }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-sm font-semibold tracking-tight text-ink">
        Timeline
      </h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No recorded occurrences yet.
        </p>
      ) : (
        <ol className="ml-1.5 mt-5 flex flex-col gap-6 border-l border-line pl-6">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[35px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-bg-panel">
                <span className={`h-2 w-2 rounded-full ${SEVERITY_DOTS[severity] ?? "bg-muted"}`} />
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-ink">Error detected</span>
                  <span className="font-mono text-[11px] text-muted">
                    {formatRelativeTime(entry.created_at)}
                  </span>
                </div>
                <p className="font-mono text-xs leading-relaxed text-muted">
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

export function IncidentDetailPage({ incidentId }: { incidentId: number }) {
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
          <AIAnalysisPlaceholder />
        </div>
      </div>
    </div>
  );
}
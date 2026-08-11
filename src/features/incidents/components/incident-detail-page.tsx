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
import { IncidentTimeline } from "@/features/incidents/components/incident-timeline";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { getIncident } from "@/services/incidents";
import type { Incident } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatDateTime } from "@/utils/format";

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

export function IncidentDetailPage({ incidentId }: { incidentId: string }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getIncident(incidentId, controller.signal)
      .then(({ incident: result }) => {
        setError(null);
        setIncident(result);
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
          <IncidentTimeline incidentId={incident.id} severity={incident.severity} />
        </div>
        <div className="flex flex-col gap-6">
          <AIAnalysisPanel key={incident.id} incidentId={incident.id} />
        </div>
      </div>
    </div>
  );
}
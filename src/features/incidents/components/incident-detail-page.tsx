"use client";

// Hallmark · genre: modern-minimal · macrostructure: instrument-panel · design-system: /Design.md · designed-as-app
/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircleIcon,
  FilterIcon,
  RefreshIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { SeverityBadge, StatusBadge } from "@/components/ui/incident-badges";
import { StacktraceBlock } from "@/components/ui/stacktrace-block";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import { AIAnalysisPanel } from "@/features/incidents/components/ai-analysis-panel";
import { BulkAssignModal } from "@/features/incidents/components/bulk-assign-modal";
import { BulkResolveModal } from "@/features/incidents/components/bulk-resolve-modal";
import { BulkSeverityModal } from "@/features/incidents/components/bulk-severity-modal";
import { BulkStatusModal } from "@/features/incidents/components/bulk-status-modal";
import { IncidentTimeline } from "@/features/incidents/components/incident-timeline";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { getIncident, updateIncident } from "@/services/incidents";
import type { Incident } from "@/types";
import { ApiError } from "@/lib/api";
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
  const { status: authStatus } = useAuth();
  const { selectedProject } = useProjectContext();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [mutating, setMutating] = useState(false);

  // Modal triggers matching the list page modals
  const [modal, setModal] = useState<
    "resolve" | "status" | "severity" | "assign" | null
  >(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();
    getIncident(incidentId, controller.signal)
      .then(({ incident: result }) => {
        setError(null);
        setIsNotFound(false);
        setIncident(result);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && err.code === "NOT_FOUND") {
          setIsNotFound(true);
          setError(null);
          setIncident(null);
          return;
        }
        setIsNotFound(false);
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [authStatus, incidentId, attempt]);

  // Live updates
  useRealtimeEvents(
    (event) => {
      if (event.type === "ai_analysis.ready") return;
      if (event.incident.id !== incidentId) return;
      setIncident((current) => (current ? { ...event.incident } : current));
    },
    [incidentId],
  );

  const handleReopen = async () => {
    if (mutating) return;
    setMutating(true);
    setActionError(null);
    try {
      const { incident: updated } = await updateIncident(incidentId, {
        status: "open",
      });
      setIncident(updated);
    } catch (err: unknown) {
      setActionError(apiErrorMessage(err));
    } finally {
      setMutating(false);
    }
  };

  const handleModalComplete = (updatedList: Incident[]) => {
    if (updatedList.length > 0 && updatedList[0]) {
      setIncident(updatedList[0]);
    } else {
      setAttempt((v) => v + 1);
    }
    setModal(null);
  };

  const loading = incident === null && error === null && !isNotFound;

  if (loading) {
    return <Spinner label="loading incident" />;
  }

  if (isNotFound) {
    return (
      <EmptyState
        title="Incident not found"
        body={`No incident matches “${incidentId}”. It may have been removed, the ID is malformed, or you don’t have access to its project.`}
        action={
          <Link
            href={ROUTES.incidents}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to incidents
          </Link>
        }
      />
    );
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
          className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to incidents
          </Link>
        }
      />
    );
  }

  const latest = incident.latest_event;
  const { error_group: group, project } = incident;
  const isResolved = incident.status === "resolved";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={ROUTES.incidents}
          className="inline-flex w-fit items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          All incidents
        </Link>

        {/* Action Controls in Header */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Resolve / Reopen Button */}
          {isResolved ? (
            <button
              type="button"
              onClick={handleReopen}
              disabled={mutating}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 font-mono text-xs font-medium text-muted transition-colors hover:border-line-soft hover:bg-bg-panel hover:text-ink disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={14}
                color="currentColor"
                strokeWidth={1.5}
              />
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModal("resolve")}
              disabled={mutating}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ok/30 bg-ok/10 px-3 font-mono text-xs font-medium text-ok transition-colors hover:bg-ok/20 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ok"
            >
              <HugeiconsIcon
                icon={CheckmarkCircleIcon}
                size={14}
                color="currentColor"
                strokeWidth={1.5}
              />
              Resolve
            </button>
          )}

          {/* Status Modal Trigger */}
          <button
            type="button"
            onClick={() => setModal("status")}
            disabled={mutating}
            title="Change status"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon
              icon={FilterIcon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
            Status
          </button>

          {/* Severity Modal Trigger */}
          <button
            type="button"
            onClick={() => setModal("severity")}
            disabled={mutating}
            title="Change severity"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon
              icon={Alert02Icon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
            Severity
          </button>

          {/* Assignee Modal Trigger */}
          <button
            type="button"
            onClick={() => setModal("assign")}
            disabled={mutating}
            title="Assign incident"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
            Assign
          </button>
        </div>
      </div>

      {actionError ? <InlineError>{actionError}</InlineError> : null}

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

      {/* Shared Modals */}
      <BulkResolveModal
        open={modal === "resolve"}
        onClose={() => setModal(null)}
        selectedIds={[incident.id]}
        onComplete={handleModalComplete}
      />

      <BulkStatusModal
        open={modal === "status"}
        onClose={() => setModal(null)}
        selectedIds={[incident.id]}
        onComplete={handleModalComplete}
      />

      <BulkSeverityModal
        open={modal === "severity"}
        onClose={() => setModal(null)}
        selectedIds={[incident.id]}
        onComplete={handleModalComplete}
      />

      <BulkAssignModal
        open={modal === "assign"}
        onClose={() => setModal(null)}
        selectedIds={[incident.id]}
        organizationId={selectedProject?.organization ?? null}
        onComplete={handleModalComplete}
      />
    </div>
  );
}
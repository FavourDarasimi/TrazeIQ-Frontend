"use client";

// Phase 4F: the incident timeline as a commit-history-style feed mixing all
// four entry kinds (events, comments, status changes, AI analyses) with a
// distinct icon/accent per type, plus a comment box wired to
// POST /api/incidents/{id}/comments/.
//
// Live updates ride the existing Pusher channel: any `incident.updated` /
// `incident.resolved` / `ai_analysis.ready` for this incident triggers a
// server-truth refetch, so status changes made elsewhere and comments posted
// by other sessions appear without a refresh. The author's own comment is
// appended optimistically and then reconciled against the server entry.

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ChatIcon,
  SparklesIcon,
  StatusIcon,
} from "@hugeicons/core-free-icons";

import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { useAuth } from "@/providers/auth-provider";
import { useProjectContext } from "@/features/app/components/project-context";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { createIncidentComment, getIncidentTimeline } from "@/services/incidents";
import { listMembers } from "@/services/organizations";
import type {
  IncidentSeverity,
  IncidentTimelineEntry,
} from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatClockTime } from "@/utils/format";

const SEVERITY_TEXT: Record<IncidentSeverity, string> = {
  critical: "text-sev-critical",
  high: "text-sev-high",
  medium: "text-sev-warning",
  low: "text-sev-low",
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

const COMMENT_MAX = 5000;

type KindStyle = {
  icon: typeof Alert02Icon;
  label: string;
  labelClass: string;
  iconClass: string;
  contentClass: string;
};

// Design.md: dot/icon color follows entry type — events take the severity
// color, AI analysis the indigo accent, comments and status changes stay
// secondary. Events label themselves by log level; the others by kind.
function kindStyle(
  entry: IncidentTimelineEntry,
  severity: IncidentSeverity,
): KindStyle {
  switch (entry.kind) {
    case "comment":
      return {
        icon: ChatIcon,
        label: "Comment",
        labelClass: "text-muted",
        iconClass: "text-muted",
        contentClass: "text-sm leading-relaxed text-ink",
      };
    case "status_change":
      return {
        icon: StatusIcon,
        label: "Status change",
        labelClass: "text-muted",
        iconClass: "text-muted",
        contentClass: "font-mono text-xs leading-relaxed text-muted",
      };
    case "ai_analysis":
      return {
        icon: SparklesIcon,
        label: "AI analysis",
        labelClass: "text-accent",
        iconClass: "text-accent",
        contentClass: "font-mono text-xs leading-relaxed text-muted",
      };
    case "event":
    default:
      return {
        icon: Alert02Icon,
        label: LEVEL_LABEL[entry.level] ?? entry.level.toUpperCase(),
        labelClass: LEVEL_COLOR[entry.level] ?? "text-muted",
        iconClass: SEVERITY_TEXT[severity] ?? "text-muted",
        contentClass: "font-mono text-xs leading-relaxed text-muted",
      };
  }
}

function TimelineRow({
  entry,
  severity,
}: {
  entry: IncidentTimelineEntry;
  severity: IncidentSeverity;
}) {
  const style = kindStyle(entry, severity);
  const actor = entry.actor_email;
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <span
        aria-hidden
        className="absolute bottom-2 left-[13px] top-2 w-px bg-line"
      />
      <span
        aria-hidden
        className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-bg-panel"
      >
        <HugeiconsIcon icon={style.icon} size={14} color="currentColor" strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="w-14 shrink-0 font-mono text-[11px] tabular-nums text-muted">
            {formatClockTime(entry.created_at)}
          </span>
          <span
            className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${style.labelClass}`}
          >
            {style.label}
          </span>
          {actor ? (
            <span className="font-mono text-[11px] text-muted">{actor}</span>
          ) : null}
        </div>
        <p className={`mt-1 break-words ${style.contentClass}`}>
          {entry.content || entry.message}
        </p>
      </div>
    </li>
  );
}

function CommentBox({
  incidentId,
  onOptimisticAdd,
  onSettled,
}: {
  incidentId: string;
  onOptimisticAdd: (content: string) => string;
  onSettled: (tempId: string, entry: IncidentTimelineEntry | null) => void;
}) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    const content = value.trim();
    if (!content || submitting) return;
    const tempId = onOptimisticAdd(content);
    setSubmitting(true);
    setError(null);
    try {
      const { entry } = await createIncidentComment(incidentId, content);
      onSettled(tempId, entry);
      setValue("");
    } catch (err) {
      onSettled(tempId, null);
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [incidentId, value, submitting, onOptimisticAdd, onSettled]);

  return (
    <div className="border-t border-line pt-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        maxLength={COMMENT_MAX}
        rows={3}
        placeholder="Add a comment…"
        aria-label="Comment"
        className="w-full resize-y rounded-lg border border-line bg-surface px-3.5 py-2.5 font-mono text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
      />
      {error ? (
        <div className="mt-2">
          <InlineError>{error}</InlineError>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] tabular-nums text-muted">
          {value.length} / {COMMENT_MAX}
        </span>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || value.trim().length === 0}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Comment"}
        </button>
      </div>
    </div>
  );
}

export function IncidentTimeline({
  incidentId,
  severity,
}: {
  incidentId: string;
  severity: IncidentSeverity;
}) {
  const { user } = useAuth();
  const { selectedProject } = useProjectContext();
  const [entries, setEntries] = useState<IncidentTimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canComment, setCanComment] = useState<boolean | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const hasEntriesRef = useRef(false);

  // Loads the feed and re-reads it whenever `refreshToken` bumps (realtime
  // events, retry). Bumping aborts the previous in-flight request, so a
  // stale response can never clobber a newer one.
  useEffect(() => {
    const controller = new AbortController();
    getIncidentTimeline(incidentId, controller.signal)
      .then(({ entries: result }) => {
        if (controller.signal.aborted) return;
        hasEntriesRef.current = true;
        setEntries(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Background refreshes keep showing what we already have.
        if (!hasEntriesRef.current) setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [incidentId, refreshToken]);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  // Live updates: any incident event for this incident means history may
  // have changed (status changes elsewhere, comments from other sessions,
  // a fresh AI analysis) — re-read the feed.
  useRealtimeEvents(
    (event) => {
      if (event.type === "ai_analysis.ready") {
        if (event.incident.id !== incidentId) return;
        refresh();
        return;
      }
      if (event.incident.id !== incidentId) return;
      refresh();
    },
    [incidentId, refresh],
  );

  // Phase 4A ladder: the comment endpoint is developer-or-above. Frontend
  // role-hiding is UX only — the API stays authoritative.
  useEffect(() => {
    const organizationId = selectedProject?.organization;
    if (!organizationId || !user) return;
    const controller = new AbortController();
    listMembers(organizationId, controller.signal)
      .then(({ members }) => {
        if (controller.signal.aborted) return;
        const role =
          members.find((member) => member.user === user.email)?.role ?? null;
        setCanComment(role === null || role !== "viewer");
      })
      .catch(() => {
        if (!controller.signal.aborted) setCanComment(true);
      });
    return () => controller.abort();
  }, [selectedProject, user]);

  // No org/user to look the role up against — fall back to showing the box;
  // the API rejects a viewer's post regardless.
  const showCommentBox =
    canComment === true || (!selectedProject?.organization || !user);

  const onOptimisticAdd = useCallback(
    (content: string) => {
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const temp: IncidentTimelineEntry = {
        id: tempId,
        kind: "comment",
        level: "",
        message: "",
        environment: "",
        service: "",
        content,
        actor_email: user?.email ?? null,
        created_at: new Date().toISOString(),
      };
      setEntries((current) => (current ? [...current, temp] : current));
      return tempId;
    },
    [user],
  );

  const onSettled = useCallback(
    (tempId: string, entry: IncidentTimelineEntry | null) => {
      setEntries((current) => {
        if (!current) return current;
        if (entry) {
          return current.map((item) => (item.id === tempId ? entry : item));
        }
        return current.filter((item) => item.id !== tempId);
      });
    },
    [],
  );

  const loading = entries === null && error === null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          Timeline
        </h2>
        {entries && entries.length > 0 ? (
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4">
          <Spinner label="loading timeline" />
        </div>
      ) : error ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <InlineError>{error}</InlineError>
          <button
            type="button"
            onClick={() => {
              setError(null);
              refresh();
            }}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {entries && entries.length > 0 ? (
            <ol className="relative mt-4 flex flex-col">
              <span
                aria-hidden
                className="absolute bottom-2 left-[13px] top-2 w-px bg-line"
              />
              {entries.map((entry) => (
                <TimelineRow key={entry.id} entry={entry} severity={severity} />
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No recorded activity yet.
            </p>
          )}
          {showCommentBox ? (
            <CommentBox
              incidentId={incidentId}
              onOptimisticAdd={onOptimisticAdd}
              onSettled={onSettled}
            />
          ) : canComment === false ? (
            <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
              You have read-only access to this incident — viewers cannot
              comment.
            </p>
          ) : null}
        </>
      )}
    </GlassCard>
  );
}

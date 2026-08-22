"use client";

// Hallmark · genre: modern-minimal · macrostructure: terminal-feed · design-system: /Design.md · designed-as-app

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshIcon,
  Search01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { useProjectContext } from "@/features/app/components/project-context";
import { listEvents } from "@/services/events";
import type { EventLevel, EventLog, EventPageMeta } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatClockTime, formatRelativeTime } from "@/utils/format";

const LEVELS: EventLevel[] = ["fatal", "error", "warning", "info", "debug"];

const LEVEL_STYLE: Record<EventLevel, { dot: string; badge: string }> = {
  fatal: {
    dot: "bg-sev-critical",
    badge: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
  },
  error: {
    dot: "bg-sev-high",
    badge: "border-sev-high/30 bg-sev-high/10 text-sev-high",
  },
  warning: {
    dot: "bg-sev-warning",
    badge: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  },
  info: {
    dot: "bg-sev-low",
    badge: "border-sev-low/30 bg-sev-low/10 text-sev-low",
  },
  debug: {
    dot: "bg-muted",
    badge: "border-line-soft bg-bg-panel text-muted",
  },
};

const INPUT_CLASS =
  "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40";

type Filters = {
  level: EventLevel | "";
  environment: string;
  service: string;
  date: string;
};

export function LogsPage() {
  const { projects } = useProjectContext();
  const [filters, setFilters] = useState<Filters>({
    level: "",
    environment: "",
    service: "",
    date: "",
  });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<EventLog[] | null>(null);
  const [pagination, setPagination] = useState<EventPageMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  useEffect(() => {
    const controller = new AbortController();
    listEvents(
      {
        level: filters.level || undefined,
        environment: filters.environment || undefined,
        service: filters.service || undefined,
        date: filters.date || undefined,
        search: query.trim() || undefined,
        page,
      },
      controller.signal,
    )
      .then(({ events: rows, pagination: meta }) => {
        setError(null);
        setEvents(rows);
        setPagination(meta);
        setLastFetch(new Date().toISOString());
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [
    filters.level,
    filters.environment,
    filters.service,
    filters.date,
    query,
    page,
    attempt,
  ]);

  const hasBackendFilters =
    filters.level !== "" ||
    filters.environment !== "" ||
    filters.service !== "" ||
    filters.date !== "" ||
    query.trim() !== "";
  const loading = events === null && error === null;

  const total = pagination?.total ?? 0;
  const pages = pagination?.pages ?? 0;
  const outOfRange =
    events !== null && total > 0 && pagination !== null && page > pages;

  const environments = useMemo(
    () =>
      [
        ...new Set((events ?? []).map((event) => event.environment).filter(Boolean)),
      ].sort(),
    [events],
  );
  const services = useMemo(
    () =>
      [
        ...new Set((events ?? []).map((event) => event.service).filter(Boolean)),
      ].sort(),
    [events],
  );

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Logs
        </h1>
      </div>

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <div className="relative min-w-0 flex-1 basis-56">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search messages, services, fingerprints"
              aria-label="Search events"
              className={`${INPUT_CLASS} w-full pl-9 [&::-webkit-search-cancel-button]:hidden`}
            />
          </div>
          <select
            value={filters.level}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                level: event.target.value as EventLevel | "",
              }));
              resetPage();
            }}
            aria-label="Filter by level"
            className={`${INPUT_CLASS} basis-32`}
          >
            <option value="">All levels</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            value={filters.environment}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                environment: event.target.value,
              }));
              resetPage();
            }}
            aria-label="Filter by environment"
            className={`${INPUT_CLASS} basis-36`}
          >
            <option value="">All environments</option>
            {environments.map((environment) => (
              <option key={environment} value={environment}>
                {environment}
              </option>
            ))}
          </select>
          <select
            value={filters.service}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                service: event.target.value,
              }));
              resetPage();
            }}
            aria-label="Filter by service"
            className={`${INPUT_CLASS} basis-36`}
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => {
              setFilters((current) => ({ ...current, date: event.target.value }));
              resetPage();
            }}
            aria-label="Filter by day"
            className={`${INPUT_CLASS} basis-36 [color-scheme:dark]`}
          />
          <button
            type="button"
            onClick={() => {
              setError(null);
              setAttempt((value) => value + 1);
            }}
            title="Refresh the event stream"
            aria-label="Refresh the event stream"
            className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 active:translate-y-px"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
            Refresh
          </button>
        </div>
      </GlassCard>

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

      {loading ? <Spinner label="loading event stream" /> : null}

      {!loading && !error && events && total === 0 ? (
        hasBackendFilters ? (
          <EmptyState
            icon={TerminalIcon}
            title="No events match these filters"
            body="Try widening the level, environment, service or day filter, or a different search phrase."
          />
        ) : (
          <EmptyState
            icon={TerminalIcon}
            title="No events yet"
            body="POST an error to /api/v1/events/ with your project's X-API-Key and it will stream in here, exactly as your application sent it."
          />
        )
      ) : null}

      {!loading && !error && events && outOfRange ? (
        <EmptyState
          icon={Search01Icon}
          title="This page is out of range"
          body={`The stream has ${total} events across ${pages} pages, so page ${page} doesn't exist.`}
          action={
            <button
              type="button"
              onClick={resetPage}
              className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
            >
              Go to page 1
            </button>
          }
        />
      ) : null}

      {!loading && !error && events && events.length > 0 ? (
        <GlassCard className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              event stream
            </p>
            <p className="font-mono text-[11px] text-muted">
              {total} events{pages > 0 ? ` · page ${page} of ${pages}` : ""}
              {lastFetch ? ` · updated ${formatRelativeTime(lastFetch)}` : ""}
            </p>
          </div>
          <ul>
            {events.map((event) => {
              const style = LEVEL_STYLE[event.level] ?? LEVEL_STYLE.debug;
              const expanded = expandedId === event.id;
              return (
                <li
                  key={event.id}
                  className="border-b border-line last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : event.id)}
                    aria-expanded={expanded}
                    aria-controls={`event-detail-${event.id}`}
                    className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-bg-panel focus-visible:bg-bg-panel focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                        <time
                          dateTime={event.created_at}
                          className="shrink-0 tabular-nums text-muted"
                        >
                          {formatClockTime(event.created_at)}
                        </time>
                        <span
                          className={`rounded border px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.14em] ${style.badge}`}
                        >
                          {event.level}
                        </span>
                        <span className="truncate text-muted">
                          {[event.service, event.environment]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                      </span>
                      <span className="mt-1 block truncate font-mono text-[13px] text-ink">
                        {event.message}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`mt-1 shrink-0 text-muted transition-transform duration-200 ${
                        expanded ? "rotate-180" : ""
                      }`}
                    >
                      <HugeiconsIcon
                        icon={ChevronDownIcon}
                        size={16}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </span>
                  </button>
                  {expanded ? (
                    <div
                      id={`event-detail-${event.id}`}
                      className="border-t border-line-soft bg-bg-panel/50 px-5 py-4"
                    >
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
                        {event.project ? (
                          <span>
                            project{" "}
                            <span className="text-ink/60">
                              {projectNames.get(event.project) ??
                                event.project}
                            </span>
                          </span>
                        ) : null}
                        {event.fingerprint ? (
                          <span>
                            fingerprint{" "}
                            <span className="text-ink/60">
                              {event.fingerprint.slice(0, 12)}
                            </span>
                          </span>
                        ) : null}
                        {event.request_method || event.endpoint ? (
                          <span>
                            <span className="text-ink/60">
                              {event.request_method}
                            </span>{" "}
                            {event.endpoint}
                          </span>
                        ) : null}
                        <span>
                          event{" "}
                          <span className="text-ink/60">
                            {event.id.slice(0, 8)}
                          </span>
                        </span>
                      </div>
                      {event.stacktrace ? (
                        <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-bg p-4 font-mono text-xs leading-relaxed">
                          {event.stacktrace.split("\n").map((line, index) => (
                            <span
                              key={index}
                              className={
                                line.trimStart().startsWith("at ")
                                  ? "block text-muted"
                                  : "block text-ink/80"
                              }
                            >
                              {line}
                            </span>
                          ))}
                        </pre>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
            <p className="font-mono text-[11px] text-muted">
              newest first
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={!pagination?.has_previous}
                aria-label="Previous page"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 font-mono text-xs text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface"
              >
                <HugeiconsIcon
                  icon={ChevronLeftIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={!pagination?.has_next}
                aria-label="Next page"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 font-mono text-xs text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-surface"
              >
                Next
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
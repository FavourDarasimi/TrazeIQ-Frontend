"use client";

// Hallmark · genre: modern-minimal · macrostructure: terminal-feed · design-system: /Design.md · designed-as-app

import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterHorizontalIcon,
  RefreshIcon,
  Search01Icon,
  Tag01Icon,
  TerminalIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
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
    badge: "border-line-soft bg-line text-muted",
  },
};

const INPUT_CLASS =
  "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 placeholder:text-muted/60";

type Filters = {
  level: EventLevel | "";
  environment: string;
  service: string;
  date: string;
  userId: string;
  release: string;
  tag: string;
};

export function EventExplorerPage() {
  const { status: authStatus } = useAuth();
  const { projects } = useProjectContext();
  const [filters, setFilters] = useState<Filters>({
    level: "",
    environment: "",
    service: "",
    date: "",
    userId: "",
    release: "",
    tag: "",
  });
  const [query, setQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();
    listEvents(
      {
        level: filters.level || undefined,
        environment: filters.environment || undefined,
        service: filters.service || undefined,
        date: filters.date || undefined,
        userId: filters.userId.trim() || undefined,
        release: filters.release.trim() || undefined,
        tag: filters.tag.trim() || undefined,
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
    authStatus,
    filters.level,
    filters.environment,
    filters.service,
    filters.date,
    filters.userId,
    filters.release,
    filters.tag,
    query,
    page,
    attempt,
  ]);

  const hasActiveFilters =
    filters.level !== "" ||
    filters.environment !== "" ||
    filters.service !== "" ||
    filters.date !== "" ||
    filters.userId.trim() !== "" ||
    filters.release.trim() !== "" ||
    filters.tag.trim() !== "" ||
    query.trim() !== "";

  const loading = events === null && error === null;

  const total = pagination?.total ?? 0;
  const pages = pagination?.pages ?? 0;
  const outOfRange =
    events !== null && total > 0 && pagination !== null && page > pages;

  const environments = useMemo(() => {
    const set = new Set<string>(["production", "staging", "development"]);
    for (const e of events ?? []) {
      if (e.environment) set.add(e.environment);
    }
    return Array.from(set).sort();
  }, [events]);

  const services = useMemo(() => {
    const set = new Set<string>();
    for (const e of events ?? []) {
      if (e.service) set.add(e.service);
    }
    return Array.from(set).sort();
  }, [events]);

  function resetPage() {
    setPage(1);
  }

  function clearAllFilters() {
    setFilters({
      level: "",
      environment: "",
      service: "",
      date: "",
      userId: "",
      release: "",
      tag: "",
    });
    setQuery("");
    resetPage();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Event Explorer
          </h1>
          <p className="mt-1 text-sm text-muted">
            Inspect individual crash instances, stack traces, breadcrumbs, and runtime context.
          </p>
        </div>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-3 p-4">
          {/* Main search and quick filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 w-full basis-full sm:w-auto sm:basis-64 sm:flex-1">
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
                placeholder="Search error messages, fingerprints, endpoints..."
                aria-label="Search events"
                className={`${INPUT_CLASS} w-full pl-9 [&::-webkit-search-cancel-button]:hidden`}
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
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
                className={`${INPUT_CLASS} flex-1 sm:flex-initial sm:basis-32`}
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
                className={`${INPUT_CLASS} flex-1 sm:flex-initial sm:basis-36`}
              >
                <option value="">All environments</option>
                {environments.map((environment) => (
                  <option key={environment} value={environment}>
                    {environment}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters((prev) => !prev)}
                aria-expanded={showAdvancedFilters}
                className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
                  showAdvancedFilters ||
                  filters.userId ||
                  filters.release ||
                  filters.tag ||
                  filters.service ||
                  filters.date
                    ? "border-accent/40 bg-accent/10 text-accent font-medium"
                    : "border-line bg-surface text-ink hover:border-line-soft hover:bg-bg-panel"
                }`}
              >
                <HugeiconsIcon
                  icon={FilterHorizontalIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Filters
                {(filters.userId ? 1 : 0) +
                  (filters.release ? 1 : 0) +
                  (filters.tag ? 1 : 0) +
                  (filters.service ? 1 : 0) +
                  (filters.date ? 1 : 0) > 0 ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-bg">
                    {(filters.userId ? 1 : 0) +
                      (filters.release ? 1 : 0) +
                      (filters.tag ? 1 : 0) +
                      (filters.service ? 1 : 0) +
                      (filters.date ? 1 : 0)}
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAttempt((value) => value + 1);
                }}
                title="Refresh event stream"
                aria-label="Refresh event stream"
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
          </div>

          {/* Targeted filter row (User, Release, Tags, Service, Date) */}
          {showAdvancedFilters ? (
            <div className="grid grid-cols-1 gap-3 border-t border-line/60 pt-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-1 block font-mono text-[11px] text-muted uppercase tracking-wider">
                  User ID
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </span>
                  <input
                    type="text"
                    value={filters.userId}
                    onChange={(e) => {
                      setFilters((current) => ({
                        ...current,
                        userId: e.target.value,
                      }));
                      resetPage();
                    }}
                    placeholder="e.g. usr_100"
                    className={`${INPUT_CLASS} w-full pl-8`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] text-muted uppercase tracking-wider">
                  Release
                </label>
                <input
                  type="text"
                  value={filters.release}
                  onChange={(e) => {
                    setFilters((current) => ({
                      ...current,
                      release: e.target.value,
                    }));
                    resetPage();
                  }}
                  placeholder="e.g. v1.2.0"
                  className={`${INPUT_CLASS} w-full`}
                />
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] text-muted uppercase tracking-wider">
                  Tags / Metadata
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <HugeiconsIcon
                      icon={Tag01Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </span>
                  <input
                    type="text"
                    value={filters.tag}
                    onChange={(e) => {
                      setFilters((current) => ({
                        ...current,
                        tag: e.target.value,
                      }));
                      resetPage();
                    }}
                    placeholder="key:val or name"
                    className={`${INPUT_CLASS} w-full pl-8`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] text-muted uppercase tracking-wider">
                  Service
                </label>
                <select
                  value={filters.service}
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      service: event.target.value,
                    }));
                    resetPage();
                  }}
                  className={`${INPUT_CLASS} w-full`}
                >
                  <option value="">All services</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-mono text-[11px] text-muted uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      date: event.target.value,
                    }));
                    resetPage();
                  }}
                  className={`${INPUT_CLASS} w-full [color-scheme:dark]`}
                />
              </div>
            </div>
          ) : null}

          {/* Active filter badges / quick clear */}
          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-line/60 pt-2 text-xs">
              <span className="text-muted text-[11px]">Active filters:</span>
              {query.trim() ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  search: <span className="font-mono">{query}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.level ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  level: <span className="font-mono">{filters.level}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, level: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.environment ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  env: <span className="font-mono">{filters.environment}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, environment: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.userId ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  user: <span className="font-mono">{filters.userId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, userId: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.release ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  release: <span className="font-mono">{filters.release}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, release: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.tag ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  tag: <span className="font-mono">{filters.tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, tag: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.service ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  service: <span className="font-mono">{filters.service}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, service: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              {filters.date ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-ink">
                  date: <span className="font-mono">{filters.date}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((c) => ({ ...c, date: "" }));
                      resetPage();
                    }}
                    className="ml-1 text-muted hover:text-ink"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2} />
                  </button>
                </span>
              ) : null}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-accent hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          ) : null}
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

      {loading ? <Spinner label="Loading event stream..." /> : null}

      {!loading && !error && events && total === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={TerminalIcon}
            title="No events match these filters"
            body="Try widening or clearing your level, environment, user ID, release, or search filters."
            action={
              <button
                type="button"
                onClick={clearAllFilters}
                className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon={TerminalIcon}
            title="No crash events recorded yet"
            body="Send error events to POST /api/v1/events/ with your project's ingest API key. Individual occurrences with stack traces and breadcrumbs will appear here."
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
              Crash stream
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
              const releaseVal =
                (event.metadata?.release as string) ||
                (event.metadata?.version as string) ||
                (event.metadata?.app_version as string);

              const metadataEntries = Object.entries(event.metadata || {}).filter(
                ([k]) => !["release", "version", "app_version"].includes(k),
              );

              const breadcrumbsList = Array.isArray(event.breadcrumbs)
                ? (event.breadcrumbs as Record<string, unknown>[])
                : [];

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
                    className="flex w-full min-w-0 items-start gap-2.5 sm:gap-3 px-3 py-3 sm:px-5 sm:py-3 text-left transition-colors duration-150 hover:bg-bg-panel focus-visible:bg-bg-panel focus-visible:outline-none"
                  >
                    <span
                      aria-hidden
                      className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 font-mono text-xs">
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
                        <span className="hidden sm:inline-block truncate text-muted">
                          {[event.service, event.environment]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                        {event.user_id ? (
                          <span className="hidden md:inline-block rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-ink/70 border border-line">
                            user: {event.user_id}
                          </span>
                        ) : null}
                        {releaseVal ? (
                          <span className="hidden md:inline-block rounded bg-surface px-1.5 py-0.5 text-[10px] font-mono text-accent/80 border border-accent/20">
                            rel: {releaseVal}
                          </span>
                        ) : null}
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
                      className="border-t border-line-soft bg-bg/30 px-3 py-4 sm:px-5 flex flex-col gap-4 overflow-hidden"
                    >
                      {/* Context metadata summary */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
                        {event.project ? (
                          <span>
                            project{" "}
                            <span className="text-ink/80 font-medium">
                              {projectNames.get(event.project) ?? event.project}
                            </span>
                          </span>
                        ) : null}
                        {event.environment ? (
                          <span>
                            environment{" "}
                            <span className="text-ink/80 font-medium">
                              {event.environment}
                            </span>
                          </span>
                        ) : null}
                        {event.service ? (
                          <span>
                            service{" "}
                            <span className="text-ink/80 font-medium">
                              {event.service}
                            </span>
                          </span>
                        ) : null}
                        {releaseVal ? (
                          <span>
                            release{" "}
                            <span className="text-ink/80 font-medium">
                              {releaseVal}
                            </span>
                          </span>
                        ) : null}
                        {event.user_id ? (
                          <span>
                            user_id{" "}
                            <span className="text-ink/80 font-medium">
                              {event.user_id}
                            </span>
                          </span>
                        ) : null}
                        {event.fingerprint ? (
                          <span>
                            fingerprint{" "}
                            <span className="text-ink/80 font-mono">
                              {event.fingerprint.slice(0, 16)}
                            </span>
                          </span>
                        ) : null}
                        {event.request_method || event.endpoint ? (
                          <span>
                            endpoint{" "}
                            <span className="text-ink/80">
                              {event.request_method} {event.endpoint}
                            </span>
                          </span>
                        ) : null}
                        {event.user_id ? (
                          <span>
                            user_id{" "}
                            <span className="text-ink/80 font-medium">
                              {event.user_id}
                            </span>
                          </span>
                        ) : null}
                        {event.ip_address ? (
                          <span>
                            ip{" "}
                            <span className="text-ink/80">
                              {event.ip_address}
                            </span>
                          </span>
                        ) : null}
                        <span>
                          event_id{" "}
                          <span className="text-ink/80 font-mono">
                            {event.id}
                          </span>
                        </span>
                      </div>

                      {/* Custom Tags & Metadata Chips */}
                      {metadataEntries.length > 0 ? (
                        <div className="rounded-lg border border-line bg-surface/50 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
                            Tags & Metadata
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {metadataEntries.map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-flex items-center gap-1 rounded border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-ink"
                              >
                                <span className="text-muted">{k}:</span>
                                <span className="text-ink/90">
                                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Breadcrumbs trail */}
                      {breadcrumbsList.length > 0 ? (
                        <div className="rounded-lg border border-line bg-surface/50 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-2">
                            Breadcrumbs ({breadcrumbsList.length})
                          </p>
                          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                            {breadcrumbsList.map((crumb, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-xs font-mono border-b border-line/40 pb-1 last:border-b-0"
                              >
                                {crumb.timestamp ? (
                                  <span className="text-muted text-[10px] shrink-0">
                                    {String(crumb.timestamp)}
                                  </span>
                                ) : null}
                                {crumb.category ? (
                                  <span className="rounded bg-line px-1 py-0.2 text-[10px] text-muted shrink-0">
                                    {String(crumb.category)}
                                  </span>
                                ) : null}
                                <span className="text-ink/90 truncate">
                                  {String(crumb.message || JSON.stringify(crumb))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Stacktrace */}
                      {event.stacktrace ? (
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted mb-1.5">
                            Stack Trace
                          </p>
                          <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-4 font-mono text-xs leading-relaxed">
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
                        </div>
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

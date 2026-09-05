// Hallmark · genre: modern-minimal · macrostructure: stat-led · design-system: /Design.md · designed-as-app
/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, FlashIcon, Search01Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { CodeBlock } from "@/components/ui/code-block";
import { Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/incident-badges";
import { incidentDetailUrl } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { listIncidents } from "@/services/incidents";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatRelativeTime } from "@/utils/format";

import { BulkActionBar } from "./bulk-action-bar";
import { BulkAssignModal } from "./bulk-assign-modal";
import { BulkResolveModal } from "./bulk-resolve-modal";
import { BulkStatusModal } from "./bulk-status-modal";
import { highlightIncidentMatch } from "./incident-highlight";

const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
};

const STAT_TONE: Record<string, string> = {
  ink: "text-ink",
  critical: "text-sev-critical",
  high: "text-sev-high",
};

function StatCell({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "ink" | "critical" | "high";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd
        className={`font-mono text-3xl font-medium tabular-nums tracking-tight ${STAT_TONE[tone]}`}
      >
        {value}
      </dd>
      <dd className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        {label}
      </dd>
    </div>
  );
}

type Filters = {
  status: IncidentStatus | "";
  severity: IncidentSeverity | "";
};

const SEARCH_DEBOUNCE_MS = 300;

export function IncidentListPage() {
  const { status: authStatus } = useAuth();
  const { selectedProjectId, selectedProject } = useProjectContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const [filters, setFilters] = useState<Filters>({
    status: "",
    severity: "",
  });
  // Immediate input value vs. debounced term sent to the API — keeps typing
  // snappy without firing a request per keystroke.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch.trim());
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Multi-select and bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState<
    "resolve" | "status" | "assign" | null
  >(null);

  const hasFilters =
    filters.status !== "" ||
    filters.severity !== "" ||
    debouncedSearch !== "";
  const hasSearch = debouncedSearch !== "";
  const loading = incidents === null && error === null;

  // Debounce the raw input into the term used for fetching.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // External navigation (e.g. the header Command Center search) arrives via
  // the URL — adopt it as the new input + debounced term.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external URL is the source of truth for header-driven search
    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch.trim());
  }, [urlSearch]);

  // Keep the URL in sync with the applied term so header search, the list,
  // and deep-links (`/incidents?search=foo`) all agree.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch === "") {
      if (!params.has("search")) return;
      params.delete("search");
    } else {
      if (params.get("search") === debouncedSearch) return;
      params.set("search", debouncedSearch);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }, [debouncedSearch, pathname, router, searchParams]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- selection is invalidated by new results
    setSelectedIds(new Set());
    listIncidents(
      {
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        project: selectedProjectId ?? undefined,
        search: debouncedSearch || undefined,
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
  }, [authStatus, filters.status, filters.severity, selectedProjectId, debouncedSearch, attempt]);

  // Phase 3B: live patch on Pusher events instead of refetching.
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

  const openCount =
    incidents?.filter((incident) => incident.status === "open").length ?? 0;
  const criticalCount =
    incidents?.filter((incident) => incident.severity === "critical").length ??
    0;
  const highCount =
    incidents?.filter((incident) => incident.severity === "high").length ?? 0;
  const hasData = incidents !== null && incidents.length > 0;

  const allSelected =
    hasData && incidents.length > 0 && selectedIds.size === incidents.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!incidents) return;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(incidents.map((i) => i.id)));
    }
  };

  const handleBulkComplete = (updatedList: Incident[]) => {
    const updatedMap = new Map(updatedList.map((inc) => [inc.id, inc]));
    setIncidents((current) => {
      if (!current) return current;
      return current.map((inc) => updatedMap.get(inc.id) ?? inc);
    });
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Incidents
        </h1>
        <span className="flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ok">
          <span
            aria-hidden
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok [animation-duration:3s] motion-reduce:animate-none"
          />
          live
        </span>
      </div>

      {!loading && !error && incidents ? (
        <dl className="grid grid-cols-3 gap-6 border-b border-line pb-6">
          <StatCell value={openCount} label="open" tone="ink" />
          <StatCell value={criticalCount} label="critical" tone="critical" />
          <StatCell value={highCount} label="high" tone="high" />
        </dl>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
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
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search titles, messages, services"
              aria-label="Search incidents"
              className="h-9 w-64 rounded-lg border border-line bg-surface pl-9 pr-8 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/60 focus:ring-1 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchInput !== "" ? (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </button>
            ) : null}
          </div>
          {hasData ? (
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 font-mono text-xs text-muted transition-colors hover:border-line-soft hover:text-ink">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleSelectAll}
                aria-label="Select all incidents"
                className="h-4 w-4 cursor-pointer rounded-[4px] border border-line bg-surface text-accent accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <span className="select-none">
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected`
                  : "Select all"}
              </span>
            </label>
          ) : null}

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
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? <Spinner label="loading incidents" /> : null}

      {!loading && !error && incidents && incidents.length === 0 ? (
        hasSearch ? (
          <EmptyState
            icon={Search01Icon}
            title={`No incidents match "${debouncedSearch}"`}
            body="Try a different term, or widen the severity or status filter to see more."
            action={
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="self-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Clear search
              </button>
            }
          />
        ) : hasFilters ? (
          <EmptyState
            icon={FlashIcon}
            title="No incidents match these filters"
            body="Try widening the severity or status filter to see more."
          />
        ) : (
          <EmptyState
            icon={FlashIcon}
            title="No incidents yet"
            body="Your dashboard is quiet. Send a test event with your project API key and it will appear here, grouped and deduplicated."
            action={
              <div className="flex w-full max-w-xl flex-col gap-3 text-left">
                <Link
                  href="/docs"
                  className="self-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
                >
                  View event docs
                </Link>
                <CodeBlock
                  title="Send a test event"
                  code={`curl -X POST https://api.trazeiq.io/api/v1/events/ -H 'X-API-Key: YOUR_PROJECT_API_KEY' -H 'Content-Type: application/json' -d '{"message":"Test event from TrazeIQ","level":"error"}'`}
                />
              </div>
            }
          />
        )
      ) : null}

      {hasData ? (
        <ul className="divide-y divide-line">
          {incidents.map((incident) => {
            const isSelected = selectedIds.has(incident.id);
            return (
              <li
                key={incident.id}
                className={`group relative flex items-center rounded-md transition-colors ${
                  isSelected ? "bg-accent/5" : "hover:bg-bg-panel"
                }`}
              >
                <div className="flex shrink-0 items-center pl-2 pr-1 py-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(incident.id)}
                    aria-label={`Select incident ${incident.error_group.title}`}
                    className="h-4 w-4 cursor-pointer rounded-[4px] border border-line bg-surface text-accent accent-accent opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover:opacity-100"
                  />
                </div>
                <Link
                  href={incidentDetailUrl(incident.id)}
                  className="flex min-w-0 flex-1 flex-col gap-2 px-2 py-3.5 transition-colors duration-150 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[incident.severity]}`}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-medium tracking-tight text-ink">
                        {hasSearch
                          ? highlightIncidentMatch(
                              incident.error_group.title,
                              debouncedSearch,
                            )
                          : incident.error_group.title}
                      </h2>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted">
                        {hasSearch
                          ? highlightIncidentMatch(
                              incident.latest_event?.message,
                              debouncedSearch,
                            )
                          : incident.latest_event?.message}
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
            );
          })}
        </ul>
      ) : null}

      {/* Floating bulk action bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onResolve={() => setBulkModal("resolve")}
        onUpdateStatus={() => setBulkModal("status")}
        onAssign={() => setBulkModal("assign")}
        onClear={() => setSelectedIds(new Set())}
      />

      {/* Bulk operation modals */}
      <BulkResolveModal
        open={bulkModal === "resolve"}
        onClose={() => setBulkModal(null)}
        selectedIds={Array.from(selectedIds)}
        onComplete={handleBulkComplete}
      />

      <BulkStatusModal
        open={bulkModal === "status"}
        onClose={() => setBulkModal(null)}
        selectedIds={Array.from(selectedIds)}
        onComplete={handleBulkComplete}
      />

      <BulkAssignModal
        open={bulkModal === "assign"}
        onClose={() => setBulkModal(null)}
        selectedIds={Array.from(selectedIds)}
        organizationId={selectedProject?.organization ?? null}
        onComplete={handleBulkComplete}
      />
    </div>
  );
}

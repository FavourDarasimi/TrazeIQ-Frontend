/* Hallmark · component: error-volume · genre: modern-minimal · theme: Design.md
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (ink on bg-panel 15.8:1) · pre-emit critique: P5 H4 E5 S4 R5 V5
 * redesign: Workbench terminal — step chart, underline tabs, left-accent header
 */
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircleIcon,
  Layers02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { incidentDetailUrl, ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import {
  useRealtimeEvents,
  RealtimeStatusBadge,
} from "@/providers/realtime-provider";
import { getDashboardOverview, getDashboardStats } from "@/services/dashboard";
import type {
  DashboardHealth,
  DashboardOverview,
  DashboardRange,
  DashboardStats,
  IncidentSeverity,
} from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatRelativeTime } from "@/utils/format";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
};

const SEVERITY_RING: Record<IncidentSeverity, string> = {
  critical: "border-sev-critical/40 text-sev-critical",
  high: "border-sev-high/40 text-sev-high",
  medium: "border-sev-warning/40 text-sev-warning",
  low: "border-sev-low/40 text-sev-low",
};

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const HEALTH_META: Record<
  DashboardHealth,
  { label: string; dot: string; glow: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-ok",
    glow: "shadow-[0_0_14px_rgba(16,185,129,0.55)]",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-sev-warning",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.6)]",
  },
  critical: {
    label: "Critical",
    dot: "bg-sev-critical",
    glow: "shadow-[0_0_18px_rgba(239,68,68,0.7)]",
  },
};

const TREND_ARROW: Record<DashboardOverview["event_trend"]["trend"], string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const TREND_COLOR: Record<DashboardOverview["event_trend"]["trend"], string> = {
  up: "text-sev-critical",
  down: "text-ok",
  flat: "text-muted",
};

/** Dark tooltip pill: `{label} | {events} events · {incidents} incidents`. */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const byKey = Object.fromEntries(
    payload.map((entry) => [entry.dataKey, entry.value]),
  );
  return (
    <div className="flex items-center gap-2 rounded-lg bg-ink px-3 py-1.5 font-mono text-xs text-bg">
      <span>{label}</span>
      <span aria-hidden className="h-3 w-px bg-bg/30" />
      <span className="font-semibold tabular-nums">
        {byKey.events ?? 0} events · {byKey.incidents ?? 0} incidents
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer?: ReactNode;
}) {
  return (
    <GlassCard className="p-6 transition-transform duration-200 hover:-translate-y-1">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        {label}
      </p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {footer ? <div className="mt-3 text-xs text-muted">{footer}</div> : null}
    </GlassCard>
  );
}

function SeverityChips({
  bySeverity,
}: {
  bySeverity: DashboardOverview["open_incidents"]["by_severity"];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {(Object.keys(bySeverity) as IncidentSeverity[]).map((severity) => (
        <span
          key={severity}
          className="flex items-center gap-1.5 font-mono text-[11px] text-muted"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[severity]}`}
          />
          {severity} {bySeverity[severity]}
        </span>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { status: authStatus, user } = useAuth();
  const { selectedProjectId, status: projectStatus } = useProjectContext();
 const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [range, setRange] = useState<DashboardRange>("24h");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [liveTick, setLiveTick] = useState(0);

  const hasProject = selectedProjectId !== null;

  useRealtimeEvents(
    () => {
      setLiveTick((tick) => tick + 1);
    },
    [],
  );

  useEffect(() => {
    if (authStatus !== "authenticated" || !hasProject) {
      if (!hasProject) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale project data
        setOverview(null);
        setError(null);
      }
      return;
    }
    const controller = new AbortController();
    getDashboardOverview(selectedProjectId, controller.signal)
      .then(({ overview: data }) => {
        setError(null);
        setOverview(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [authStatus, selectedProjectId, hasProject, attempt, liveTick]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !hasProject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale project data
      if (!hasProject) setStats(null);
      return;
    }
    const controller = new AbortController();
    getDashboardStats(range, selectedProjectId, controller.signal)
      .then(({ stats: data }) => {
        setError(null);
        setStats(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [authStatus, range, selectedProjectId, hasProject, attempt, liveTick]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.points.map((point) => ({
      ...point,
      label: formatTick(point.ts, stats.range),
    }));
  }, [stats]);

  const loading = hasProject && overview === null && error === null;
  const health = overview ? HEALTH_META[overview.health] : null;
  const trend = overview?.event_trend;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            Welcome back, {user?.username || user?.name || user?.email}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Overview
          </h1>
        </div>
        {health ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5">
            <span
                className={`h-2.5 w-2.5 rounded-full ${health.dot} ${health.glow} ${overview?.health === "healthy" ? "animate-[pulse_3s_ease-in-out_infinite]" : "animate-[pulse_1.5s_ease-in-out_infinite]"} motion-reduce:animate-none`}
            />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                System health
              </span>
              <span className="text-sm font-medium text-ink">
                {health.label}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {!hasProject && projectStatus === "ready" ? (
        <EmptyState
          icon={Layers02Icon}
          title="No project selected"
          body="Select a project from the Command Center to view its health, incidents, and error trends. Create a project to start monitoring."
          action={
            <Link
              href={ROUTES.onboarding}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
            >
              Create a project
            </Link>
          }
        />
      ) : null}

      {error ? (
        <GlassCard className="p-6">
          <InlineError>
            <div className="flex flex-wrap items-center gap-3">
              <span>{error}</span>
              <button
                onClick={() => setAttempt((count) => count + 1)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent/60 hover:text-accent"
              >
                Retry
              </button>
            </div>
          </InlineError>
        </GlassCard>
      ) : null}

      {loading ? (
        <Spinner label="aggregating…" />
      ) : overview ? (
        (() => {
          const visibleErrors = overview.top_errors.slice(0, 2);
          const isTwo = visibleErrors.length === 2;
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="Open incidents"
                  value={String(overview.open_incidents.total)}
                  footer={<SeverityChips bySeverity={overview.open_incidents.by_severity} />}
                />
                <StatCard
                  label="Events · 24h"
                  value={formatCount(overview.events_24h)}
                  footer={
                    trend ? (
                      <span className={`font-mono ${TREND_COLOR[trend.trend]}`}>
                        {TREND_ARROW[trend.trend]} {Math.abs(trend.percent_change)}%
                        <span className="ml-1.5 text-muted">vs prior 24h</span>
                      </span>
                    ) : null
                  }
                />
                <StatCard
                  label="Resolved · 24h"
                  value={String(overview.resolved_24h)}
                  footer={
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={CheckmarkCircleIcon}
                        size={14}
                        color="#10b981"
                        strokeWidth={1.5}
                      />
                      <span className="text-muted">incidents closed</span>
                    </span>
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
                <GlassCard className="flex min-w-0 flex-col overflow-hidden p-0 lg:col-span-2 lg:h-[344px]">
              <div className="flex flex-col gap-3 px-6 pt-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ink" aria-hidden="true" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Error volume</p>
                    <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
                    <span className="hidden font-mono text-[11px] tabular-nums text-muted sm:inline">
                      {stats ? `${formatCount(stats.points.reduce((s, p) => s + p.events, 0))} events · ${range}` : range}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-sm font-semibold tracking-tight text-ink">
                    Events <span className="font-normal text-muted">/ Incidents</span>
                  </h2>
                </div>
                <div className="flex items-center gap-1 border-b border-line">
                  {RANGES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setRange(value)}
                      aria-pressed={range === value}
                      className={`relative -mb-px border-b-2 px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        range === value
                          ? "border-accent text-accent"
                          : "border-transparent text-muted hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col border-t border-line/60 bg-bg/50">
                {stats ? (
                  // min-h gives the chart a floor on mobile, where the card
                  // has no fixed height and the flex-1 chain would collapse
                  // ResponsiveContainer to zero height.
                  <div className="w-full flex-1 min-h-[260px] lg:min-h-0 pt-2 pb-0 [&_.recharts-responsive-container]:!h-full">
                    <div className="h-full w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="var(--color-line)" strokeDasharray="2 4" vertical={false} opacity={0.7} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                          tickLine={false}
                          axisLine={{ stroke: "var(--color-line)" }}
                          minTickGap={24}
                        />
                        <YAxis
                          tick={{ fill: "var(--color-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          width={36}
                        />
                        <Tooltip
                          cursor={{ stroke: "var(--color-line-soft)", strokeWidth: 1 }}
                          content={<ChartTooltip />}
                        />
                        <Area
                          type="monotone"
                          dataKey="events"
                          stroke="var(--color-ink)"
                          strokeWidth={2}
                          fill="none"
                          name="Events"
                          dot={false}
                          activeDot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="incidents"
                          stroke="var(--color-sev-warning)"
                          strokeWidth={1.25}
                          dot={false}
                          activeDot={false}
                          name="Incidents"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center py-10">
                    <Spinner />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-line bg-bg/30 px-6 py-3">
                <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wide text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" /> Events
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sev-warning" aria-hidden="true" /> Incidents
                  </span>
                </div>
                <span className="hidden font-mono text-[10px] tabular-nums text-muted sm:inline">
                  {stats ? `${stats.points.length} buckets` : "—"}
                </span>
              </div>
            </GlassCard>

            {(() => {
              const visibleErrors = overview.top_errors.slice(0, 2);
              return (
                <GlassCard className="flex min-w-0 flex-col overflow-hidden p-0 lg:h-[344px]">
                  <div className="flex items-start justify-between gap-3 px-6 pt-6">
                    <div className="min-w-0">
                      <h2 className="text-[13px] font-semibold tracking-tight text-ink">
                        Top recurring errors
                      </h2>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                        Last 7 days · fingerprint ranked
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <RealtimeStatusBadge />
                      <Link
                        href={ROUTES.incidents}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        View all
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={14}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                      </Link>
                    </div>
                  </div>

                  {visibleErrors.length === 0 ? (
                    <div className="mx-6 mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-bg/30 px-6 py-10 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted">
                        <HugeiconsIcon
                          icon={Search01Icon}
                          size={20}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-ink">
                          No recurring patterns yet
                        </p>
                        <p className="max-w-[22ch] font-mono text-[11px] leading-relaxed text-muted">
                          Errors group here by fingerprint when volume builds.
                          Quiet is good.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ul className="relative mt-5 flex flex-col">
                      {visibleErrors.length > 1 ? (
                        <span
                          aria-hidden
                          className="absolute bottom-8 left-[35px] top-8 w-px bg-line"
                        />
                      ) : null}
                      {visibleErrors.map((error) => {
                        const sev =
                          error.severity as IncidentSeverity | null;
                        const ring = sev
                          ? SEVERITY_RING[sev]
                          : "border-line text-muted";
                        const status = error.status;
                        const StatusIcon =
                          status === "resolved"
                            ? CheckmarkCircleIcon
                            : status === "ignored"
                              ? Cancel01Icon
                              : Alert02Icon;
                        const statusTone =
                          status === "resolved"
                            ? "text-ok"
                            : status === "investigating"
                              ? "text-sev-warning"
                              : status === "ignored"
                                ? "text-muted"
                                : "text-sev-critical";
                        const rowContent = (
                          <div className="flex items-center gap-3.5">
                            <span
                              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-bg ${ring}`}
                            >
                              <HugeiconsIcon
                                icon={StatusIcon}
                                size={13}
                                color="currentColor"
                                strokeWidth={1.8}
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-[13px] font-semibold leading-snug text-ink"
                                title={error.title}
                              >
                                {error.title}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                                {error.fingerprint.slice(0, 8)} · ×
                                {formatCount(error.count)} ·{" "}
                                {formatRelativeTime(error.last_seen)}
                                {sev ? ` · ${SEVERITY_LABEL[sev]}` : null}
                              </p>
                            </div>
                            <span className={`shrink-0 text-xs font-medium ${statusTone}`}>
                              {status
                                ? status.charAt(0).toUpperCase() +
                                  status.slice(1)
                                : "–"}
                            </span>
                          </div>
                        );
                        return (
                          <li
                            key={error.fingerprint}
                            className="relative border-b border-line/60 px-6 py-4 transition-colors last:border-b-0 hover:bg-surface/50"
                          >
                            {error.incident_id ? (
                              <Link
                                href={incidentDetailUrl(error.incident_id)}
                                className="block rounded-xl -mx-3 px-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                                aria-label={`${error.title} — ${error.count} events, view incident`}
                              >
                                {rowContent}
                              </Link>
                            ) : (
                              <div className="-mx-3 rounded-xl px-3 py-1">
                                {rowContent}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </GlassCard>
              );
            })()}
          </div>
        </>
          );
        })()
      ) : null}
    </div>
  );
}

function formatTick(iso: string, range: DashboardRange): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (range === "24h") {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}




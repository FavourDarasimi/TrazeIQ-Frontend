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
  ArrowRight01Icon,
  CheckmarkCircleIcon,
  ChevronRightIcon,
  Clock01Icon,
  FingerPrintIcon,
  FlashIcon,
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

const SEVERITY_BAR: Record<IncidentSeverity, string> = {
  critical: "bg-sev-critical",
  high: "bg-sev-high",
  medium: "bg-sev-warning",
  low: "bg-sev-low",
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
    <GlassCard className="p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(79,70,229,0.12)]">
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
  const { status: authStatus } = useAuth();
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GlassCard className="min-w-0 overflow-hidden p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                    Error volume
                  </p>
                  <h2 className="mt-1 text-sm font-semibold tracking-tight text-ink">
                    Events over time
                  </h2>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
                  {RANGES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setRange(value)}
                      aria-pressed={range === value}
                      className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                        range === value
                          ? "bg-accent/15 text-accent"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {stats ? (
                <div className="mt-5 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#1f1f1f"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "#1f1f1f" }}
                        minTickGap={32}
                      />
                      <YAxis
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ stroke: "#2a2a2a" }}
                        contentStyle={{
                          background: "#111111",
                          border: "1px solid #1f1f1f",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#fafafa" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="url(#eventsFill)"
                        name="Events"
                      />
                      <Line
                        type="monotone"
                        dataKey="incidents"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        dot={false}
                        name="Incidents"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Spinner />
              )}
            </GlassCard>

            {(() => {
              const maxCount = Math.max(
                ...overview.top_errors.map((e) => e.count),
                1,
              );
              const totalEvents = overview.top_errors.reduce(
                (sum, e) => sum + e.count,
                0,
              );
              return (
                <GlassCard className="flex min-w-0 flex-col overflow-hidden p-0">
                  <div className="flex items-start justify-between gap-3 px-6 pt-6">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-panel text-accent">
                        <HugeiconsIcon
                          icon={FlashIcon}
                          size={16}
                          color="currentColor"
                          strokeWidth={1.5}
                        />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-[13px] font-semibold tracking-tight text-ink">
                          Top recurring errors
                        </h2>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                          Last 7 days · fingerprint ranked
                        </p>
                      </div>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:flex">
                      <span className="h-1.5 w-1.5 rounded-full bg-ok shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none" />
                      Live
                    </span>
                  </div>

                  {overview.top_errors.length === 0 ? (
                    <div className="mx-6 mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-bg-panel/40 px-6 py-10 text-center">
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
                    <ul className="mt-5 flex flex-col divide-y divide-line/60">
                      {overview.top_errors.map((error, idx) => {
                        const barPct = Math.max(
                          8,
                          Math.round((error.count / maxCount) * 100),
                        );
                        const sev =
                          error.severity as IncidentSeverity | null;
                        const barColor = sev
                          ? SEVERITY_BAR[sev]
                          : "bg-accent";
                        const dotColor = sev
                          ? SEVERITY_DOT[sev]
                          : "bg-accent";
                        const rank = String(idx + 1).padStart(2, "0");
                        const rowContent = (
                          <div className="flex items-start gap-3">
                            <span className="hidden pt-[3px] font-mono text-[11px] tabular-nums leading-none tracking-wide text-muted/40 sm:block">
                              {rank}
                            </span>
                            <span
                              className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${dotColor} ${sev ? "" : "shadow-[0_0_8px_rgba(79,70,229,0.45)]"}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className="min-w-0 break-words text-[13px] font-medium leading-snug text-ink"
                                style={{ overflowWrap: "anywhere" }}
                                title={error.title}
                              >
                                {error.title}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-panel px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted">
                                  <HugeiconsIcon
                                    icon={FingerPrintIcon}
                                    size={12}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                  />
                                  {error.fingerprint.slice(0, 8)}
                                </span>
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                                  <HugeiconsIcon
                                    icon={Clock01Icon}
                                    size={12}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                  />
                                  {formatRelativeTime(error.last_seen)}
                                </span>
                                {sev ? (
                                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                                    · {SEVERITY_LABEL[sev]}
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <div className="h-1 max-w-[96px] flex-1 overflow-hidden rounded-full bg-line">
                                  <div
                                    className={`h-full rounded-full ${barColor} transition-[width] duration-500`}
                                    style={{ width: `${barPct}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-muted">
                                  {barPct}% of max
                                </span>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span className="rounded-md border border-line bg-bg-panel px-2 py-1 font-mono text-xs font-medium tabular-nums text-ink">
                                ×{formatCount(error.count)}
                              </span>
                              <span className="hidden items-center gap-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted transition-colors group-hover:text-ink sm:inline-flex">
                                Open
                                <HugeiconsIcon
                                  icon={ChevronRightIcon}
                                  size={12}
                                  color="currentColor"
                                  strokeWidth={1.5}
                                />
                              </span>
                            </div>
                          </div>
                        );
                        return (
                          <li
                            key={error.fingerprint}
                            className="group px-6 py-4 transition-colors hover:bg-surface/50"
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

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-line bg-bg-panel/30 px-6 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                      {overview.top_errors.length === 0
                        ? "0 patterns"
                        : `${overview.top_errors.length} patterns · Σ ${formatCount(totalEvents)} events`}
                    </p>
                    {overview.top_errors.length > 0 ? (
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
                    ) : null}
                  </div>
                </GlassCard>
              );
            })()}
          </div>
        </>
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

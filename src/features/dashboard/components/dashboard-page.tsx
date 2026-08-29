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
import { CheckmarkCircleIcon, FlashIcon, Layers02Icon } from "@hugeicons/core-free-icons";
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

            <GlassCard className="flex flex-col p-6">
              <div className="flex items-center gap-2">
                <span className="text-accent">
                  <HugeiconsIcon
                    icon={FlashIcon}
                    size={16}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                </span>
                <h2 className="text-sm font-semibold tracking-tight text-ink">
                  Top recurring errors
                </h2>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Last 7 days of activity
              </p>

              {overview.top_errors.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <p className="text-sm text-muted">No recurring errors yet.</p>
                </div>
              ) : (
                <ul className="mt-4 flex flex-col gap-4">
                  {overview.top_errors.map((error) => {
                    const content = (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 truncate text-sm text-ink">
                            {error.title}
                          </p>
                          <span className="shrink-0 rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
                            x{formatCount(error.count)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {formatRelativeTime(error.last_seen)}
                          {error.severity ? ` · ${error.severity}` : ""}
                        </p>
                      </>
                    );
                    return (
                      <li key={error.fingerprint}>
                        {error.incident_id ? (
                          <Link
                            href={incidentDetailUrl(error.incident_id)}
                            className="block rounded-lg border border-transparent p-2 -m-2 transition-colors hover:border-line hover:bg-surface"
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </GlassCard>
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

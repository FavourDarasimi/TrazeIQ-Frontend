"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers02Icon } from "@hugeicons/core-free-icons";

import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { useProjectContext } from "@/features/app/components/project-context";
import { useRealtimeEvents } from "@/providers/realtime-provider";
import { getServicesHealth } from "@/services/services";
import type {
  DashboardRange,
  ServiceHealth,
  ServiceHealthStatus,
  ServicesHealthCatalog,
} from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatRelativeTime } from "@/utils/format";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const STATUS_META: Record<
  ServiceHealthStatus,
  { label: string; dot: string; chip: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-ok shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    chip: "border-ok/30 bg-ok/10 text-ok",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-sev-warning shadow-[0_0_10px_rgba(245,158,11,0.55)]",
    chip: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  },
  critical: {
    label: "Critical",
    dot: "bg-sev-critical shadow-[0_0_10px_rgba(239,68,68,0.6)]",
    chip: "border-sev-critical/30 bg-sev-critical/10 text-sev-critical",
  },
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <GlassCard className="p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </GlassCard>
  );
}

function ServiceRow({ service }: { service: ServiceHealth }) {
  const status = STATUS_META[service.status];
  const errorShare = Math.round(service.error_rate * 100);

  return (
    <li className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-bg-panel">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-medium text-ink">
              {service.name}
            </p>
            <p className="font-mono text-[11px] text-muted">
              {formatRelativeTime(service.last_seen)}
            </p>
          </div>
        </div>

        <span
          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${status.chip}`}
        >
          {status.label}
        </span>

        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="w-20">uptime</span>
          <span
            className={
              service.uptime >= 99
                ? "text-ok"
                : service.uptime >= 90
                  ? "text-sev-warning"
                  : "text-sev-critical"
            }
          >
            {service.uptime}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-24 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            error rate
          </span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface">
            <div
              className={`h-full rounded-full ${
                service.status === "healthy"
                  ? "bg-ok"
                  : service.status === "degraded"
                    ? "bg-sev-warning"
                    : "bg-sev-critical"
              }`}
              style={{ width: `${Math.min(errorShare, 100)}%` }}
            />
          </div>
          <span className="w-12 text-right font-mono text-xs text-muted">
            {errorShare}%
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={Layers02Icon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
            {formatCount(service.events)} events
          </span>
          <span>{service.error_groups} groups</span>
        </div>
      </div>

      {service.environments.length > 0 ? (
        <div className="flex flex-wrap gap-2 pl-5">
          {service.environments.map((environment) => (
            <span
              key={environment.name}
              className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] text-muted"
            >
              {environment.name}
              <span className="text-ink">{formatCount(environment.events)}</span>
              {environment.error_events > 0 ? (
                <span className="text-sev-warning">
                  · {formatCount(environment.error_events)} err
                </span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function ServicesPage() {
  const { selectedProjectId } = useProjectContext();
  const [catalog, setCatalog] = useState<ServicesHealthCatalog | null>(null);
  const [range, setRange] = useState<DashboardRange>("24h");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [liveTick, setLiveTick] = useState(0);

  useRealtimeEvents(() => {
    setLiveTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getServicesHealth(range, selectedProjectId, controller.signal)
      .then(({ catalog: data }) => {
        setError(null);
        setCatalog(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [range, selectedProjectId, attempt, liveTick]);

  const loading = catalog === null && error === null;
  const summary = catalog?.summary;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            services
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Health catalog
          </h1>
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
      ) : catalog ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Services"
              value={String(summary?.total_services ?? 0)}
              sub="with traffic in window"
            />
            <StatCard
              label={`Events · ${range}`}
              value={formatCount(summary?.events ?? 0)}
              sub="attributed to a service"
            />
            <StatCard
              label="Critical"
              value={String(summary?.critical_services ?? 0)}
              sub="fatal event in window"
            />
            <StatCard
              label="Avg error rate"
              value={`${Math.round((summary?.avg_error_rate ?? 0) * 100)}%`}
              sub="error + fatal share"
            />
          </div>

          <GlassCard className="overflow-hidden">
            {catalog.services.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-muted">
                  <HugeiconsIcon
                    icon={Layers02Icon}
                    size={24}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                </span>
                <p className="text-sm text-ink">No service traffic yet.</p>
                <p className="max-w-sm text-xs text-muted">
                  Tag events with a <span className="font-mono">service</span>{" "}
                  field and they&apos;ll show up here with error rate, uptime
                  and per-environment volume.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {catalog.services.map((service) => (
                  <ServiceRow key={service.name} service={service} />
                ))}
              </ul>
            )}
          </GlassCard>
        </>
      ) : null}
    </div>
  );
}
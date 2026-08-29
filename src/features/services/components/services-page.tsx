// Hallmark · genre: modern-minimal · macrostructure: service-ledger · design-system: /Design.md · designed-as-app
// pre-emit critique: P4 H5 E5 S5 R5 V5
"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Layers02Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
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
import Link from "next/link";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

const STATUS_META: Record<
  ServiceHealthStatus,
  { label: string; dot: string; text: string; orb: string }
> = {
  healthy: {
    label: "Healthy",
    dot: "bg-ok shadow-[0_0_10px_rgba(16,185,129,0.5)]",
    text: "text-ok",
    orb: "bg-ok shadow-[0_0_12px_rgba(16,185,129,0.55)]",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-sev-warning shadow-[0_0_10px_rgba(245,158,11,0.55)]",
    text: "text-sev-warning",
    orb: "bg-sev-warning shadow-[0_0_12px_rgba(245,158,11,0.6)]",
  },
  critical: {
    label: "Critical",
    dot: "bg-sev-critical shadow-[0_0_10px_rgba(239,68,68,0.6)]",
    text: "text-sev-critical",
    orb: "bg-sev-critical shadow-[0_0_12px_rgba(239,68,68,0.65)]",
  },
};

function uptimeTone(uptime: number) {
  if (uptime >= 99) return "text-ok";
  if (uptime >= 90) return "text-sev-warning";
  return "text-sev-critical";
}

function HealthBand({
  catalog,
  range,
}: {
  catalog: ServicesHealthCatalog;
  range: DashboardRange;
}) {
  const summary = catalog.summary;
  const aggregate: ServiceHealthStatus =
    summary.critical_services > 0
      ? "critical"
      : catalog.services.some((service) => service.status === "degraded")
        ? "degraded"
        : "healthy";
  const meta = STATUS_META[aggregate];
  const avgUptime =
    catalog.services.length > 0
      ? Math.round(
          (catalog.services.reduce((total, service) => total + service.uptime, 0) /
            catalog.services.length) *
            100,
        ) / 100
      : 100;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-line bg-bg-panel px-4 py-3">
      <span className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${meta.orb} animate-[pulse_3s_ease-in-out_infinite]`}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          System health
        </span>
        <span className={`font-mono text-sm font-medium ${meta.text}`}>
          {avgUptime}%
        </span>
      </span>
      <p className="min-w-0 flex-wrap font-mono text-xs text-muted">
        <span className="text-ink">$</span> health --range {range} ·{" "}
        <span className="text-ink">{summary.total_services}</span> services ·{" "}
        <span className="text-ink">{formatCount(summary.events)}</span> events ·{" "}
        <span className={summary.critical_services > 0 ? "text-sev-critical" : "text-ink"}>
          {summary.critical_services}
        </span>{" "}
        critical ·{" "}
        <span className="text-ink">{Math.round(summary.avg_error_rate * 100)}%</span> err
      </p>
    </div>
  );
}

function RangeToggle({
  range,
  onChange,
}: {
  range: DashboardRange;
  onChange: (range: DashboardRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
      {RANGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          aria-pressed={range === value}
          className={`rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            range === value
              ? "bg-accent/15 text-accent"
              : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ServiceRow({ service }: { service: ServiceHealth }) {
  const status = STATUS_META[service.status];
  const errorShare = Math.round(service.error_rate * 100);

  return (
    <tr className="transition-colors hover:bg-bg-panel">
      <td className="px-4 py-3 align-top sm:pr-6">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${status.dot}`}
          />
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-medium text-ink">
              {service.name}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted">
              {formatRelativeTime(service.last_seen)}
            </p>
            {service.environments.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {service.environments.map((environment) => (
                  <span
                    key={environment.name}
                    className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
                  >
                    {environment.name}
                    <span className="text-ink">
                      {" "}
                      {formatCount(environment.events)}
                    </span>
                    {environment.error_events > 0 ? (
                      <span className="text-sev-warning">
                        {" "}
                        · {formatCount(environment.error_events)} err
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3 align-middle sm:table-cell">
        <span className={`font-mono text-xs font-medium ${status.text}`}>
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-right align-middle">
        <span className={`font-mono text-xs ${uptimeTone(service.uptime)}`}>
          {service.uptime}%
        </span>
      </td>
      <td className="hidden px-4 py-3 align-middle md:table-cell">
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface">
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
      </td>
      <td className="hidden px-4 py-3 text-right align-middle md:table-cell">
        <span className="font-mono text-xs text-muted">
          {formatCount(service.events)}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-right align-middle lg:table-cell">
        <span className="font-mono text-xs text-muted">
          {service.error_groups}
        </span>
      </td>
    </tr>
  );
}

export function ServicesPage() {
  const { status: authStatus } = useAuth();
  const { selectedProjectId, status: projectStatus } = useProjectContext();
  const [catalog, setCatalog] = useState<ServicesHealthCatalog | null>(null);
  const [range, setRange] = useState<DashboardRange>("24h");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [liveTick, setLiveTick] = useState(0);

  const hasProject = selectedProjectId !== null;

  useRealtimeEvents(() => {
    setLiveTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated" || !hasProject) {
      if (!hasProject) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- clear stale project data
        setCatalog(null);
        setError(null);
      }
      return;
    }
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
  }, [authStatus, range, selectedProjectId, hasProject, attempt, liveTick]);

  const loading = hasProject && catalog === null && error === null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          services
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Health catalog
        </h1>
      </div>

      {!hasProject && projectStatus === "ready" ? (
        <EmptyState
          icon={Layers02Icon}
          title="No project selected"
          body="Select a project from the Command Center to view its service health, error rates, and uptime."
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
        <div className="rounded-lg border border-line bg-surface p-6">
          <InlineError>
            <div className="flex flex-wrap items-center gap-3">
              <span>{error}</span>
              <button
                onClick={() => setAttempt((count) => count + 1)}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:border-accent/60 hover:text-accent"
              >
                Retry
              </button>
            </div>
          </InlineError>
        </div>
      ) : null}

      {loading ? (
        <Spinner label="aggregating…" />
      ) : catalog ? (
        <>
          <HealthBand catalog={catalog} range={range} />

          <div className="overflow-hidden rounded-lg border border-line bg-black">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                services · {range}
              </p>
              <RangeToggle range={range} onChange={setRange} />
            </div>

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
                <p className="font-mono text-sm text-ink">
                  <span className="text-muted">$</span> no service traffic yet.
                </p>
                <p className="max-w-sm font-mono text-xs text-muted">
                  Tag events with a <span className="text-ink">service</span>{" "}
                  field and they&apos;ll show up here with error rate, uptime
                  and per-environment volume.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                      Service
                    </th>
                    <th className="hidden px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
                      Uptime
                    </th>
                    <th className="hidden px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted md:table-cell">
                      Err rate
                    </th>
                    <th className="hidden px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted md:table-cell">
                      Events
                    </th>
                    <th className="hidden px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-muted lg:table-cell">
                      Groups
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {catalog.services.map((service) => (
                    <ServiceRow key={service.name} service={service} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

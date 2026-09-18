"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { getPlatformHealth } from "@/services/platform";
import type { PlatformHealth } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

import {
  AdminCard,
  AdminError,
  AdminLabel,
  AdminLoading,
  AdminPill,
  AdminStat,
} from "@/features/platform/components/admin-ui";

export function AdminHealth() {
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = new AbortController();
    getPlatformHealth(c.signal)
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load platform health.");
      });
    return () => c.abort();
  }, []);

  if (error) return <AdminError message={error} onRetry={() => window.location.reload()} />;
  if (!health) return <AdminLoading label="Checking platform health…" />;

  const checks = Object.entries(health.checks ?? {});
  const metrics = health.metrics ?? {};
  const alerts = metrics.alerts_24h ?? {};
  const isOk = health.status === "ok";
  const alertTotal = Object.values(alerts).reduce<number>((s, n) => s + (typeof n === "number" ? n : 0), 0);
  const maxAlert = Math.max(1, ...Object.values(alerts).map((n) => (typeof n === "number" ? n : 0)));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Platform health</h1>
        <p className="mt-1 text-sm text-muted">Live dependency checks and pipeline metrics.</p>
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${isOk ? "bg-ok" : "bg-sev-critical"}`}
            />
            <div>
              <p className="text-sm font-semibold capitalize text-ink">{health.status}</p>
              <p className="text-xs text-muted">
                {checks.filter(([, c]) => c.status === "ok").length}/{checks.length} checks passing
              </p>
            </div>
          </div>
          <AdminPill tone={isOk ? "green" : "red"} dot={isOk ? "green" : "red"}>
            {isOk ? "All systems operational" : "Attention required"}
          </AdminPill>
        </div>

        {checks.length > 0 ? (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {checks.map(([name, check]) => {
              const ok = check.status === "ok";
              return (
                <li key={name} className="flex items-center gap-3 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${ok ? "bg-ok" : "bg-sev-critical"}`} />
                  <p className="w-32 shrink-0 truncate text-sm capitalize text-ink">{name}</p>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${ok ? "bg-ok" : "bg-sev-critical"}`}
                      style={{
                        width:
                          typeof check.latency_ms === "number"
                            ? `${Math.min(100, Math.max(4, (check.latency_ms / 400) * 100))}%`
                            : "6%",
                      }}
                    />
                  </div>
                  <p className="w-36 shrink-0 text-right text-xs tabular-nums text-muted">
                    {check.status}
                    {typeof check.latency_ms === "number" ? ` · ${check.latency_ms}ms` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : null}
      </AdminCard>

      <div className="grid grid-cols-2 gap-4">
        <AdminStat label="Events · 24h" value={String(metrics.events_24h ?? 0)} sub="Ingested in window" />
        <AdminStat label="Alerts · 24h" value={String(alertTotal)} sub={`${Object.keys(alerts).length} delivery states`} />
      </div>

      {Object.keys(alerts).length > 0 ? (
        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-ink">Alert dispatches by status</h2>
          <p className="mt-0.5 text-[13px] text-muted">Last 24 hours, grouped by delivery outcome.</p>
          <ul className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            {Object.entries(alerts).map(([state, n]) => {
              const count = typeof n === "number" ? n : 0;
              return (
                <li key={state} className="flex items-center gap-3">
                  <p className="w-28 shrink-0 truncate text-xs capitalize text-muted">{state}</p>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(3, (count / maxAlert) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted">{count}</span>
                </li>
              );
            })}
          </ul>
        </AdminCard>
      ) : null}
    </div>
  );
}

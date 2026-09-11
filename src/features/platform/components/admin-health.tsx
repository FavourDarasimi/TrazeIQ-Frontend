"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api";
import { getPlatformHealth } from "@/services/platform";
import type { PlatformHealth } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

function CheckDot({ status }: { status: string }) {
  const ok = status === "ok";
  return (
    <span
      className={`h-2 w-2 rounded-full ${ok ? "bg-ok" : "bg-sev-critical"}`}
      aria-label={status}
    />
  );
}

export function AdminHealth() {
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPlatformHealth(controller.signal)
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load platform health.");
      });
    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <EmptyState
        icon={Activity01Icon}
        title="Health unavailable"
        body={error}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!health) return <Spinner label="Checking platform health…" />;

  const checks = health.checks ?? {};
  const metrics = health.metrics ?? {};
  const ai = metrics.ai_analysis ?? {};
  const alerts = metrics.alerts_24h ?? {};

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <CheckDot status={health.status === "ok" ? "ok" : "bad"} />
          <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            Status · {health.status}
          </h3>
        </div>
        <ul className="mt-4 flex flex-col divide-y divide-line">
          {Object.entries(checks).map(([name, check]) => (
            <li key={name} className="flex items-center gap-3 py-2.5">
              <CheckDot status={check.status} />
              <p className="flex-1 font-mono text-sm capitalize text-ink">{name}</p>
              <p className="font-mono text-[12px] text-muted">
                {check.status}
                {typeof check.latency_ms === "number" ? ` · ${check.latency_ms}ms` : ""}
              </p>
            </li>
          ))}
        </ul>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <GlassCard className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Events · 24h</p>
          <p className="mt-2 font-mono text-2xl text-ink">{metrics.events_24h ?? 0}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">AI pipeline</p>
          <p className="mt-2 font-mono text-2xl text-ink">{ai.pending ?? 0}</p>
          <p className="mt-1 text-xs text-muted">
            pending · ready {ai.ready ?? 0} · failed {ai.failed ?? 0}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Alert dispatches · 24h</p>
          <p className="mt-2 font-mono text-2xl text-ink">
            {Object.values(alerts).reduce<number>(
              (sum, n) => sum + (typeof n === "number" ? n : 0),
              0,
            )}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <HugeiconsIcon icon={Activity01Icon} size={14} color="currentColor" strokeWidth={1.5} />
            by delivery status
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

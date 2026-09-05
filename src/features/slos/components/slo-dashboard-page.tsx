"use client";

/* Hallmark · component: error-budget-ring · genre: modern-minimal · theme: Design.md
 * states: default · hover · focus · active · disabled · loading · error · success
 * v1: ring chart with burn-rate timeline + breach timeline
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  FlashIcon,
  PencilEdit01Icon,
  RocketIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError, SubmitButton } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import { listMembers } from "@/services/organizations";
import {
  acknowledgeSloAlert,
  createSlo,
  deleteSlo,
  getSloAlerts,
  getSloBudget,
  getSloDependencies,
  getSloHistory,
  listSlos,
  updateSlo,
} from "@/services/slos";
import type {
  MembershipRole,
  SLO,
  SLOAlertKind,
  SLOBreachAlert,
  SLODependencySummary,
  SLOStatus,
} from "@/types";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";
import { formatRelativeTime } from "@/utils/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_DOT: Record<SLOStatus, string> = {
  healthy: "bg-ok shadow-[0_0_10px_rgba(16,185,129,0.55)]",
  warning: "bg-sev-warning shadow-[0_0_10px_rgba(245,158,11,0.6)]",
  critical: "bg-sev-critical shadow-[0_0_12px_rgba(239,68,68,0.65)]",
  exhausted: "bg-sev-critical shadow-[0_0_14px_rgba(239,68,68,0.8)]",
};

const STATUS_LABEL: Record<SLOStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  exhausted: "Exhausted",
};

const STATUS_TONE: Record<SLOStatus, string> = {
  healthy: "text-ok",
  warning: "text-sev-warning",
  critical: "text-sev-critical",
  exhausted: "text-sev-critical",
};

const STATUS_BAR: Record<SLOStatus, string> = {
  healthy: "bg-ok",
  warning: "bg-sev-warning",
  critical: "bg-sev-critical",
  exhausted: "bg-sev-critical",
};

const ALERT_LABEL: Record<SLOAlertKind, string> = {
  warning: "Warning",
  critical: "Critical",
  exhausted: "Exhausted",
};

const ALERT_DOT: Record<SLOAlertKind, string> = {
  warning: "bg-sev-warning",
  critical: "bg-sev-critical",
  exhausted: "bg-sev-critical",
};

const INPUT_CLASS =
  "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40";

function BudgetRing({
  remaining,
  status,
  label,
}: {
  remaining: number;
  status: SLOStatus;
  label: string;
}) {
  const safe = Math.max(0, Math.min(100, remaining));
  const radius = 56;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 100) * circumference;
  const gap = circumference - dash;
  const ringColor =
    status === "healthy"
      ? "var(--color-ok, #10b981)"
      : status === "warning"
        ? "var(--color-sev-warning, #f59e0b)"
        : "var(--color-sev-critical, #ef4444)";
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-[148px] w-[148px]">
        <svg
          width="148"
          height="148"
          viewBox="0 0 148 148"
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="74"
            cy="74"
            r={radius}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth={stroke}
          />
          <circle
            cx="74"
            cy="74"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            style={{
              transition: "stroke-dasharray 400ms ease-out",
              filter:
                status === "exhausted"
                  ? "drop-shadow(0 0 6px rgba(239,68,68,0.55))"
                  : status === "healthy"
                    ? "drop-shadow(0 0 6px rgba(16,185,129,0.4))"
                    : "drop-shadow(0 0 6px rgba(245,158,11,0.4))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {label}
          </span>
          <span
            className={`mt-0.5 text-3xl font-semibold tabular-nums ${STATUS_TONE[status]}`}
          >
            {safe.toFixed(1)}%
          </span>
        </div>
      </div>
      <span
        className={`flex items-center gap-2 rounded-full border border-line bg-bg-panel px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${STATUS_TONE[status]}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}

function BurnRateBar({
  label,
  value,
  total,
  windowLabel,
}: {
  label: string;
  value: number;
  total: number;
  windowLabel: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / Math.max(total, 1)) * 100) : 0;
  const tone =
    pct >= 50 ? "bg-sev-critical" : pct >= 25 ? "bg-sev-warning" : "bg-ok";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between font-mono text-[11px] text-muted">
        <span className="flex items-center gap-2">
          <span className="text-ink">{label}</span>
          <span className="uppercase tracking-[0.16em] text-muted/60">
            {windowLabel}
          </span>
        </span>
        <span className="tabular-nums text-ink">{value.toFixed(2)}/h</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full ${tone} transition-[width] duration-500`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function SLOListItem({
  slo,
  canManage,
  onEdit,
  onDelete,
}: {
  slo: SLO;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const snapshot = slo.latest_snapshot;
  const status = snapshot?.status ?? "healthy";
  const remaining = snapshot ? Number(snapshot.budget_remaining_pct) : 100;
  const service = slo.error_query?.service?.trim() || "Project-wide";

  return (
    <GlassCard className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <span className="text-ink">{slo.project.name}</span>
            <span className="text-muted/50">·</span>
            <span>{service}</span>
          </div>
          <h3 className="truncate text-base font-semibold tracking-tight text-ink">
            {slo.name}
          </h3>
          {slo.description ? (
            <p className="line-clamp-2 max-w-[60ch] text-[13px] text-muted">
              {slo.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={`flex items-center gap-2 rounded-full border border-line bg-bg-panel px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] ${STATUS_TONE[status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
            {STATUS_LABEL[status]}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted/70">
            Target {slo.target_pct}% · {slo.window_days}d
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[148px_1fr]">
        <div className="flex items-center justify-center sm:justify-start">
          <BudgetRing remaining={remaining} status={status} label="Budget" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Burn rate
          </span>
          {snapshot ? (
            <div className="flex flex-col gap-2">
              <BurnRateBar
                label="1h"
                value={Number(snapshot.burn_rate_1h)}
                total={Number(snapshot.budget_total) || 1}
                windowLabel="per hour"
              />
              <BurnRateBar
                label="6h"
                value={Number(snapshot.burn_rate_6h)}
                total={Number(snapshot.budget_total) || 1}
                windowLabel="per hour"
              />
              <BurnRateBar
                label="24h"
                value={Number(snapshot.burn_rate_24h)}
                total={Number(snapshot.budget_total) || 1}
                windowLabel="per hour"
              />
              <BurnRateBar
                label="72h"
                value={Number(snapshot.burn_rate_72h)}
                total={Number(snapshot.budget_total) || 1}
                windowLabel="per hour"
              />
            </div>
          ) : (
            <span className="text-xs text-muted">Awaiting first evaluation.</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>
          {snapshot ? (
            <>
              <span className="text-ink">
                {snapshot.bad_events}/{snapshot.total_events}
              </span>{" "}
              bad events · evaluated {formatRelativeTime(snapshot.evaluated_at)}
            </>
          ) : (
            "Not yet evaluated"
          )}
        </span>
        <div className="flex items-center gap-1">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex h-8 items-center gap-1.5 rounded-md px-2 text-muted transition-colors hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label={`Edit ${slo.name}`}
              >
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex h-8 items-center gap-1.5 rounded-md px-2 text-muted transition-colors hover:bg-sev-critical/10 hover:text-sev-critical focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label={`Delete ${slo.name}`}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}

type DraftSLO = {
  name: string;
  description: string;
  target_pct: string;
  window_days: number;
  alert_threshold_pct: string;
  service: string;
};

const EMPTY_DRAFT: DraftSLO = {
  name: "",
  description: "",
  target_pct: "99.90",
  window_days: 30,
  alert_threshold_pct: "25.00",
  service: "",
};

function CreateSLOForm({
  draft,
  setDraft,
  error,
  fieldErrors,
  loading,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  draft: DraftSLO;
  setDraft: (next: DraftSLO) => void;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Name
          </span>
          <input
            type="text"
            value={draft.name}
            maxLength={120}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            required
            className={INPUT_CLASS}
            placeholder="API uptime"
          />
          {fieldErrors.name?.[0] ? (
            <span className="text-[11px] text-sev-critical">
              {fieldErrors.name[0]}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Description
          </span>
          <textarea
            value={draft.description}
            maxLength={500}
            rows={2}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
            className={`${INPUT_CLASS} h-auto py-2 leading-relaxed`}
            placeholder="What does this SLO cover?"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Target (%)
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={draft.target_pct}
            onChange={(event) =>
              setDraft({ ...draft, target_pct: event.target.value })
            }
            required
            className={INPUT_CLASS}
          />
          {fieldErrors.target_pct?.[0] ? (
            <span className="text-[11px] text-sev-critical">
              {fieldErrors.target_pct[0]}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Window (days)
          </span>
          <input
            type="number"
            min="1"
            max="365"
            value={draft.window_days}
            onChange={(event) =>
              setDraft({
                ...draft,
                window_days: Math.max(1, Math.min(365, Number(event.target.value) || 1)),
              })
            }
            required
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Service filter
          </span>
          <input
            type="text"
            value={draft.service}
            maxLength={64}
            onChange={(event) =>
              setDraft({ ...draft, service: event.target.value })
            }
            className={INPUT_CLASS}
            placeholder="api (blank = whole project)"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Alert at budget remaining ≤
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={draft.alert_threshold_pct}
            onChange={(event) =>
              setDraft({ ...draft, alert_threshold_pct: event.target.value })
            }
            required
            className={INPUT_CLASS}
          />
        </label>
      </div>
      {error ? (
        <InlineError>
          <span>{error}</span>
        </InlineError>
      ) : null}
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Cancel
        </button>
        <SubmitButton loading={loading}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

type SLOChartPoint = {
  ts: string;
  remaining: number;
  burnRate: number;
};

function HistoryChart({ points }: { points: SLOChartPoint[] }) {
  if (points.length === 0) {
    return (
      <p className="text-xs text-muted">
        No snapshot history yet. Snapshots are recorded whenever the
        budget endpoint is hit.
      </p>
    );
  }
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="budgetFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-accent)"
                stopOpacity={0.32}
              />
              <stop
                offset="100%"
                stopColor="var(--color-accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--color-line)"
            strokeDasharray="0"
            vertical={false}
            opacity={0.6}
          />
          <XAxis
            dataKey="ts"
            tickFormatter={(value) => {
              if (typeof value !== "string" && typeof value !== "number") {
                return "";
              }
              return new Date(value).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
              });
            }}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-line)" }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            width={36}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-line-soft)" }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              borderRadius: 10,
              fontSize: 12,
            }}
            labelFormatter={(value) => {
              if (typeof value !== "string" && typeof value !== "number") {
                return "";
              }
              return new Date(value).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
            formatter={(value) => {
              const numeric =
                typeof value === "number" ? value : Number(value ?? 0);
              return [`${numeric.toFixed(1)}%`, "Remaining"];
            }}
          />
          <Area
            type="stepAfter"
            dataKey="remaining"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            fill="url(#budgetFill)"
            dot={false}
            name="Budget remaining"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function BreachAlertsList({
  alerts,
  busyId,
  onAcknowledge,
}: {
  alerts: SLOBreachAlert[];
  busyId: string | null;
  onAcknowledge: (alert: SLOBreachAlert) => void;
}) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-bg-panel/40 px-6 py-8 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
          />
        </span>
        <p className="text-sm font-medium text-ink">No active breaches</p>
        <p className="max-w-[40ch] font-mono text-[11px] leading-relaxed text-muted">
          All SLOs are inside their configured burn-rate thresholds.
        </p>
      </div>
    );
  }
  return (
    <ul className="flex flex-col divide-y divide-line/60">
      {alerts.map((alert) => {
        const acknowledged = alert.acknowledged_at !== null;
        return (
          <li
            key={alert.id}
            className="flex flex-col gap-2 px-1 py-3 transition-colors hover:bg-surface/40"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${ALERT_DOT[alert.kind]}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    {ALERT_LABEL[alert.kind]}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
                    {formatRelativeTime(alert.fired_at)}
                  </span>
                  {acknowledged ? (
                    <span className="rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ok">
                      Acknowledged
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] font-medium leading-snug text-ink">
                  {alert.message}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted/80">
                  Remaining {alert.budget_remaining_pct}%
                </p>
              </div>
              {!acknowledged ? (
                <button
                  type="button"
                  disabled={busyId === alert.id}
                  onClick={() => onAcknowledge(alert)}
                  className="flex h-8 items-center gap-1.5 rounded-md bg-accent/15 px-3 text-accent transition-colors hover:bg-accent/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  Ack
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DependencyImpactCard({
  summary,
}: {
  summary: SLODependencySummary | null;
}) {
  if (!summary) {
    return (
      <GlassCard className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-bg-panel text-accent">
            <HugeiconsIcon
              icon={RocketIcon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
          </span>
          <h3 className="text-sm font-semibold text-ink">Service dependency</h3>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          Select a project to see which SLOs a service outage would impact.
        </p>
      </GlassCard>
    );
  }
  return (
    <GlassCard className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-bg-panel text-accent">
            <HugeiconsIcon
              icon={RocketIcon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
          </span>
          <h3 className="text-sm font-semibold text-ink">
            Service dependency impact
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          {summary.total_slos} SLO ·{" "}
          <span
            className={
              summary.breached_slos > 0 ? "text-sev-critical" : "text-ink"
            }
          >
            {summary.breached_slos} breached
          </span>
        </span>
      </div>
      {summary.slos.length === 0 ? (
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          No SLOs defined for this project yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {summary.slos.map((row) => (
            <li
              key={row.slo_id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-panel px-3 py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-medium text-ink">
                  {row.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {row.service || "Project-wide"}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2 font-mono text-[10px]">
                <span
                  className={`flex items-center gap-1.5 rounded-full border border-line bg-bg px-2 py-0.5 uppercase tracking-[0.16em] ${
                    STATUS_TONE[row.status as SLOStatus] ?? "text-muted"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      STATUS_BAR[row.status as SLOStatus] ?? "bg-muted"
                    }`}
                  />
                  {row.status}
                </span>
                <span className="tabular-nums text-ink">
                  {row.budget_remaining_pct ?? "—"}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

export function SloDashboardPage() {
  const { status: authStatus, user } = useAuth();
  const { selectedProjectId, selectedProject, status: projectStatus } =
    useProjectContext();
  const [slos, setSlos] = useState<SLO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SLO | null>(null);
  const [draft, setDraft] = useState<DraftSLO>(EMPTY_DRAFT);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [alerts, setAlerts] = useState<SLOBreachAlert[]>([]);
  const [historyPoints, setHistoryPoints] = useState<SLOChartPoint[]>([]);
  const [historySloId, setHistorySloId] = useState<string | null>(null);
  const [dependency, setDependency] = useState<SLODependencySummary | null>(null);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const hasProject = selectedProjectId !== null;

  const [members, setMembers] = useState<
    { user: string; role: MembershipRole }[] | null
  >(null);
  useEffect(() => {
    if (
      authStatus !== "authenticated" ||
      !selectedProject?.organization
    ) {
      return;
    }
    const controller = new AbortController();
    listMembers(selectedProject.organization, controller.signal)
      .then((data) => {
        setMembers(data.members as { user: string; role: MembershipRole }[]);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [authStatus, selectedProject?.organization]);

  const myRole = useMemo<MembershipRole | null>(() => {
    if (!user || !members) return null;
    return members.find((m) => m.user === user.email)?.role ?? null;
  }, [user, members]);
  const canManage = myRole === "owner" || myRole === "admin";

  const loadAll = useCallback(async () => {
    if (authStatus !== "authenticated" || !hasProject) return;
    const controller = new AbortController();
    try {
      const { slos: data } = await listSlos(selectedProjectId);
      setError(null);
      setSlos(data);
      // Aggregate all SLO alerts in one query — pre-fetched alerts shape
      // already includes SLO context for the breadcrumb.
      const alertLists = await Promise.all(
        data.map((slo) => getSloAlerts(slo.id).then((res) => res.alerts)),
      );
      setAlerts(alertLists.flat());
      const summary = await getSloDependencies(selectedProjectId);
      setDependency(summary.summary);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(apiErrorMessage(err));
    } finally {
      controller.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` intentionally retriggers reload on retry/mutate
  }, [authStatus, hasProject, selectedProjectId, attempt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch populates dashboard state
    void loadAll();
  }, [loadAll]);

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setSubmitError(null);
    setFieldErrors({});
    setEditTarget(null);
    setCreateOpen(true);
  };

  const openEdit = (slo: SLO) => {
    setDraft({
      name: slo.name,
      description: slo.description,
      target_pct: slo.target_pct,
      window_days: slo.window_days,
      alert_threshold_pct: slo.alert_threshold_pct,
      service: slo.error_query?.service ?? "",
    });
    setSubmitError(null);
    setFieldErrors({});
    setEditTarget(slo);
    setCreateOpen(true);
  };

  const closeForm = () => {
    setCreateOpen(false);
    setEditTarget(null);
    setSubmitError(null);
    setFieldErrors({});
  };

  const submitSlo = async () => {
    if (!selectedProjectId) return;
    setBusy(true);
    setSubmitError(null);
    setFieldErrors({});
    const error_query: Record<string, string> = {};
    if (draft.service.trim()) error_query.service = draft.service.trim();
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      target_pct: draft.target_pct,
      window_days: draft.window_days,
      alert_threshold_pct: draft.alert_threshold_pct,
      error_query,
    };
    try {
      if (editTarget) {
        await updateSlo(editTarget.id, payload);
      } else {
        await createSlo({ project: selectedProjectId, ...payload });
      }
      setCreateOpen(false);
      setEditTarget(null);
      setAttempt((count) => count + 1);
    } catch (err: unknown) {
      const message = apiErrorMessage(err);
      setSubmitError(message);
      setFieldErrors(apiFieldErrors(err) ?? {});
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (slo: SLO) => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      `Delete SLO '${slo.name}'? This also drops its snapshot history.`,
    );
    if (!confirmed) return;
    try {
      await deleteSlo(slo.id);
      setAttempt((count) => count + 1);
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
    }
  };

  const refreshBudget = useCallback(
    async (sloId: string) => {
      const [budget, history] = await Promise.all([
        getSloBudget(sloId),
        getSloHistory(sloId, 60),
      ]);
      setHistorySloId(sloId);
      const points: SLOChartPoint[] = history.snapshots.map((snap) => ({
        ts: snap.evaluated_at,
        remaining: Number(snap.budget_remaining_pct),
        burnRate: Number(snap.burn_rate_1h),
      }));
      setHistoryPoints(points);
      return budget.snapshot;
    },
    [],
  );

  const handleAcknowledge = async (alert: SLOBreachAlert) => {
    setAcknowledging(alert.id);
    try {
      await acknowledgeSloAlert(alert.slo, alert.id);
      setAttempt((count) => count + 1);
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
    } finally {
      setAcknowledging(null);
    }
  };

  // Whenever the SLO list refreshes, pull history for the worst-status SLO
  // so the chart always reflects something current.
  useEffect(() => {
    if (!slos || slos.length === 0) return;
    const worst = [...slos].sort((a, b) => {
      const order: Record<SLOStatus, number> = {
        exhausted: 0,
        critical: 1,
        warning: 2,
        healthy: 3,
      };
      const statusA = a.latest_snapshot?.status ?? "healthy";
      const statusB = b.latest_snapshot?.status ?? "healthy";
      return order[statusA] - order[statusB];
    })[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chart follows worst-status SLO selection
    void refreshBudget(worst.id).catch(() => undefined);
  }, [slos, refreshBudget]);

  const loading = hasProject && slos === null && error === null;
  const totalSlos = slos?.length ?? 0;
  const breached = slos?.filter(
    (s) =>
      s.latest_snapshot &&
      (s.latest_snapshot.status === "warning" ||
        s.latest_snapshot.status === "critical" ||
        s.latest_snapshot.status === "exhausted"),
  ).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
            Reliability
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            SLOs & Error Budgets
          </h1>
          <p className="mt-1 max-w-[60ch] font-mono text-[11px] leading-relaxed text-muted">
            Define the success-rate targets that matter most and watch your
            error budget burn down before users feel it.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
            />
            New SLO
          </button>
        ) : null}
      </div>

      {!hasProject && projectStatus === "ready" ? (
        <EmptyState
          icon={Shield01Icon}
          title="No project selected"
          body="Pick a project in the Command Center to define SLOs against its services."
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
        <GlassCard className="p-5">
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

      {hasProject && !loading && totalSlos > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GlassCard className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
              SLOs defined
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
              {totalSlos}
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
              In breach
            </p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${breached > 0 ? "text-sev-critical" : "text-ink"}`}
            >
              {breached}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Warning, critical, or exhausted
            </p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
              Open alerts
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
              {alerts.filter((a) => !a.acknowledged_at).length}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Across every SLO
            </p>
          </GlassCard>
        </div>
      ) : null}

      {loading ? (
        <Spinner label="aggregating SLOs…" />
      ) : slos && slos.length > 0 ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {slos.map((slo) => (
              <SLOListItem
                key={slo.id}
                slo={slo}
                canManage={canManage}
                onEdit={() => openEdit(slo)}
                onDelete={() => void handleDelete(slo)}
              />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-bg-panel text-accent">
                    <HugeiconsIcon
                      icon={FlashIcon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </span>
                  <h2 className="text-sm font-semibold text-ink">
                    Budget remaining over time
                  </h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {historySloId
                    ? slos.find((s) => s.id === historySloId)?.name ?? "—"
                    : "—"}
                </span>
              </div>
              <HistoryChart points={historyPoints} />
            </GlassCard>

            <GlassCard className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">Breach alerts</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {alerts.length} total
                </span>
              </div>
              <BreachAlertsList
                alerts={alerts.slice(0, 10)}
                busyId={acknowledging}
                onAcknowledge={(alert) => void handleAcknowledge(alert)}
              />
            </GlassCard>
          </div>

          <DependencyImpactCard summary={dependency} />
        </>
      ) : hasProject ? (
        <EmptyState
          icon={Shield01Icon}
          title="No SLOs yet"
          body={
            canManage
              ? "Define your first SLO — pick a target success rate and the service it covers. We'll compute the error budget as events flow in."
              : "The team owner or admin can define SLOs for this project."
          }
          action={
            canManage ? (
              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                New SLO
              </button>
            ) : null
          }
        />
      ) : null}

      <Modal
        open={createOpen}
        title={editTarget ? `Edit ${editTarget.name}` : "Define an SLO"}
        onClose={closeForm}
      >
        <CreateSLOForm
          draft={draft}
          setDraft={setDraft}
          error={submitError}
          fieldErrors={fieldErrors}
          loading={busy}
          onSubmit={() => void submitSlo()}
          onCancel={closeForm}
          submitLabel={editTarget ? "Save changes" : "Create SLO"}
        />
      </Modal>
    </div>
  );
}
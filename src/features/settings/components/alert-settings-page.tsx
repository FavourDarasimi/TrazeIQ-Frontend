"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellIcon,
  Delete02Icon,
  MailSend01Icon,
  Notification03Icon,
  PencilEdit01Icon,
  Plug02Icon,
  PlusSignIcon,
  SlackIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";

import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SeverityBadge, StatusBadge } from "@/components/ui/incident-badges";
import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import {
  connectSlack,
  createAlertRule,
  deleteAlertRule,
  getSlackStatus,
  listAlertLogs,
  listAlertRules,
  updateAlertRule,
  type AlertRuleInput,
  type AlertRulePatch,
} from "@/services/alerts";
import { listMembers } from "@/services/organizations";
import type {
  AlertLog,
  AlertRule,
  AlertRuleChannel,
  AlertRuleCondition,
  IncidentSeverity,
  IncidentStatus,
  MembershipRole,
} from "@/types";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";
import { formatRelativeTime } from "@/utils/format";

/* Hallmark · genre: modern-minimal · macrostructure: settings-app-family
 * design-system: Design.md · designed-as-app
 */

const SEVERITY_OPTIONS: Array<{ value: IncidentSeverity; label: string }> = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS: Array<{ value: IncidentStatus; label: string }> = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

const CHANNEL_OPTIONS: Array<{ value: AlertRuleChannel; label: string }> = [
  { value: "email", label: "Email" },
  { value: "slack", label: "Slack" },
  { value: "webhook", label: "Webhook" },
];

const CHANNEL_ICON: Record<AlertRuleChannel, typeof MailSend01Icon> = {
  email: MailSend01Icon,
  slack: SlackIcon,
  webhook: WebhookIcon,
};

const CHANNEL_STYLES: Record<AlertRuleChannel, string> = {
  email: "border-sev-low/30 bg-sev-low/10 text-sev-low",
  slack: "border-accent/30 bg-accent/10 text-accent",
  webhook: "border-line bg-surface text-muted",
};

function ChannelBadge({ channel }: { channel: AlertRuleChannel }) {
  const Icon = CHANNEL_ICON[channel];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${CHANNEL_STYLES[channel]}`}
    >
      <HugeiconsIcon icon={Icon} size={13} color="currentColor" strokeWidth={1.5} />
      {channel}
    </span>
  );
}

function ConditionPicker<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={value === ""}
          onClick={() => onChange("" as T)}
          className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            value === ""
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-line bg-surface text-muted hover:border-line-soft hover:text-ink"
          }`}
        >
          Any
        </button>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              value === option.value
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-line bg-surface text-muted hover:border-line-soft hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConditionChips({ condition }: { condition: AlertRuleCondition }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {condition.severity ? (
        <SeverityBadge severity={condition.severity} />
      ) : null}
      {condition.status ? <StatusBadge status={condition.status} /> : null}
    </span>
  );
}

function AlertStats({
  rules,
  logs,
}: {
  rules: AlertRule[];
  logs: AlertLog[];
}) {
  const dispatched = logs.filter((log) => log.status === "dispatched").length;
  const failed = logs.length - dispatched;

  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
      <div className="bg-bg-panel px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          rules
        </p>
        <p className="mt-1 font-mono text-lg text-ink">{rules.length}</p>
      </div>
      <div className="bg-bg-panel px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          dispatched
        </p>
        <p className="mt-1 font-mono text-lg text-ink">{dispatched}</p>
      </div>
      <div className="bg-bg-panel px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          failed
        </p>
        <p
          className={`mt-1 font-mono text-lg ${
            failed > 0 ? "text-sev-critical" : "text-ink"
          }`}
        >
          {failed}
        </p>
      </div>
    </div>
  );
}

export function AlertSettingsPage() {
  const { selectedProject } = useProjectContext();
  const { user } = useAuth();

  const organizationId = selectedProject?.organization ?? null;
  const projectId = selectedProject?.id ?? null;

  const [rules, setRules] = useState<AlertRule[] | null>(null);
  const [logs, setLogs] = useState<AlertLog[] | null>(null);
  const [members, setMembers] = useState<{ user: string; role: MembershipRole }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const loading = projectId !== null && rules === null && error === null;

  const myRole = useMemo<MembershipRole | null>(() => {
    if (!user || !members) return null;
    return members.find((member) => member.user === user.email)?.role ?? null;
  }, [user, members]);

  const canManage = myRole === "owner" || myRole === "admin";

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (organizationId === null || projectId === null) return;
    const controller = new AbortController();
    Promise.all([
      listAlertRules(projectId).then(({ rules: rows }) => rows),
      listAlertLogs().then(({ logs: rows }) => rows),
      listMembers(organizationId, controller.signal).then(({ members: rows }) =>
        rows.map((member) => ({ user: member.user, role: member.role })),
      ),
    ])
      .then(([ruleRows, logRows, memberRows]) => {
        setError(null);
        setRules(ruleRows);
        setLogs(logRows);
        setMembers(memberRows);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [organizationId, projectId, attempt]);

  if (projectId === null) {
    return (
      <div className="flex flex-col gap-6">
        <AlertHeader />
        <EmptyState
          icon={Notification03Icon}
          title="No project selected"
          body="Alert rules are configured per project. Select or create a project in the Command Center to manage its alerting."
          action={
            <a
              href={ROUTES.onboarding}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
            >
              Create a project
            </a>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AlertHeader />

      {error ? (
        <div className="flex flex-col items-start gap-3">
          <InlineError>{error}</InlineError>
          <button
            type="button"
            onClick={refresh}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <Spinner label="loading alert settings" />
      ) : (
        <div className="flex flex-col gap-6">
          <AlertStats rules={rules ?? []} logs={logs ?? []} />
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <AlertRulesCard
              rules={rules ?? []}
              canManage={canManage}
              onChanged={refresh}
            />
            <DeliveryHistoryCard logs={logs ?? []} />
          </div>
        </div>
      )}

      {!loading && !error ? (
        <SlackCard
          organizationId={organizationId}
          canManage={canManage}
          onChanged={refresh}
        />
      ) : null}
    </div>
  );
}

function AlertHeader() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        settings
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Alerts
      </h1>
    </div>
  );
}

function AlertRulesCard({
  rules,
  canManage,
  onChanged,
}: {
  rules: AlertRule[];
  canManage: boolean;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleEdit(rule: AlertRule) {
    setEditingId(rule.id);
    setShowForm(true);
  }

  function handleCreatedOrUpdated() {
    setShowForm(false);
    setEditingId(null);
    onChanged();
  }

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            alert rules
          </p>
          <span className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-muted">
              {rules.length} rule{rules.length === 1 ? "" : "s"}
            </span>
            {canManage && !showForm ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(true);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 text-xs font-medium text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:bg-accent/20"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} color="currentColor" strokeWidth={1.5} />
                <span className="hidden sm:inline">New rule</span>
                <span className="sm:hidden">New</span>
              </button>
            ) : null}
          </span>
        </div>
        {rules.length === 0 ? (
          <EmptyState
            icon={BellIcon}
            title="No alert rules yet"
            body="Create a rule to page your team by email, Slack, or webhook when an incident matches a severity or status."
          />
        ) : (
          <ul>
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex flex-col gap-3 border-b border-line px-5 py-3.5 last:border-b-0 transition-colors duration-150 hover:bg-bg-panel sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-medium tracking-tight text-ink">
                      {rule.name}
                    </p>
                    <ChannelBadge channel={rule.channel} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ConditionChips condition={rule.condition} />
                    <span className="font-mono text-[11px] text-muted">
                      cooldown {rule.cooldown_minutes}m
                    </span>
                    <span className="truncate font-mono text-[11px] text-muted">
                      → {rule.target}
                    </span>
                  </div>
                </div>
                {canManage ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label="Edit rule"
                      onClick={() => handleEdit(rule)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:text-ink"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    </button>
                    <DeleteRuleButton id={rule.id} name={rule.name} onChanged={onChanged} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {canManage ? (
        <Modal
          open={showForm}
          title={editingId ? "Edit alert rule" : "New alert rule"}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        >
          <AlertRuleForm
            editing={rules.find((rule) => rule.id === editingId) ?? undefined}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            onDone={handleCreatedOrUpdated}
          />
        </Modal>
      ) : null}
    </div>
  );
}

function DeleteRuleButton({
  id,
  name,
  onChanged,
}: {
  id: string;
  name: string;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete alert rule "${name}"? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setFailed(null);
    try {
      await deleteAlertRule(id);
      onChanged();
    } catch (err) {
      setFailed(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Delete rule"
        onClick={handleDelete}
        disabled={busy}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:text-sev-critical disabled:opacity-60"
      >
        <HugeiconsIcon icon={Delete02Icon} size={16} color="currentColor" strokeWidth={1.5} />
      </button>
      {failed ? <InlineError>{failed}</InlineError> : null}
    </>
  );
}

function AlertRuleForm({
  editing,
  onCancel,
  onDone,
}: {
  editing?: AlertRule;
  onCancel: () => void;
  onDone: () => void;
}) {
  const { selectedProject } = useProjectContext();

  const [name, setName] = useState(editing?.name ?? "");
  const [severity, setSeverity] = useState<IncidentSeverity | "">(
    editing?.condition.severity ?? "",
  );
  const [status, setStatus] = useState<IncidentStatus | "">(
    editing?.condition.status ?? "",
  );
  const [channel, setChannel] = useState<AlertRuleChannel>(
    editing?.channel ?? "email",
  );
  const [target, setTarget] = useState(editing?.target ?? "");
  const [cooldown, setCooldown] = useState<string>(
    editing ? String(editing.cooldown_minutes) : "15",
  );

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const targetLabel =
    channel === "email"
      ? "Email address"
      : channel === "slack"
        ? "Slack channel or incoming webhook URL"
        : "Webhook URL";
  const targetPlaceholder =
    channel === "email"
      ? "oncall@company.com"
      : channel === "slack"
        ? "#alerts or https://hooks.slack.com/…"
        : "https://example.com/webhook";

  function buildCondition(): AlertRuleCondition {
    const condition: AlertRuleCondition = {};
    if (severity) condition.severity = severity;
    if (status) condition.status = status;
    return condition;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    setFieldErrors({});

    const condition = buildCondition();
    if (!severity && !status) {
      setBusy(false);
      setFormError("Pick at least one condition — severity or status.");
      return;
    }
    const cooldownMinutes = Number.parseInt(cooldown, 10);
    if (!Number.isFinite(cooldownMinutes) || cooldownMinutes < 1) {
      setBusy(false);
      setFormError("Cooldown must be a positive number of minutes.");
      return;
    }

    const payload: AlertRuleInput | AlertRulePatch = {
      name: name.trim(),
      condition,
      channel,
      target: target.trim(),
      cooldown_minutes: cooldownMinutes,
    };

    try {
      if (editing) {
        await updateAlertRule(editing.id, payload as AlertRulePatch);
      } else {
        await createAlertRule({
          ...(payload as AlertRuleInput),
          project: selectedProject!.id,
        });
      }
      onDone();
    } catch (err) {
      setFormError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        {editing ? "edit alert rule" : "new alert rule"}
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        {formError ? <InlineError>{formError}</InlineError> : null}

        <TextField
          label="Rule name"
          placeholder="Critical production errors"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name?.[0]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <ConditionPicker
            label="Severity"
            value={severity}
            onChange={setSeverity}
            options={SEVERITY_OPTIONS}
          />
          <ConditionPicker
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Channel
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
            {CHANNEL_OPTIONS.map((option) => {
              const Icon = CHANNEL_ICON[option.value];
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={channel === option.value}
                  onClick={() =>
                    setChannel(option.value as AlertRuleChannel)
                  }
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    channel === option.value
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <HugeiconsIcon icon={Icon} size={14} color="currentColor" strokeWidth={1.5} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <TextField
          label={targetLabel}
          placeholder={targetPlaceholder}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          error={fieldErrors.target?.[0]}
        />

        <TextField
          label="Cooldown (minutes)"
          type="number"
          min={1}
          placeholder="15"
          value={cooldown}
          onChange={(event) => setCooldown(event.target.value)}
          error={fieldErrors.cooldown_minutes?.[0]}
        />

        <div className="flex items-center gap-3">
          <SubmitButton loading={busy} loadingLabel="Saving…">
            {editing ? "Save changes" : "Create rule"}
          </SubmitButton>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-line bg-surface px-5 text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:border-line-soft hover:bg-bg-panel"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

function DeliveryHistoryCard({ logs }: { logs: AlertLog[] }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          delivery history
        </p>
        <span className="font-mono text-[11px] text-muted">
          {logs.length} attempt{logs.length === 1 ? "" : "s"}
        </span>
      </div>
      {logs.length === 0 ? (
        <EmptyState
          icon={Plug02Icon}
          title="No deliveries yet"
          body="Once an incident matches a rule, each dispatch attempt — success or failure — shows up here."
        />
      ) : (
        <ul>
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-col gap-2 border-b border-line px-5 py-3 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium tracking-tight text-ink">
                  {log.rule.name}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${
                    log.status === "dispatched"
                      ? "border-ok/30 bg-ok/10 text-ok"
                      : "border-sev-critical/30 bg-sev-critical/10 text-sev-critical"
                  }`}
                >
                  {log.status}
                </span>
              </div>
              <p className="flex items-center gap-2 truncate font-mono text-xs text-muted">
                {log.incident.title}
                <SeverityBadge severity={log.incident.severity} />
              </p>
              {log.status === "failed" && log.error ? (
                <p className="truncate font-mono text-[11px] text-sev-critical">
                  {log.error}
                </p>
              ) : null}
              <p className="font-mono text-[11px] text-muted">
                {formatRelativeTime(log.dispatched_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

function SlackCard({
  organizationId,
  canManage,
  onChanged,
}: {
  organizationId: string | null;
  canManage: boolean;
  onChanged: () => void;
}) {
  const [status, setStatus] = useState<{ connected: boolean; team_name: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId === null) return;
    const controller = new AbortController();
    getSlackStatus(organizationId)
      .then((result) => setStatus(result))
      .catch((err: unknown) => setError(apiErrorMessage(err)))
      .finally(() => controller.abort());
    return () => controller.abort();
  }, [organizationId, onChanged]);

  const slackClientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;

  function handleConnect() {
    if (organizationId === null) {
      setError("No organization selected.");
      return;
    }
    if (!slackClientId) {
      setError("Slack client id is not configured on the frontend.");
      return;
    }
    const orgId = organizationId;
    const redirectUri =
      process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI ??
      `${window.location.origin}${ROUTES.slackCallback}`;
    const url =
      `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(slackClientId)}` +
      `&scope=${encodeURIComponent("incoming.webhook,chat:write")}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    const popup = window.open(
      url,
      "trazeiq-slack",
      "width=600,height=800",
    );
    if (!popup) {
      setError("Pop-up blocked. Allow pop-ups to connect Slack.");
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; code?: string };
      if (data?.type !== "slack-oauth-code" || !data.code) return;
      window.removeEventListener("message", onMessage);
      void finishConnect(data.code);
    }

    async function finishConnect(code: string) {
      setBusy(true);
      setError(null);
      try {
        const result = await connectSlack({ organization: orgId, code });
        setStatus(result);
        onChanged();
      } catch (err) {
        const message = apiErrorMessage(err);
        const code2 = err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
        setError(
          code2 === "SLACK_NOT_CONFIGURED"
            ? "Slack isn't configured on this server yet."
            : message,
        );
      } finally {
        setBusy(false);
      }
    }

    window.addEventListener("message", onMessage);
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
            <HugeiconsIcon icon={SlackIcon} size={20} color="currentColor" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[15px] font-medium tracking-tight text-ink">Slack</p>
            <p className="font-mono text-xs text-muted">
              {status?.connected
                ? `Connected${status.team_name ? ` · ${status.team_name}` : ""}`
                : "Not connected"}
            </p>
          </div>
        </div>
        {canManage ? (
          status?.connected ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">
              <HugeiconsIcon icon={Plug02Icon} size={16} color="currentColor" strokeWidth={1.5} />
              Connected
            </span>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] disabled:opacity-60"
            >
              <HugeiconsIcon icon={SlackIcon} size={16} color="currentColor" strokeWidth={1.5} />
              {busy ? "Connecting…" : "Connect Slack"}
            </button>
          )
        ) : null}
      </div>
      {error ? (
        <div className="mt-4">
          <InlineError>{error}</InlineError>
        </div>
      ) : null}
      {!canManage && !status?.connected ? (
        <p className="mt-4 text-sm text-muted">
          Only owners and admins can connect a Slack workspace.
        </p>
      ) : null}
    </GlassCard>
  );
}

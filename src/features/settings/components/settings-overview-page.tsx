"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  CommandLineIcon,
  LayersIcon,
  Notification03Icon,
  Plug02Icon,
  SlackIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import {
  getSlackStatus,
  listAlertLogs,
  listAlertRules,
} from "@/services/alerts";
import { listMembers } from "@/services/organizations";
import type { MembershipRole } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatDateTime } from "@/utils/format";

/* Hallmark · genre: modern-minimal · macrostructure: settings-app-family
 * design-system: Design.md · designed-as-app
 */

const ENV_STYLES: Record<string, string> = {
  production: "border-accent/30 bg-accent/10 text-accent",
  staging: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  development: "border-line bg-surface text-muted",
};

function KeyValueRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0">
      <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

function CardHeader({
  icon,
  title,
  count,
  href,
  linkLabel,
}: {
  icon: IconSvgElement;
  title: string;
  count?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-3">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        <HugeiconsIcon icon={icon} size={14} color="currentColor" strokeWidth={1.5} />
        {title}
      </p>
      <span className="flex items-center gap-3">
        {count ? (
          <span className="font-mono text-[11px] text-muted">{count}</span>
        ) : null}
        {href ? (
          <Link
            href={href}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            {linkLabel}
          </Link>
        ) : null}
      </span>
    </div>
  );
}

function RoleChip({ role }: { role: MembershipRole }) {
  const styles: Record<MembershipRole, string> = {
    owner: "border-accent/30 bg-accent/10 text-accent",
    admin: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
    developer: "border-sev-low/30 bg-sev-low/10 text-sev-low",
    viewer: "border-line bg-surface text-muted",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${styles[role]}`}
    >
      {role}
    </span>
  );
}

export function SettingsOverviewPage() {
  const { selectedProject } = useProjectContext();
  const { user } = useAuth();

  const organizationId = selectedProject?.organization ?? null;

  const [orgName, setOrgName] = useState<string | null>(null);
  const [members, setMembers] = useState<
    { user: string; role: MembershipRole; created_at: string }[] | null
  >(null);
  const [slackStatus, setSlackStatus] = useState<{
    connected: boolean;
    team_name: string | null;
  } | null>(null);
  const [ruleCount, setRuleCount] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<
    { rule: { name: string }; status: string; incident: { title: string } }[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const loading = organizationId !== null && orgName === null && error === null;

  useEffect(() => {
    if (organizationId === null) return;
    const controller = new AbortController();
    Promise.all([
      import("@/services/organizations").then((m) => m.listOrganizations()),
      listMembers(organizationId, controller.signal),
      getSlackStatus(organizationId),
      listAlertRules(selectedProject!.id),
      listAlertLogs(),
    ])
      .then(([orgs, roster, slack, rules, logs]) => {
        setOrgName(
          orgs.organizations.find((org) => org.id === organizationId)?.name ??
            organizationId.slice(0, 8),
        );
        setMembers(roster.members);
        setSlackStatus(slack);
        setRuleCount(rules.rules.length);
        setRecentLogs(logs.logs.slice(0, 3));
        setError(null);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [organizationId, selectedProject]);

  if (organizationId === null || !selectedProject) {
    return (
      <div className="flex flex-col gap-6">
        <OverviewHeader />
        <EmptyState
          icon={LayersIcon}
          title="No project selected"
          body="Workspace settings are scoped to the organization that owns the currently selected project. Select or create a project to view its workspace."
          action={
            <Link
              href={ROUTES.onboarding}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
            >
              Create a project
            </Link>
          }
        />
      </div>
    );
  }

  const myRole =
    members?.find((member) => member.user === user?.email)?.role ?? null;

  return (
    <div className="flex flex-col gap-6">
      <OverviewHeader />

      {error ? (
        <div className="flex flex-col items-start gap-3">
          <InlineError>{error}</InlineError>
          <button
            type="button"
            onClick={() => setOrgName(null)}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? <Spinner label="loading workspace" /> : null}

      {!loading && !error ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard className="overflow-hidden">
            <CardHeader
              icon={LayersIcon}
              title="workspace"
              count={orgName ?? undefined}
            />
            <dl>
              <KeyValueRow label="project">
                {selectedProject.name}
              </KeyValueRow>
              <KeyValueRow label="environment">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                    ENV_STYLES[selectedProject.environment] ?? ENV_STYLES.development
                  }`}
                >
                  {selectedProject.environment}
                </span>
              </KeyValueRow>
              <KeyValueRow label="api key">
                <code className="font-mono text-xs text-muted">
                  {selectedProject.api_key_prefix}•••••
                </code>
              </KeyValueRow>
              <KeyValueRow label="project created">
                <span className="font-mono text-xs text-muted">
                  {formatDateTime(selectedProject.created_at)}
                </span>
              </KeyValueRow>
            </dl>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <CardHeader
              icon={UserGroupIcon}
              title="team"
              count={
                members ? `${members.length} member${members.length === 1 ? "" : "s"}` : undefined
              }
              href={ROUTES.settingsTeam}
              linkLabel="manage →"
            />
            <ul>
              {members?.slice(0, 4).map((member) => (
                <li
                  key={member.user}
                  className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0"
                >
                  <p className="flex min-w-0 items-center gap-2 truncate font-mono text-xs text-ink">
                    <span className="truncate">{member.user}</span>
                    {member.user === user?.email ? (
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                        you
                      </span>
                    ) : null}
                  </p>
                  <RoleChip role={member.role} />
                </li>
              ))}
            </ul>
            {myRole ? (
              <p className="border-t border-line px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                your role: <span className="text-ink">{myRole}</span>
              </p>
            ) : null}
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <CardHeader
              icon={Plug02Icon}
              title="connections"
              href={ROUTES.settingsAlerts}
              linkLabel="manage →"
            />
            <dl>
              <KeyValueRow label="slack">
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                    slackStatus?.connected ? "text-ok" : "text-muted"
                  }`}
                >
                  <HugeiconsIcon
                    icon={SlackIcon}
                    size={13}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {slackStatus?.connected
                    ? `connected${slackStatus.team_name ? ` · ${slackStatus.team_name}` : ""}`
                    : "not connected"}
                </span>
              </KeyValueRow>
              <KeyValueRow label="email">
                <span className="font-mono text-xs text-ok">available</span>
              </KeyValueRow>
              <KeyValueRow label="webhook">
                <span className="font-mono text-xs text-muted">per-rule</span>
              </KeyValueRow>
            </dl>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <CardHeader
              icon={Notification03Icon}
              title="alerting"
              count={
                ruleCount !== null
                  ? `${ruleCount} rule${ruleCount === 1 ? "" : "s"}`
                  : undefined
              }
              href={ROUTES.settingsAlerts}
              linkLabel="manage →"
            />
            {recentLogs && recentLogs.length > 0 ? (
              <ul>
                {recentLogs.map((log) => (
                  <li
                    key={log.rule.name + log.incident.title + log.status}
                    className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0"
                  >
                    <p className="min-w-0 truncate font-mono text-xs text-ink">
                      {log.rule.name}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                        log.status === "dispatched"
                          ? "border-ok/30 bg-ok/10 text-ok"
                          : "border-sev-critical/30 bg-sev-critical/10 text-sev-critical"
                      }`}
                    >
                      {log.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 px-5 py-6 text-sm text-muted">
                <HugeiconsIcon
                  icon={CommandLineIcon}
                  size={16}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                No deliveries yet — alerts fire when an incident matches a rule.
              </div>
            )}
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}

function OverviewHeader() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        <span className="text-accent">{"//"}</span> settings
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Overview
      </h1>
    </div>
  );
}
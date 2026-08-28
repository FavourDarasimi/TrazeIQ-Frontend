"use client";

/* Hallmark · macrostructure: settings-app-family · tone: technical · anchor hue: indigo
 * genre: modern-minimal · design-system: Design.md · fittings: GlassCard + Hugeicons
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Plug02Icon,
  SlackIcon,
  WebhookIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { connectSlack, getSlackStatus } from "@/services/alerts";
import { apiErrorMessage } from "@/utils/errors";

function Header() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">settings</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Integrations</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
        Connect Slack and configure outbound channels. Slack is workspace-scoped; email
        is always available; webhooks are defined per alert rule.
      </p>
    </div>
  );
}

export function IntegrationsSettingsPage() {
  const { selectedProject } = useProjectContext();
  const organizationId = selectedProject?.organization ?? null;
  const projectId = selectedProject?.id ?? null;

  const [slackStatus, setSlackStatus] = useState<{ connected: boolean; team_name: string | null } | null>(null);
  const [slackBusy, setSlackBusy] = useState(false);
  const [slackError, setSlackError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync reset when org missing
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getSlackStatus(organizationId)
      .then((res) => {
        if (!cancelled) setSlackStatus(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setSlackError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  function handleConnect() {
    if (!organizationId) {
      setSlackError("No organization selected.");
      return;
    }
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    if (!clientId) {
      setSlackError("Slack client id is not configured on the frontend.");
      return;
    }
    const redirectUri =
      process.env.NEXT_PUBLIC_SLACK_REDIRECT_URI ?? `${window.location.origin}${ROUTES.slackCallback}`;
    const url =
      `https://slack.com/oauth/v2/authorize?client_id=${encodeURIComponent(clientId)}` +
      `&scope=${encodeURIComponent("incoming.webhook,chat:write")}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    const popup = window.open(url, "trazeiq-slack", "width=600,height=800");
    if (!popup) {
      setSlackError("Pop-up blocked. Allow pop-ups to connect Slack.");
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
      setSlackBusy(true);
      setSlackError(null);
      try {
        const res = await connectSlack({ organization: organizationId!, code });
        setSlackStatus(res);
      } catch (err) {
        setSlackError(apiErrorMessage(err));
      } finally {
        setSlackBusy(false);
      }
    }

    window.addEventListener("message", onMessage);
  }

  if (!projectId || !organizationId) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <EmptyState
          icon={Plug02Icon}
          title="No project selected"
          body="Integrations are scoped to the organization that owns the currently selected project. Select or create a project to manage its connections."
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

  return (
    <div className="flex flex-col gap-6">
      <Header />

      {loading ? <Spinner label="loading integrations" /> : null}
      {slackError ? <InlineError>{slackError}</InlineError> : null}

      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                <HugeiconsIcon icon={SlackIcon} size={14} color="currentColor" strokeWidth={1.5} />
                Slack
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] ${
                  slackStatus?.connected ? "border-ok/30 bg-ok/10 text-ok" : "border-line bg-surface text-muted"
                }`}
              >
                {slackStatus?.connected ? "connected" : "not connected"}
              </span>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <p className="text-sm leading-relaxed text-muted">
                {slackStatus?.connected
                  ? `Connected to ${slackStatus.team_name ?? "Slack workspace"} — alert rules can deliver to Slack channels or incoming webhooks.`
                  : "Connect a Slack workspace to enable Slack alert delivery. The OAuth token is stored encrypted at rest."}
              </p>
              {slackStatus?.team_name ? (
                <p className="font-mono text-xs text-muted">
                  workspace: <span className="text-ink">{slackStatus.team_name}</span>
                </p>
              ) : null}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={slackBusy || slackStatus?.connected}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] disabled:opacity-60"
                >
                  <HugeiconsIcon icon={SlackIcon} size={16} color="currentColor" strokeWidth={1.5} />
                  {slackBusy ? "Connecting…" : slackStatus?.connected ? "Connected" : "Connect Slack"}
                </button>
                <Link
                  href={ROUTES.settingsAlerts}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
                >
                  manage alert rules →
                </Link>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                <HugeiconsIcon icon={Mail01Icon} size={14} color="currentColor" strokeWidth={1.5} />
                Email
              </p>
              <span className="inline-flex items-center rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ok">
                available
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5">
              <p className="text-sm leading-relaxed text-muted">
                Email delivery uses the configured SMTP backend — no additional setup. Create an alert rule with
                channel <span className="font-mono text-xs text-ink">email</span> and your on-call address.
              </p>
              <Link
                href={ROUTES.settingsAlerts}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
              >
                create email rule →
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                <HugeiconsIcon icon={WebhookIcon} size={14} color="currentColor" strokeWidth={1.5} />
                Webhook
              </p>
              <span className="inline-flex items-center rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                per-rule
              </span>
            </div>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                Webhooks are defined per alert rule — each rule posts a JSON payload to its target URL. Targets are
                validated against private IP ranges to prevent SSRF, and redirects are blocked.
              </p>
              <Link
                href={ROUTES.settingsAlerts}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
              >
                configure in Alerts
              </Link>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}

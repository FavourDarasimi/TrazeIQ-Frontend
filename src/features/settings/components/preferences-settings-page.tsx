"use client";

/* Hallmark · macrostructure: settings-app-family · tone: technical · anchor hue: indigo
 * genre: modern-minimal · design-system: Design.md · fittings: GlassCard + switches
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon, UserSettings01Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import { getAlertPreferences, updateAlertPreferences } from "@/services/notifications";
import type { AlertPreferences } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

function Header() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">settings</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Preferences</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
        Personal notification dials — what the inbox and browser send you for this workspace. Team-wide alert
        rules live under Alerts; Integrations holds Slack.
      </p>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0">
      <span className="min-w-0">
        <span className="block text-sm font-medium tracking-tight text-ink">{label}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
          checked ? "border-accent bg-accent" : "border-line bg-surface"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-ink shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

export function PreferencesSettingsPage() {
  const { status: authStatus } = useAuth();
  const { selectedProject } = useProjectContext();
  const projectId = selectedProject?.id ?? null;

  const [prefs, setPrefs] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional sync reset when project missing
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAlertPreferences()
      .then(({ preferences }) => {
        if (!cancelled) setPrefs(preferences);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, projectId]);

  async function handleToggle<K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]) {
    if (!prefs) return;
    const next = { ...prefs, [key]: value } as AlertPreferences;
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      const { preferences } = await updateAlertPreferences({ [key]: value } as Partial<
        Omit<AlertPreferences, "updated_at">
      >);
      setPrefs(preferences);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(apiErrorMessage(err));
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  }

  if (!projectId) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <EmptyState
          icon={UserSettings01Icon}
          title="No project selected"
          body="Preferences are personal but scoped to the current workspace. Select a project to manage your notification dials."
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

      {saved ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-lg border border-ok/30 bg-bg-panel px-4 py-3 text-sm text-ink shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          Preferences saved
        </div>
      ) : null}

      {loading ? <Spinner label="loading preferences" /> : null}
      {error ? <InlineError>{error}</InlineError> : null}

      {!loading && prefs ? (
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              <HugeiconsIcon icon={Notification03Icon} size={14} color="currentColor" strokeWidth={1.5} />
              notifications
            </p>
            <span className="font-mono text-[11px] text-muted">{saving ? "saving…" : "auto-save"}</span>
          </div>
          <Toggle
            checked={prefs.notify_on_new_incidents}
            onChange={(v) => void handleToggle("notify_on_new_incidents", v)}
            label="New incidents"
            description="Get notified when a new incident is created for this workspace."
            disabled={saving}
          />
          <Toggle
            checked={prefs.notify_on_status_changes}
            onChange={(v) => void handleToggle("notify_on_status_changes", v)}
            label="Status changes"
            description="When someone moves an incident to investigating, resolved or ignored."
            disabled={saving}
          />
          <Toggle
            checked={prefs.notify_on_comments}
            onChange={(v) => void handleToggle("notify_on_comments", v)}
            label="Comments"
            description="New comments on incidents you follow or are assigned to."
            disabled={saving}
          />
          <Toggle
            checked={prefs.only_assigned_to_me}
            onChange={(v) => void handleToggle("only_assigned_to_me", v)}
            label="Only incidents assigned to me"
            description="Mute everything except incidents where you are the assignee."
            disabled={saving}
          />
        </GlassCard>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Key01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeBlock } from "@/components/ui/code-block";
import { GlassCard } from "@/components/ui/glass-card";
import { InlineError, SubmitButton } from "@/components/ui/form";
import { rotateProjectKey } from "@/services/projects";
import { useProjectContext } from "@/features/app/components/project-context";
import { apiErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/constants";
import Link from "next/link";

export function ApiKeysSettingsPage() {
  const { selectedProject, refresh } = useProjectContext();
  const [confirming, setConfirming] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<{ apiKey: string; snippet: string } | null>(null);

  if (!selectedProject) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <EmptyState
          icon={Key01Icon}
          title="No project selected"
          body="Select a project to view and rotate its API key."
          action={<Link href={ROUTES.onboarding} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink">Create a project</Link>}
        />
      </div>
    );
  }

  async function handleRotate() {
    const projectId = selectedProject?.id;
    if (!projectId) return;
    setRotating(true);
    setError(null);
    try {
      const result = await rotateProjectKey(projectId);
      setNewKey({ apiKey: result.api_key, snippet: result.integration_snippet });
      setConfirming(false);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setRotating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />
      {error ? <InlineError>{error}</InlineError> : null}
      {newKey ? (
        <GlassCard className="flex flex-col gap-4 border-ok/30 p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">New key generated</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">The previous key is no longer valid. Copy this key now; it will not be shown again.</p>
          </div>
          <CodeBlock title="X-API-Key" code={newKey.apiKey} />
          <CodeBlock title="Integration snippet" code={newKey.snippet} />
          <button type="button" onClick={() => setNewKey(null)} className="self-start text-sm text-muted underline underline-offset-4 hover:text-ink">I saved the key</button>
        </GlassCard>
      ) : (
        <GlassCard className="flex flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-ink">{selectedProject.name}</h2>
              <p className="mt-1 text-sm text-muted">Use this key to send events for the {selectedProject.environment} environment.</p>
            </div>
            <HugeiconsIcon icon={Key01Icon} size={20} color="currentColor" strokeWidth={1.5} className="text-muted" />
          </div>
          <div className="rounded-lg border border-line bg-bg-panel px-3.5 py-3 font-mono text-sm text-muted">
            {selectedProject.api_key_prefix}••••••••••••
          </div>
          {confirming ? (
            <div className="flex flex-col gap-3 rounded-lg border border-sev-warning/30 bg-sev-warning/10 p-4">
              <p className="text-sm leading-relaxed text-sev-warning">Rotating immediately revokes the current key. Update every integration before sending events again.</p>
              <div className="flex flex-wrap gap-2">
                <SubmitButton loading={rotating} loadingLabel="Rotating…" onClick={() => void handleRotate()}>Rotate key</SubmitButton>
                <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-ink">Cancel</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="self-start rounded-lg border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-sev-warning/50 hover:text-sev-warning">Rotate API key</button>
          )}
        </GlassCard>
      )}
    </div>
  );
}

function Header() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">settings</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">API keys</h1>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">Manage the project key used by your applications to send events to TrazeIQ.</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkCircle01Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";

import { CodeBlock } from "@/components/ui/code-block";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import {
  createProjectKey,
  listProjectKeys,
  revokeProjectKey,
  rotateProjectApiKeyV2,
} from "@/services/projects";
import type { ApiKeyScope, ProjectApiKey } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatCount, formatDateTime, formatRelativeTime } from "@/utils/format";

const AVAILABLE_SCOPES: { id: ApiKeyScope; label: string; desc: string }[] = [
  {
    id: "ingest_only",
    label: "Ingest only",
    desc: "Send crash events, stack traces and breadcrumbs (POST /events/)",
  },
  {
    id: "sourcemaps_upload",
    label: "Sourcemaps upload",
    desc: "Upload build artifacts and source maps for stack unminification",
  },
  {
    id: "read_only",
    label: "Read only",
    desc: "Read project errors, metrics, and incident health catalogs",
  },
];

export function ApiKeysSettingsPage() {
  const { selectedProject, refresh } = useProjectContext();
  const [keys, setKeys] = useState<ProjectApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ProjectApiKey | null>(null);

  // Form states
  const [createName, setCreateName] = useState("");
  const [createScopes, setCreateScopes] = useState<ApiKeyScope[]>(["ingest_only"]);
  const [rotateGraceHours, setRotateGraceHours] = useState(24);
  const [submitting, setSubmitting] = useState(false);

  // Newly minted key view
  const [newKeyDetails, setNewKeyDetails] = useState<{
    name: string;
    apiKey: string;
    snippet: string;
  } | null>(null);

  const projectId = selectedProject?.id;

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await listProjectKeys(projectId!);
        if (!cancelled) {
          setKeys(resp.keys);
        }
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!selectedProject) {
    return (
      <div className="flex flex-col gap-6">
        <Header onOpenCreate={() => {}} disabled />
        <EmptyState
          icon={Key01Icon}
          title="No project selected"
          body="Select a project to view and manage its API keys."
          action={
            <Link
              href={ROUTES.onboarding}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink"
            >
              Create a project
            </Link>
          }
        />
      </div>
    );
  }

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !createName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await createProjectKey(selectedProject.id, {
        name: createName.trim(),
        scopes: createScopes,
      });
      setKeys((prev) => [resp.key, ...prev]);
      setNewKeyDetails({
        name: resp.key.name,
        apiKey: resp.api_key,
        snippet: resp.integration_snippet,
      });
      setIsCreateOpen(false);
      setCreateName("");
      setCreateScopes(["ingest_only"]);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRotateKey() {
    if (!selectedProject || !selectedKey) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await rotateProjectApiKeyV2(selectedProject.id, selectedKey.id, {
        grace_period_hours: rotateGraceHours,
      });
      setKeys((prev) =>
        prev.map((k) => {
          if (k.id === resp.old_key.id) return resp.old_key;
          return k;
        })
      );
      setKeys((prev) => [resp.key, ...prev.filter((k) => k.id !== resp.key.id)]);
      setNewKeyDetails({
        name: resp.key.name,
        apiKey: resp.api_key,
        snippet: resp.integration_snippet,
      });
      setIsRotateOpen(false);
      setSelectedKey(null);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevokeKey() {
    if (!selectedProject || !selectedKey) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await revokeProjectKey(selectedProject.id, selectedKey.id);
      setKeys((prev) =>
        prev.map((k) => (k.id === resp.key.id ? resp.key : k))
      );
      setIsRevokeOpen(false);
      setSelectedKey(null);
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleScope(scope: ApiKeyScope) {
    setCreateScopes((current) =>
      current.includes(scope)
        ? current.filter((s) => s !== scope)
        : [...current, scope]
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Header onOpenCreate={() => setIsCreateOpen(true)} disabled={loading} />

      {error ? <InlineError>{error}</InlineError> : null}

      {newKeyDetails ? (
        <GlassCard className="flex flex-col gap-4 border-ok/40 bg-ok/5 p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ok/20 text-ok">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} color="currentColor" strokeWidth={2} />
                </span>
                <h2 className="text-base font-semibold text-ink">
                  New API Key Created: {newKeyDetails.name}
                </h2>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Copy your secret key immediately. For security, it will{" "}
                <span className="font-semibold text-ink">never be shown again</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewKeyDetails(null)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-muted hover:text-ink"
            >
              I have saved this key
            </button>
          </div>

          <CodeBlock title="X-API-Key" code={newKeyDetails.apiKey} />
          <CodeBlock title="Integration snippet" code={newKeyDetails.snippet} />
        </GlassCard>
      ) : null}

      {loading ? (
        <GlassCard className="flex items-center justify-center py-16">
          <Spinner />
        </GlassCard>
      ) : keys.length === 0 ? (
        <EmptyState
          icon={Key01Icon}
          title="No API keys found"
          body="Generate an API key for your applications or CI pipelines to send data to this project."
          action={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)]"
            >
              Create your first API key
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              {keys.length} {keys.length === 1 ? "Key" : "Keys"} configured
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {keys.map((key) => {
              const isRevoked = key.status === "revoked";
              const isGrace = key.status === "grace_period";

              return (
                <GlassCard
                  key={key.id}
                  className={`flex flex-col gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                    isRevoked ? "opacity-60" : isGrace ? "border-sev-warning/30 bg-sev-warning/5" : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{key.name}</span>
                      <StatusBadge status={key.status} expiresAt={key.expires_at} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-line bg-surface px-2.5 py-1 font-mono text-xs text-ink">
                        {key.api_key_prefix}••••••••••••
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {key.scopes.map((scope) => (
                          <ScopeBadge key={scope} scope={scope} />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span>
                        <strong className="text-ink font-medium">
                          {formatCount(key.request_count)}
                        </strong>{" "}
                        requests
                      </span>
                      <span>•</span>
                      <span>
                        Last used:{" "}
                        {key.last_used_at ? (
                          <span className="text-ink">
                            {formatRelativeTime(key.last_used_at)}
                          </span>
                        ) : (
                          "Never"
                        )}
                      </span>
                      <span>•</span>
                      <span>Created {formatDateTime(key.created_at)}</span>
                    </div>
                  </div>

                  {!isRevoked ? (
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKey(key);
                          setRotateGraceHours(24);
                          setIsRotateOpen(true);
                        }}
                        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-sev-warning/50 hover:text-sev-warning"
                      >
                        Rotate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKey(key);
                          setIsRevokeOpen(true);
                        }}
                        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-sev-critical/50 hover:text-sev-critical"
                      >
                        Revoke
                      </button>
                    </div>
                  ) : null}
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create API Key */}
      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Project API Key"
      >
        <form onSubmit={handleCreateKey} className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">Create API Key</h3>
            <p className="mt-1 text-sm text-muted">
              Provision a scoped credential for applications, CI/CD pipelines, or team members.
            </p>
          </div>

          <TextField
            label="Key Name"
            placeholder="e.g. Production Backend, Mobile App, CI Sourcemaps"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Scopes & Permissions
            </span>
            <div className="flex flex-col gap-2">
              {AVAILABLE_SCOPES.map((scope) => {
                const checked = createScopes.includes(scope.id);
                return (
                  <label
                    key={scope.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-accent/60 bg-accent/10"
                        : "border-line bg-surface hover:border-line/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleScope(scope.id)}
                      className="mt-0.5 h-4 w-4 rounded border-line accent-accent"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{scope.label}</span>
                      <span className="text-xs text-muted">{scope.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <SubmitButton
              loading={submitting}
              loadingLabel="Creating key…"
              className="w-auto px-5"
            >
              Generate Key
            </SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Modal: Rotate API Key with Grace Period */}
      <Modal
        open={isRotateOpen}
        onClose={() => setIsRotateOpen(false)}
        title="Rotate API Key"
      >
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Rotate Key: {selectedKey?.name}
            </h3>
            <p className="mt-1 text-sm text-muted">
              A fresh key will be generated. You can specify a grace period so existing services
              don&apos;t drop errors while updating their configuration.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Grace Period Window
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { hours: 24, label: "24 Hours (Recommended)", desc: "Best for zero-downtime deploy" },
                { hours: 1, label: "1 Hour", desc: "Short turnaround rollout" },
                { hours: 168, label: "7 Days", desc: "Multi-service phased rollout" },
                { hours: 0, label: "Immediate (0h)", desc: "Invalidate previous key now" },
              ].map((opt) => (
                <label
                  key={opt.hours}
                  className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-colors ${
                    rotateGraceHours === opt.hours
                      ? "border-accent/60 bg-accent/10"
                      : "border-line bg-surface hover:border-line/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="grace"
                      checked={rotateGraceHours === opt.hours}
                      onChange={() => setRotateGraceHours(opt.hours)}
                      className="accent-accent"
                    />
                    <span className="text-sm font-medium text-ink">{opt.label}</span>
                  </div>
                  <span className="mt-1 text-xs text-muted pl-5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRotateOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <SubmitButton
              loading={submitting}
              loadingLabel="Rotating key…"
              onClick={() => void handleRotateKey()}
              className="w-auto px-5"
            >
              Confirm Rotation
            </SubmitButton>
          </div>
        </div>
      </Modal>

      {/* Modal: Revoke API Key */}
      <Modal
        open={isRevokeOpen}
        onClose={() => setIsRevokeOpen(false)}
        title="Revoke API Key"
      >
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-semibold text-sev-critical">
              Revoke Key: {selectedKey?.name}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Are you sure you want to revoke key{" "}
              <code className="font-mono text-ink">
                {selectedKey?.api_key_prefix}••••••••••••
              </code>
              ? Any server, microservice or script sending events with this key will immediately be{" "}
              <strong className="text-sev-critical">rejected with 401 Unauthorized</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRevokeOpen(false)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleRevokeKey()}
              className="rounded-lg bg-sev-critical px-5 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Revoking…" : "Revoke Key Immediately"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Header({
  onOpenCreate,
  disabled,
}: {
  onOpenCreate: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">API Keys</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Manage scoped ingestion, sourcemaps, and read credentials for your applications.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onOpenCreate}
        className="inline-flex items-center gap-2 self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] disabled:opacity-50 sm:self-auto"
      >
        <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
        Create API key
      </button>
    </div>
  );
}

function StatusBadge({
  status,
  expiresAt,
}: {
  status: string;
  expiresAt: string | null;
}) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 font-mono text-[11px] text-ok">
        <span className="h-1.5 w-1.5 rounded-full bg-ok" />
        Active
      </span>
    );
  }

  if (status === "grace_period") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sev-warning/30 bg-sev-warning/10 px-2 py-0.5 font-mono text-[11px] text-sev-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-sev-warning animate-pulse" />
        Grace Period {expiresAt ? `(until ${formatDateTime(expiresAt)})` : ""}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
      Revoked
    </span>
  );
}

function ScopeBadge({ scope }: { scope: ApiKeyScope }) {
  switch (scope) {
    case "ingest_only":
      return (
        <span className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-400">
          ingest
        </span>
      );
    case "sourcemaps_upload":
      return (
        <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
          sourcemaps
        </span>
      );
    case "read_only":
      return (
        <span className="rounded border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] text-purple-400">
          read-only
        </span>
      );
    case "full_access":
      return (
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
          full-access
        </span>
      );
    default:
      return (
        <span className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
          {scope}
        </span>
      );
  }
}

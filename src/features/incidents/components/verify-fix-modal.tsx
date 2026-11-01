"use client";

import { useState } from "react";

import { InlineError } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { verifyIncidentFix } from "@/services/incidents";
import type { Incident } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

export type VerifyFixModalProps = {
  open: boolean;
  onClose: () => void;
  incidentId: string;
  onComplete: (updated: Incident) => void;
};

export function VerifyFixModal({
  open,
  onClose,
  incidentId,
  onComplete,
}: VerifyFixModalProps) {
  const [release, setRelease] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [notes, setNotes] = useState("");
  const [autoResolve, setAutoResolve] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!release.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const { incident: updated } = await verifyIncidentFix(incidentId, {
        release: release.trim(),
        commit_sha: commitSha.trim() || undefined,
        notes: notes.trim() || undefined,
        auto_resolve: autoResolve,
      });
      onComplete(updated);
      onClose();
      setRelease("");
      setCommitSha("");
      setNotes("");
      setAutoResolve(false);
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title="Verify Fix in Release"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Verify Fix in Deployment
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            Attach deployment evidence to this incident’s timeline and transition to{" "}
            <span className="text-[#a78bfa]">Fix verified</span>. If the error re-occurs, TrazeIQ will automatically reopen the incident.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-muted">
              Release / Version <span className="text-sev-critical">*</span>
            </label>
            <input
              type="text"
              required
              value={release}
              onChange={(e) => setRelease(e.target.value)}
              placeholder="e.g. v1.4.3 or commit-hash"
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-muted">
              Commit SHA (optional)
            </label>
            <input
              type="text"
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              placeholder="e.g. 4f81b37abc"
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-muted">
              Verification Notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Increased replica pool size and added timeout fallback."
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={autoResolve}
              onChange={(e) => setAutoResolve(e.target.checked)}
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-line bg-surface text-accent focus:ring-accent"
            />
            <div className="text-xs">
              <span className="font-medium text-ink">Auto-resolve incident</span>
              <p className="text-muted">
                Mark as Resolved immediately with verification evidence. (Auto-reopens if error returns).
              </p>
            </div>
          </label>
        </div>

        {error ? <InlineError>{error}</InlineError> : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-9 rounded-lg border border-line bg-surface px-4 font-mono text-xs text-muted transition-colors hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!release.trim() || submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#8b5cf6] px-4 font-mono text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5cf6]"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying…
              </>
            ) : (
              "Verify Fix"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Hallmark · component: bulk-status-modal · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import { InlineError } from "@/components/ui/form";
import { bulkUpdateIncidents } from "@/services/incidents";
import type { Incident, IncidentStatus } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

const STATUS_OPTIONS: Array<{
  value: IncidentStatus;
  label: string;
  dot: string;
  description: string;
}> = [
  {
    value: "open",
    label: "Open",
    dot: "bg-sev-critical",
    description: "New and active, awaiting triage or investigation.",
  },
  {
    value: "investigating",
    label: "Investigating",
    dot: "bg-sev-warning",
    description: "Actively being looked into by an engineer.",
  },
  {
    value: "resolved",
    label: "Resolved",
    dot: "bg-ok",
    description: "Fixed and verified, closed from active monitoring.",
  },
  {
    value: "ignored",
    label: "Ignored",
    dot: "bg-muted",
    description: "Muted or acknowledged as non-actionable.",
  },
];

export type BulkStatusModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: (updated: Incident[]) => void;
};

export function BulkStatusModal({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedIds.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await bulkUpdateIncidents({
        incident_ids: selectedIds,
        status: selectedStatus,
      });
      onComplete(result.incidents);
      onClose();
      setSelectedStatus(null);
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
      title={`Update status for ${count} incident${count === 1 ? "" : "s"}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Update status
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            Apply a new status to {count} selected incident{count === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Incident status">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedStatus(opt.value)}
                disabled={submitting}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isSelected
                    ? "border-accent/60 bg-accent/10"
                    : "border-line bg-surface hover:border-line-soft hover:bg-bg-panel"
                }`}
              >
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${opt.dot}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {opt.label}
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-accent bg-accent"
                          : "border-line bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
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
            disabled={!selectedStatus || submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 font-mono text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating…
              </>
            ) : (
              `Update ${count} incident${count === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

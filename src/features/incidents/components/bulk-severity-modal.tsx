/* Hallmark · component: bulk-severity-modal · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import { InlineError } from "@/components/ui/form";
import { bulkUpdateIncidents } from "@/services/incidents";
import type { Incident, IncidentSeverity } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

const SEVERITY_OPTIONS: Array<{
  value: IncidentSeverity;
  label: string;
  dot: string;
  description: string;
}> = [
  {
    value: "critical",
    label: "Critical",
    dot: "bg-sev-critical",
    description: "Fatal errors, outages, or catastrophic failures requiring immediate triage.",
  },
  {
    value: "high",
    label: "High",
    dot: "bg-sev-high",
    description: "Major feature failure or unhandled exceptions impacting customers.",
  },
  {
    value: "medium",
    label: "Medium",
    dot: "bg-sev-warning",
    description: "Degraded performance, recoverable errors, or unhandled warnings.",
  },
  {
    value: "low",
    label: "Low",
    dot: "bg-sev-low",
    description: "Informational anomalies, deprecations, or non-critical notices.",
  },
];

export type BulkSeverityModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: (updated: Incident[]) => void;
};

export function BulkSeverityModal({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkSeverityModalProps) {
  const [selectedSeverity, setSelectedSeverity] =
    useState<IncidentSeverity | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedIds.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeverity || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await bulkUpdateIncidents({
        incident_ids: selectedIds,
        severity: selectedSeverity,
      });
      onComplete(result.incidents);
      onClose();
      setSelectedSeverity(null);
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
      title={`Update severity for ${count} incident${count === 1 ? "" : "s"}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Update severity
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            Apply a new severity level to {count} incident{count === 1 ? "" : "s"}.
          </p>
        </div>

        <div
          className="flex flex-col gap-2"
          role="radiogroup"
          aria-label="Incident severity"
        >
          {SEVERITY_OPTIONS.map((opt) => {
            const isSelected = selectedSeverity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedSeverity(opt.value)}
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
            disabled={!selectedSeverity || submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 font-mono text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating…
              </>
            ) : (
              `Update severity`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* Hallmark · component: bulk-resolve-modal · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircleIcon } from "@hugeicons/core-free-icons";

import { Modal } from "@/components/ui/modal";
import { InlineError } from "@/components/ui/form";
import { bulkResolveIncidents } from "@/services/incidents";
import type { Incident } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

export type BulkResolveModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: (updated: Incident[]) => void;
};

export function BulkResolveModal({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkResolveModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedIds.length;

  const handleResolve = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await bulkResolveIncidents(selectedIds);
      onComplete(result.incidents);
      onClose();
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
      title={`Resolve ${count} incident${count === 1 ? "" : "s"}`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ok/30 bg-ok/10 text-ok">
            <HugeiconsIcon
              icon={CheckmarkCircleIcon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Resolve {count} incident{count === 1 ? "" : "s"}?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              This will mark {count === 1 ? "the selected incident" : `all ${count} selected incidents`} as resolved and record the resolution in the incident timeline.
            </p>
          </div>
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
            type="button"
            onClick={handleResolve}
            disabled={submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-ok/30 bg-ok/10 px-4 font-mono text-xs font-medium text-ok transition-colors hover:bg-ok/20 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ok"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-ok/30 border-t-ok" />
                Resolving…
              </>
            ) : (
              `Resolve ${count} incident${count === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

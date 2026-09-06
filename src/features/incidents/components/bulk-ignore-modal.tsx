/* Hallmark · component: bulk-ignore-modal · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Archive01Icon } from "@hugeicons/core-free-icons";

import { Modal } from "@/components/ui/modal";
import { InlineError } from "@/components/ui/form";
import { bulkIgnoreIncidents, type BulkUpdateResult } from "@/services/incidents";
import { apiErrorMessage } from "@/utils/errors";

export type BulkIgnoreModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: (result: BulkUpdateResult) => void;
};

export function BulkIgnoreModal({
  open,
  onClose,
  selectedIds,
  onComplete,
}: BulkIgnoreModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedIds.length;

  const handleIgnore = async () => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await bulkIgnoreIncidents(selectedIds);
      onComplete(result);
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
      title={`Ignore ${count} incident${count === 1 ? "" : "s"}`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
            <HugeiconsIcon
              icon={Archive01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Ignore {count} incident{count === 1 ? "" : "s"}?
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              This will archive {count === 1 ? "the selected incident" : `all ${count} selected incidents`} as ignored — {count === 1 ? "it leaves" : "they leave"} the active workflow without counting as fixed. You can reopen {count === 1 ? "it" : "them"} any time.
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
            onClick={handleIgnore}
            disabled={submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line bg-bg-panel px-4 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
                Ignoring…
              </>
            ) : (
              `Ignore ${count} incident${count === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

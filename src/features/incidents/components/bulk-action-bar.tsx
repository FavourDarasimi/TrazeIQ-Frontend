/* Hallmark · component: bulk-action-bar · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircleIcon,
  Cancel01Icon,
  UserIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons";

export type BulkActionBarProps = {
  selectedCount: number;
  onResolve: () => void;
  onUpdateStatus: () => void;
  onAssign: () => void;
  onClear: () => void;
};

export function BulkActionBar({
  selectedCount,
  onResolve,
  onUpdateStatus,
  onAssign,
  onClear,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl"
          role="region"
          aria-label="Bulk actions"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 items-center justify-center rounded-full bg-accent/20 px-2 font-mono text-[11px] font-semibold text-accent">
                {selectedCount}
              </span>
              <span className="font-mono text-xs font-medium text-ink">
                selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onResolve}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ok/30 bg-ok/10 px-3 font-mono text-xs font-medium text-ok transition-colors hover:bg-ok/20 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ok"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircleIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Resolve
              </button>

              <button
                type="button"
                onClick={onUpdateStatus}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon
                  icon={FilterIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Status
              </button>

              <button
                type="button"
                onClick={onAssign}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-bg-panel px-3 font-mono text-xs font-medium text-ink transition-colors hover:border-line-soft hover:bg-surface active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon
                  icon={UserIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Assign
              </button>

              <div className="h-4 w-px bg-line" aria-hidden="true" />

              <button
                type="button"
                onClick={onClear}
                aria-label="Clear selection"
                className="inline-flex h-8 items-center gap-1 rounded-lg px-2 font-mono text-xs text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

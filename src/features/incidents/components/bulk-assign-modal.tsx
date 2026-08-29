/* Hallmark · component: bulk-assign-modal · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Cancel01Icon } from "@hugeicons/core-free-icons";

import { Modal } from "@/components/ui/modal";
import { InlineError } from "@/components/ui/form";
import { Spinner } from "@/components/ui/glass-card";
import { useAuth } from "@/providers/auth-provider";
import { bulkAssignIncidents } from "@/services/incidents";
import { listMembers } from "@/services/organizations";
import type { Incident, OrganizationMembership } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

export type BulkAssignModalProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  organizationId: string | null;
  onComplete: (updated: Incident[]) => void;
};

export function BulkAssignModal({
  open,
  onClose,
  selectedIds,
  organizationId,
  onComplete,
}: BulkAssignModalProps) {
  const [members, setMembers] = useState<OrganizationMembership[] | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | "unassign" | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedIds.length;
  const { status: authStatus } = useAuth();

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!open || !organizationId) return;

    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start request state
    setLoadingMembers(true);
    setError(null);

    listMembers(organizationId, controller.signal)
      .then(({ members: memberRows }) => {
        setMembers(memberRows);
        setLoadingMembers(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
        setLoadingMembers(false);
      });

    return () => controller.abort();
  }, [authStatus, open, organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId === null || submitting) return;

    setSubmitting(true);
    setError(null);

    const targetUser = selectedUserId === "unassign" ? null : selectedUserId;

    try {
      const result = await bulkAssignIncidents(selectedIds, targetUser);
      onComplete(result.incidents);
      onClose();
      setSelectedUserId(null);
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
      title={`Assign ${count} incident${count === 1 ? "" : "s"}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Assign incidents
          </h2>
          <p className="mt-1 font-mono text-xs text-muted">
            Choose a team member to assign {count} selected incident{count === 1 ? "" : "s"} to.
          </p>
        </div>

        {loadingMembers ? (
          <Spinner label="loading team members…" />
        ) : (
          <div
            className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1"
            role="radiogroup"
            aria-label="Assign to team member"
          >
            {/* Unassign option */}
            <button
              type="button"
              role="radio"
              aria-checked={selectedUserId === "unassign"}
              onClick={() => setSelectedUserId("unassign")}
              disabled={submitting}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                selectedUserId === "unassign"
                  ? "border-accent/60 bg-accent/10"
                  : "border-line bg-surface hover:border-line-soft hover:bg-bg-panel"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-bg-panel text-muted">
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">Unassigned</p>
                  <p className="text-xs text-muted">Remove current assignment</p>
                </div>
              </div>
              <span
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  selectedUserId === "unassign"
                    ? "border-accent bg-accent"
                    : "border-line bg-transparent"
                }`}
              >
                {selectedUserId === "unassign" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>

            {members?.map((member) => {
              const isSelected = selectedUserId === member.user_id;
              return (
                <button
                  key={member.user_id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedUserId(member.user_id)}
                  disabled={submitting}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isSelected
                      ? "border-accent/60 bg-accent/10"
                      : "border-line bg-surface hover:border-line-soft hover:bg-bg-panel"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-panel text-muted">
                      <HugeiconsIcon
                        icon={UserIcon}
                        size={14}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {member.user}
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-accent bg-accent"
                        : "border-line bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

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
            disabled={selectedUserId === null || submitting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 font-mono text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {submitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Assigning…
              </>
            ) : (
              `Assign ${count} incident${count === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

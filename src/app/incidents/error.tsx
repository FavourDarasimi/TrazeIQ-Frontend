"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

/** Incidents segment boundary — a broken list/detail never kills the shell. */
export default function IncidentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Incidents crash:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <ErrorState
        title="Incidents failed to load"
        body="The incident list or detail view crashed while rendering. Live updates keep flowing — try again to pick them up."
        onRetry={reset}
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

/** Dashboard segment boundary — a broken chart never kills the shell. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard crash:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <ErrorState
        title="Dashboard failed to load"
        body="The overview charts crashed while rendering. Your projects and incidents are unaffected — try again."
        onRetry={reset}
      />
    </div>
  );
}

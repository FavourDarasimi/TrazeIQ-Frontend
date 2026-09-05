"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

/** Root segment boundary — catches render failures anywhere in the app. */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TrazeIQ crash:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-16">
      <ErrorState
        title="Something went wrong"
        body="TrazeIQ hit an unexpected error rendering this page. Your data is safe — try again, or head back to the dashboard."
        onRetry={reset}
      />
    </div>
  );
}

"use client";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Last-resort boundary — renders when even the root layout fails, so it
 * must carry its own <html>/<body> and cannot import layout code.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#000",
          color: "#FAFAFA",
          fontFamily: "Inter, system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "32rem", width: "100%" }}>
          <ErrorState
            title="Something went wrong"
            body="TrazeIQ hit an unexpected error and could not load the page shell. Reloading usually fixes it."
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, SlackIcon } from "@hugeicons/core-free-icons";

import { GlassCard } from "@/components/ui/glass-card";

function SlackCallback() {
  const params = useSearchParams();
  const [state, setState] = useState<"connecting" | "done" | "error">("connecting");

  useEffect(() => {
    const code = params.get("code");
    const error = params.get("error");

    if (!window.opener) {
      setState("error");
      return;
    }

    if (error || !code) {
      window.opener.postMessage(
        { type: "slack-oauth-code", code: null, error: error ?? "no_code" },
        window.location.origin,
      );
      setState("error");
      window.setTimeout(() => window.close(), 1200);
      return;
    }

    window.opener.postMessage(
      { type: "slack-oauth-code", code },
      window.location.origin,
    );
    setState("done");
    window.setTimeout(() => window.close(), 800);
  }, [params]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <GlassCard className="flex max-w-sm flex-col items-center gap-4 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
          <HugeiconsIcon icon={SlackIcon} size={24} color="currentColor" strokeWidth={1.5} />
        </span>
        {state === "error" ? (
          <>
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              Slack connection failed
            </h1>
            <p className="flex items-center gap-2 text-sm text-sev-critical">
              <HugeiconsIcon icon={Alert02Icon} size={16} color="currentColor" strokeWidth={1.5} />
              You can close this window and try again.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              {state === "done" ? "Connected" : "Connecting…"}
            </h1>
            <p className="text-sm text-muted">
              {state === "done"
                ? "Returning to TrazeIQ. This window will close shortly."
                : "Finishing the Slack connection."}
            </p>
          </>
        )}
      </GlassCard>
    </div>
  );
}

export default function SlackCallbackRoute() {
  return (
    <Suspense>
      <SlackCallback />
    </Suspense>
  );
}

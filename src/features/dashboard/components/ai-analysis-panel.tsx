"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, SparklesIcon } from "@hugeicons/core-free-icons";

import { GlassCard } from "@/components/ui/glass-card";
import { InlineError } from "@/components/ui/form";
import { getIncidentAnalysis, triggerIncidentAnalysis } from "@/services/ai";
import type { AIAnalysis, AnalysisConfidence } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

const POLL_INTERVAL_MS = 4000;

// A brand-new incident's analysis row may not exist yet when the page loads
// (the Celery job creates it moments later). Give it a short grace window of
// polls before falling back to the manual trigger.
const IDLE_GRACE_POLLS = 3;

type PanelState = "loading" | "idle" | "pending" | "ready" | "failed" | "error";

const CONFIDENCE_LABELS: Record<AnalysisConfidence, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function AIHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-accent">
          <HugeiconsIcon icon={SparklesIcon} size={20} color="currentColor" strokeWidth={1.5} />
        </span>
        <h2 className="text-sm font-semibold tracking-tight text-ink">
          AI Analysis
        </h2>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-accent">
          <HugeiconsIcon icon={SparklesIcon} size={10} color="currentColor" strokeWidth={1.5} />
          AI
        </span>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: AnalysisConfidence }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      Confidence: {CONFIDENCE_LABELS[confidence]}
    </span>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
      {children}
    </p>
  );
}

function AnalyzingState() {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/70"
              style={{ animationDelay: `${dot * 0.18}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-muted">AI analyzing…</span>
      </div>
      <p className="text-xs text-muted/70">
        Root cause analysis runs in the background. This updates automatically
        once it resolves.
      </p>
    </div>
  );
}

export function AIAnalysisPanel({ incidentId }: { incidentId: string }) {
  const [state, setState] = useState<PanelState>("loading");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let idlePolls = 0;
    timerRef.current = null;

    function scheduleNext() {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!cancelled) tick();
      }, POLL_INTERVAL_MS);
    }

    function tick() {
      getIncidentAnalysis(incidentId)
        .then(({ analysis: result }) => {
          if (cancelled) return;
          setAnalysis(result);
          if (result.status === "pending") {
            setState("pending");
            scheduleNext();
          } else if (result.status === "ready") {
            setState("ready");
          } else {
            setState("failed");
          }
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          const status = (err as { status?: number }).status;
          if (status === 404) {
            idlePolls += 1;
            if (idlePolls <= IDLE_GRACE_POLLS) {
              setState("pending");
              scheduleNext();
            } else {
              setState("idle");
            }
          } else {
            setError(apiErrorMessage(err));
            setState("error");
          }
        });
    }

    tickRef.current = tick;
    tick();

    return () => {
      cancelled = true;
      tickRef.current = () => {};
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [incidentId]);

  async function handleRun() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { analysis: result } = await triggerIncidentAnalysis(incidentId);
      setAnalysis(result);
      setState("pending");
      setError(null);
      tickRef.current();
    } catch (err) {
      setError(apiErrorMessage(err));
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  function handleRetry() {
    setError(null);
    setState("loading");
    tickRef.current();
  }

  return (
    <GlassCard className="border-accent/30 p-6 shadow-[0_0_30px_rgba(79,70,229,0.12)]">
      <AIHeader />

      {state === "loading" ? (
        <div className="mt-5 flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-soft border-t-accent" />
          <span className="text-sm text-muted">Checking for analysis…</span>
        </div>
      ) : null}

      {state === "idle" ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            No AI analysis exists for this incident yet. Run one to get a root
            cause and suggested fix.
          </p>
          <button
            type="button"
            onClick={handleRun}
            disabled={busy}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/40 border-t-accent" aria-hidden />
            ) : (
              <HugeiconsIcon icon={SparklesIcon} size={15} color="currentColor" strokeWidth={1.5} />
            )}
            Run analysis
          </button>
        </div>
      ) : null}

      {state === "pending" ? <AnalyzingState /> : null}

      {state === "ready" && analysis ? (
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Root cause</SectionLabel>
            <p className="text-sm leading-relaxed text-ink">{analysis.root_cause}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Suggested fix</SectionLabel>
            <p className="text-sm leading-relaxed text-ink">{analysis.suggested_fix}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {analysis.confidence ? (
              <ConfidenceBadge confidence={analysis.confidence} />
            ) : null}
            {analysis.model_used ? (
              <span className="font-mono text-[11px] text-muted">
                via {analysis.model_used}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {state === "failed" ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            The AI couldn&apos;t analyze this incident — the model either
            returned malformed output or the analysis job failed. You can retry.
          </p>
          <button
            type="button"
            onClick={handleRun}
            disabled={busy}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/40 border-t-accent" aria-hidden />
            ) : (
              <HugeiconsIcon icon={RefreshIcon} size={15} color="currentColor" strokeWidth={1.5} />
            )}
            Retry analysis
          </button>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="mt-5 flex flex-col items-start gap-3">
          <InlineError>{error ?? "Could not load the analysis."}</InlineError>
          <button
            type="button"
            onClick={handleRetry}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : null}
    </GlassCard>
  );
}
/* Hallmark · component: first-tour · genre: modern-minimal · theme: custom
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BellIcon,
  Cancel01Icon,
  CheckmarkCircleIcon,
  FlashIcon,
  SparklesIcon,
  TerminalIcon,
} from "@hugeicons/core-free-icons";

export const TOUR_STORAGE_KEY = "trazeiq_tour_dismissed";
export const PENDING_TOUR_KEY = "trazeiq_pending_tour";

// Armed only when a brand-new user finishes onboarding and continues to the
// dashboard — the sole trigger for auto-opening the product tour.
export function armTourForNewUser() {
  try {
    window.sessionStorage.setItem(PENDING_TOUR_KEY, "1");
  } catch {
    // Storage unavailable
  }
}

type TourStep = {
  id: string;
  stepNumber: string;
  tag: string;
  icon: typeof TerminalIcon;
  title: string;
  subtitle: string;
  description: string;
  highlightText: string;
  snippet?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "ingest",
    stepNumber: "01",
    tag: "INGESTION",
    icon: TerminalIcon,
    title: "Ingest errors via REST API",
    subtitle: "Automated fingerprinting & grouping",
    description:
      "Send error payloads and unhandled exceptions to /api/v1/events/ using your project's X-API-Key header. TrazeIQ automatically fingerprints stack traces and groups occurrences into deduplicated incidents.",
    highlightText: "Send your first event",
    snippet: `curl -X POST https://api.trazeiq.io/api/v1/events/ \\
  -H "X-API-Key: trq_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"message": "DatabaseError: connection pool exhausted", "level": "error"}'`,
  },
  {
    id: "incidents",
    stepNumber: "02",
    tag: "TRIAGE",
    icon: FlashIcon,
    title: "Track & manage incidents",
    subtitle: "Realtime triage with bulk workflows",
    description:
      "Navigate to the Incidents tab to monitor live issues. Filter by severity or status, inspect occurrence frequencies, and use multi-select checkboxes to bulk-resolve or assign incidents across your team.",
    highlightText: "Live status & severity triage",
  },
  {
    id: "ai-copilot",
    stepNumber: "03",
    tag: "INTELLIGENCE",
    icon: SparklesIcon,
    title: "AI root-cause analysis",
    subtitle: "Actionable diagnostics & fixes",
    description:
      "Every incident includes an AI Incident Copilot. It inspects stack traces, isolates underlying root causes (e.g. connection pool exhaustion, memory leak), and generates suggested fixes with confidence scores.",
    highlightText: "Powered by Gemini 2.0 Flash",
  },
  {
    id: "alerts",
    stepNumber: "04",
    tag: "ALERTING",
    icon: BellIcon,
    title: "Automate alert channels",
    subtitle: "Slack, Email, and Webhook routing",
    description:
      "Head over to Settings → Alerts to configure automated notification rules. Route high and critical severity incidents straight to your team's Slack channels or on-call emails with cooldown protection.",
    highlightText: "Instant incident dispatch",
  },
];

export function FirstTourModal() {
  const [open, setOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(PENDING_TOUR_KEY) !== "1") return;
      window.sessionStorage.removeItem(PENDING_TOUR_KEY);
      // Belt-and-suspenders: an already-dismissed browser never re-tours.
      if (window.localStorage.getItem(TOUR_STORAGE_KEY) === "true") return;
      const timer = setTimeout(() => {
        setOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable
    }
    setOpen(false);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!open) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const animationProps = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 12 },
        transition: { duration: 0.2, ease: "easeOut" as const },
      };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Modal Surface */}
        <motion.div
          {...animationProps}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header Step Counter & Dismiss */}
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 items-center rounded-full bg-accent/15 px-2.5 font-mono text-[11px] font-semibold text-accent">
                {currentStep.tag}
              </span>
              <span className="font-mono text-xs text-muted">
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close tour"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Step Body */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                <HugeiconsIcon
                  icon={currentStep.icon}
                  size={22}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="tour-modal-title"
                  className="text-lg font-semibold tracking-tight text-ink"
                >
                  {currentStep.title}
                </h2>
                <p className="font-mono text-xs text-muted">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted">
              {currentStep.description}
            </p>

            {/* Optional code snippet or highlight card */}
            {currentStep.snippet ? (
              <div className="rounded-xl border border-line bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-ink/90 overflow-x-auto">
                <pre className="text-muted/80">
                  <code>{currentStep.snippet}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 rounded-xl border border-line/60 bg-bg-panel/60 px-3.5 py-2.5 font-mono text-xs text-ink/80">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span>{currentStep.highlightText}</span>
              </div>
            )}
          </div>

          {/* Step Progress Indicators */}
          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? "w-6 bg-accent"
                      : "w-1.5 bg-line-soft hover:bg-muted"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2.5">
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 font-mono text-xs font-medium text-muted transition-colors hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={14}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  Back
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 font-mono text-xs font-medium text-white shadow-[0_0_20px_rgba(79,70,229,0.25)] transition-all hover:bg-accent/90 hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {isLast ? (
                  <>
                    <HugeiconsIcon
                      icon={CheckmarkCircleIcon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    Get started
                  </>
                ) : (
                  <>
                    Next
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={14}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer "Skip tour" */}
          <div className="mt-4 flex items-center justify-end text-xs text-muted">
            <button
              type="button"
              onClick={handleDismiss}
              className="font-mono text-[11px] text-muted hover:text-ink underline-offset-2 hover:underline transition-colors"
            >
              Skip tour
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

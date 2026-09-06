"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DependencyList,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Alert02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { API_ROUTES, incidentDetailUrl } from "@/constants";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useProjectContext } from "@/features/app/components/project-context";
import type { AIAnalysis, Incident, IncidentSeverity } from "@/types";

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "";
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1";

export type RealtimeEvent =
  | { type: "incident.created"; incident: Incident }
  | { type: "incident.updated"; incident: Incident }
  | { type: "incident.resolved"; incident: Incident }
  | { type: "ai_analysis.ready"; incident: Incident; analysis: AIAnalysis };

type RealtimeEventPayload = {
  incident?: Incident;
  analysis?: AIAnalysis;
};

export type RealtimeStatus = "live" | "connecting" | "degraded" | "off";

type RealtimeContextValue = {
  subscribe: (listener: (event: RealtimeEvent) => void) => () => void;
  status: RealtimeStatus;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const TOAST_BORDER: Record<IncidentSeverity, string> = {
  critical: "border-l-sev-critical",
  high: "border-l-sev-high",
  medium: "border-l-sev-warning",
  low: "border-l-sev-low",
};

const TOAST_ICON: Record<IncidentSeverity, string> = {
  critical: "text-sev-critical",
  high: "text-sev-high",
  medium: "text-sev-warning",
  low: "text-sev-low",
};

type Toast = {
  id: number;
  incident: Incident;
};

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="status"
      className={`w-80 border border-line bg-bg-panel shadow-[0_8px_30px_rgba(0,0,0,0.35)] border-l-2 rounded-md ${TOAST_BORDER[toast.incident.severity]}`}
    >
      <Link
        href={incidentDetailUrl(toast.incident.id)}
        className="flex items-start gap-3 p-3"
        onClick={onDismiss}
      >
        <HugeiconsIcon
          icon={Alert02Icon}
          size={20}
          color="currentColor"
          strokeWidth={1.5}
          className={`mt-0.5 shrink-0 ${TOAST_ICON[toast.incident.severity]}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            New {toast.incident.severity} incident
          </p>
          <p className="truncate text-sm text-muted">
            {toast.incident.error_group.title}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(event) => {
            event.preventDefault();
            onDismiss();
          }}
          className="text-muted hover:text-ink"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" strokeWidth={1.5} />
        </button>
      </Link>
    </motion.div>
  );
}

const STATUS_BADGE: Record<
  RealtimeStatus,
  { label: string; dot: string; text: string; pulse: boolean } | null
> = {
  live: {
    label: "Live",
    dot: "bg-ok shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    text: "text-muted",
    pulse: true,
  },
  connecting: {
    label: "Connecting",
    dot: "bg-muted",
    text: "text-muted",
    pulse: true,
  },
  degraded: {
    label: "Polling",
    dot: "bg-sev-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    text: "text-sev-warning",
    pulse: false,
  },
  off: {
    label: "Offline",
    dot: "bg-muted",
    text: "text-muted",
    pulse: false,
  },
};

/**
 * Honest connection indicator. Replaces hardcoded "Live" pills: shows Live
 * only while a subscription is actually succeeding, Polling while the
 * polling fallback is refreshing, and Offline when realtime is unavailable.
 * Hidden for logged-out/project-less states where there is nothing to sync.
 */
export function RealtimeStatusBadge() {
  const { status: authStatus } = useAuth();
  const { selectedProjectId } = useProjectContext();
  const realtimeStatus = useRealtimeStatus();
  if (authStatus !== "authenticated" || selectedProjectId === null) {
    return null;
  }
  const meta = STATUS_BADGE[realtimeStatus];
  if (!meta) return null;
  return (
    <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-line bg-bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:flex">
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${meta.pulse ? "animate-[pulse_2s_ease-in-out_infinite] motion-reduce:animate-none" : ""}`}
      />
      <span className={meta.text}>{meta.label}</span>
    </span>
  );
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const { selectedProjectId } = useProjectContext();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [connStatus, setConnStatus] = useState<RealtimeStatus>("off");
  const listenersRef = useRef<Set<(event: RealtimeEvent) => void>>(new Set());
  const selectedProjectRef = useRef(selectedProjectId);
  const toastIdRef = useRef(0);

  useEffect(() => {
    selectedProjectRef.current = selectedProjectId;
  }, [selectedProjectId]);

  const emit = useCallback((event: RealtimeEvent) => {
    listenersRef.current.forEach((listener) => listener(event));
  }, []);

  useEffect(() => {
    if (PUSHER_KEY === "" || authStatus !== "authenticated" || selectedProjectId === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- connection availability is derived from external inputs
      setConnStatus("off");
      return;
    }

    let pusher: import("pusher-js").default | null = null;
    let disposed = false;
    const channelName = `private-project-${selectedProjectId}`;
    setConnStatus("connecting");

    async function connect() {
      // pusher-js touches browser globals at import time — load it lazily so
      // it never runs during SSR/prerender.
      const { default: Pusher } = await import("pusher-js");
      if (disposed) return;

      pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        channelAuthorization: {
          customHandler: (params, callback) => {
            api<{ auth: string }>(API_ROUTES.pusherAuth, {
              method: "POST",
              body: {
                channel_name: params.channelName,
                socket_id: params.socketId,
              },
            })
              .then(({ auth }) => callback(null, { auth }))
              .catch((err: unknown) => {
                // Auth failures (e.g. the backend's 503 PUSHER_NOT_CONFIGURED
                // when no Pusher creds are provisioned) mean this deployment
                // can never go live — surface degraded immediately instead
                // of retrying silently forever.
                if (!disposed) setConnStatus("degraded");
                callback(err as Error, null);
              });
          },
        },
      });

      const channel = pusher.subscribe(channelName);

      // Subscription outcome is the true liveness signal: the socket can be
      // "connected" while every subscription 403s/503s (the unprovisioned-
      // backend case). Only a successful subscribe means live.
      channel.bind("pusher:subscription_succeeded", () => {
        if (!disposed) setConnStatus("live");
      });
      channel.bind("pusher:subscription_error", () => {
        if (!disposed) setConnStatus("degraded");
      });
      pusher.connection.bind("failed", () => {
        if (!disposed) setConnStatus("degraded");
      });
      pusher.connection.bind("disconnected", () => {
        if (!disposed) setConnStatus("degraded");
      });

      const handle = (type: RealtimeEvent["type"]) => (payload: RealtimeEventPayload) => {
        if (disposed) return;
        const incident = payload?.incident;
        if (!incident || incident.project.id !== selectedProjectRef.current) return;

        if (type === "incident.created") {
          const toast: Toast = { id: ++toastIdRef.current, incident };
          setToasts((current) => [...current, toast]);
          window.setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== toast.id));
          }, 6000);
        }

        const event: RealtimeEvent =
          type === "ai_analysis.ready"
            ? { type, incident, analysis: payload.analysis as AIAnalysis }
            : { type, incident };
        emit(event);
      };

      channel.bind("incident.created", handle("incident.created"));
      channel.bind("incident.updated", handle("incident.updated"));
      channel.bind("incident.resolved", handle("incident.resolved"));
      channel.bind("ai_analysis.ready", handle("ai_analysis.ready"));
    }

    connect();
    return () => {
      disposed = true;
      if (pusher) {
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      }
    };
  }, [authStatus, selectedProjectId, emit]);

  const subscribe = useCallback((listener: (event: RealtimeEvent) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({ subscribe, status: connStatus }),
    [subscribe, connStatus],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastView
                toast={toast}
                onDismiss={() => {
                  setToasts((current) => current.filter((t) => t.id !== toast.id));
                }}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtimeContext must be used within a RealtimeProvider");
  }
  return context;
}

export function useRealtimeStatus(): RealtimeStatus {
  return useRealtimeContext().status;
}

export function useRealtimeEvents(
  listener: (event: RealtimeEvent) => void,
  deps: DependencyList,
) {
  const { subscribe } = useRealtimeContext();
  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });
  useEffect(() => {
    return subscribe((event) => listenerRef.current(event));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
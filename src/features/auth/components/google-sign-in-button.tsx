"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { InlineError } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { googleSignIn } from "@/services/auth";
import { needsOnboarding } from "@/services/workspace";
import { apiErrorMessage } from "@/utils/errors";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GsiCredentialResponse = {
  credential: string;
};

type GsiAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GsiCredentialResponse) => void;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: { theme: "outline"; size: "large"; width: number },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GsiAccounts };
  }
}

let gsiLoadPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.google?.accounts) return Promise.resolve();
  if (!gsiLoadPromise) {
    gsiLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${GIS_SCRIPT_SRC}"]`,
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Google script failed to load")),
        );
        return;
      }
      const script = document.createElement("script");
      script.src = GIS_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google script failed to load"));
      document.head.appendChild(script);
    });
  }
  return gsiLoadPromise;
}

function emailFromIdToken(idToken: string): string {
  const payload = idToken.split(".")[1] ?? "";
  const decoded = JSON.parse(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
  ) as { email?: string };
  return decoded.email ?? "";
}

export function GoogleSignInButton({ email }: { email: string }) {
  const { applySession } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finishSignIn(body: { email: string; id_token?: string }) {
    setBusy(true);
    setError(null);
    try {
      const session = await googleSignIn(body);
      applySession(session);
      router.replace(
        (await needsOnboarding()) ? ROUTES.onboarding : ROUTES.dashboard,
      );
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;
    let cancelled = false;
    loadGisScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            const tokenEmail = emailFromIdToken(response.credential);
            void finishSignIn({ email: tokenEmail, id_token: response.credential });
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Google sign-in is unreachable right now.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time GIS widget setup
  }, []);

  async function handleDevStubSignIn() {
    // Dev-stub mode: no NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured, so the
    // backend trusts the email directly (its documented GOOGLE_CLIENT_ID
    // stub behavior). This path only exists for local development — with a
    // real client ID the GIS button above handles the verified flow.
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email above first.");
      return;
    }
    await finishSignIn({ email: trimmed });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      {GOOGLE_CLIENT_ID ? (
        <div ref={buttonRef} className="flex justify-center [&>div]:!w-full" />
      ) : (
        <button
          type="button"
          onClick={() => void handleDevStubSignIn()}
          disabled={busy}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-line-soft hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true" className="font-semibold">
            G
          </span>
          {busy ? "Connecting…" : "Continue with Google"}
        </button>
      )}

      {error ? <InlineError>{error}</InlineError> : null}
    </div>
  );
}

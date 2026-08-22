"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { needsOnboarding } from "@/services/workspace";

export function RedirectIfAuthenticated({ next }: { next?: string }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    // An authenticated user without a completed workspace still belongs in
    // onboarding, even when landing on the auth pages directly.
    needsOnboarding()
      .then((incomplete) => {
        if (!cancelled) {
          router.replace(
            incomplete ? ROUTES.onboarding : next ?? ROUTES.dashboard,
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status, router, next]);

  return null;
}

export function RequireProtected({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(ROUTES.login);
    }
  }, [status, router]);

  if (status !== "authenticated") return null;
  return <>{children}</>;
}
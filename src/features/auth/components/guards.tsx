"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

export function RedirectIfAuthenticated({ next }: { next?: string }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next ?? ROUTES.onboarding);
    }
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
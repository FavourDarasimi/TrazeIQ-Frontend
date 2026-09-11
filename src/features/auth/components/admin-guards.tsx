"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

export function RedirectIfAuthenticatedAdmin() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user?.is_staff) {
      router.replace(ROUTES.admin);
    }
  }, [status, user, router]);

  return null;
}

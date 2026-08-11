import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";
import { RedirectIfAuthenticated } from "@/features/auth/components/guards";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — TrazeIQ",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <AuthShell
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline">
            Start monitoring
          </Link>
        </span>
      }
    >
      <LoginSearchParams searchParams={searchParams} />
    </AuthShell>
  );
}

async function LoginSearchParams({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  return (
    <>
      <RedirectIfAuthenticated next={safeNext} />
      <LoginForm next={safeNext} />
    </>
  );
}

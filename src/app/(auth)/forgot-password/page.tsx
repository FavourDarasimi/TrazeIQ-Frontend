import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";
import { RedirectIfAuthenticated } from "@/features/auth/components/guards";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password — TrazeIQ",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <AuthShell
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/login" className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <ForgotPasswordSearchParams searchParams={searchParams} />
    </AuthShell>
  );
}

async function ForgotPasswordSearchParams({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <>
      <RedirectIfAuthenticated />
      <ForgotPasswordForm initialEmail={email ?? ""} />
    </>
  );
}

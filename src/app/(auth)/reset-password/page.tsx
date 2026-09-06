import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";
import { RedirectIfAuthenticated } from "@/features/auth/components/guards";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password — TrazeIQ",
};

export default function ResetPasswordPage({
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
      <ResetPasswordSearchParams searchParams={searchParams} />
    </AuthShell>
  );
}

async function ResetPasswordSearchParams({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <>
      <RedirectIfAuthenticated />
      <ResetPasswordForm initialEmail={email ?? ""} />
    </>
  );
}

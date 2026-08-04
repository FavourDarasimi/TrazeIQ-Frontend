import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";
import { RedirectIfAuthenticated } from "@/features/auth/components/guards";
import { RegisterFlow } from "@/features/auth/components/register-flow";

export const metadata: Metadata = {
  title: "Start monitoring — TrazeIQ",
};

export default function RegisterPage() {
  return (
    <AuthShell
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <RedirectIfAuthenticated />
      <RegisterFlow />
    </AuthShell>
  );
}
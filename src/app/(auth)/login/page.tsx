import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/ui/auth-shell";
import { RedirectIfAuthenticated } from "@/features/auth/components/guards";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — TrazeIQ",
};

export default function LoginPage() {
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
      <RedirectIfAuthenticated />
      <LoginForm />
    </AuthShell>
  );
}
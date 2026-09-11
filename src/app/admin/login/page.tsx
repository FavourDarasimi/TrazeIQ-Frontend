import type { Metadata } from "next";

import { AuthShell } from "@/components/ui/auth-shell";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { RedirectIfAuthenticatedAdmin } from "@/features/auth/components/admin-guards";

export const metadata: Metadata = {
  title: "Staff Login — TrazeIQ",
};

export default function AdminLoginPage() {
  return (
    <AuthShell
      footer={
        <span>
          Not a staff member?{" "}
          <a
            href="/login"
            className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline"
          >
            Sign in to your workspace
          </a>
        </span>
      }
    >
      <RedirectIfAuthenticatedAdmin />
      <AdminLoginForm />
    </AuthShell>
  );
}

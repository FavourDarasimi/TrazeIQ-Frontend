import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { RequireProtected } from "@/features/auth/components/guards";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { ProjectProvider } from "@/features/dashboard/components/project-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RequireProtected>
        <ProjectProvider>
          <DashboardShell>{children}</DashboardShell>
        </ProjectProvider>
      </RequireProtected>
    </AuthProvider>
  );
}
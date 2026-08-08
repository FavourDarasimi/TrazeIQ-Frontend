import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { RequireProtected } from "@/features/auth/components/guards";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { ProjectProvider } from "@/features/app/components/project-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RequireProtected>
        <ProjectProvider>
          <RealtimeProvider>
            <DashboardShell>{children}</DashboardShell>
          </RealtimeProvider>
        </ProjectProvider>
      </RequireProtected>
    </AuthProvider>
  );
}
import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { BootstrapGate } from "@/features/auth/components/bootstrap-gate";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BootstrapGate>{children}</BootstrapGate>
    </AuthProvider>
  );
}
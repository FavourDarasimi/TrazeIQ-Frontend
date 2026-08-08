import type { ReactNode } from "react";

import { AppShell } from "@/features/app/components/app-shell";

export default function LogsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
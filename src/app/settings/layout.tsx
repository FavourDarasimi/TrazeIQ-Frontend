import type { ReactNode } from "react";

import { AppShell } from "@/features/app/components/app-shell";
import { SettingsNav } from "@/features/settings/components/settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SettingsNav />
      <div className="pt-6">{children}</div>
    </AppShell>
  );
}

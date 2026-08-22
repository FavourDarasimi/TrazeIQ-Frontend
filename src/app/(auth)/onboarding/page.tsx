import type { Metadata } from "next";

import { AuthShell } from "@/components/ui/auth-shell";
import { RequireProtected } from "@/features/auth/components/guards";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Onboarding — TrazeIQ",
};

export default function OnboardingPage() {
  return (
    <AuthShell header={false}>
      <RequireProtected>
        <OnboardingFlow />
      </RequireProtected>
    </AuthShell>
  );
}

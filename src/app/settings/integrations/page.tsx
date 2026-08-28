import type { Metadata } from "next";

import { IntegrationsSettingsPage } from "@/features/settings/components/integrations-settings-page";

export const metadata: Metadata = {
  title: "Integrations — Settings — TrazeIQ",
};

export default function SettingsIntegrationsRoute() {
  return <IntegrationsSettingsPage />;
}

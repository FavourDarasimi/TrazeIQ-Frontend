import type { Metadata } from "next";

import { ApiKeysSettingsPage } from "@/features/settings/components/api-keys-settings-page";

export const metadata: Metadata = { title: "API keys — TrazeIQ" };

export default function ApiKeysPage() {
  return <ApiKeysSettingsPage />;
}

import type { Metadata } from "next";

import { PreferencesSettingsPage } from "@/features/settings/components/preferences-settings-page";

export const metadata: Metadata = {
  title: "Preferences — Settings — TrazeIQ",
};

export default function SettingsPreferencesRoute() {
  return <PreferencesSettingsPage />;
}

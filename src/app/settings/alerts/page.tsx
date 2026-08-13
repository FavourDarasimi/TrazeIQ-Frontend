import type { Metadata } from "next";

import { AlertSettingsPage } from "@/features/settings/components/alert-settings-page";

export const metadata: Metadata = {
  title: "Alerts — Settings — TrazeIQ",
};

export default function SettingsAlertsRoute() {
  return <AlertSettingsPage />;
}

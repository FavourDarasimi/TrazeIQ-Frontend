import type { Metadata } from "next";

import { SettingsOverviewPage } from "@/features/settings/components/settings-overview-page";

export const metadata: Metadata = {
  title: "Settings — TrazeIQ",
};

export default function SettingsPage() {
  return <SettingsOverviewPage />;
}
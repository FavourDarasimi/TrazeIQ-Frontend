import type { Metadata } from "next";

import { TeamSettingsPage } from "@/features/settings/components/team-settings-page";

export const metadata: Metadata = {
  title: "Team — Settings — TrazeIQ",
};

export default function SettingsTeamRoute() {
  return <TeamSettingsPage />;
}

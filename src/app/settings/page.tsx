import type { Metadata } from "next";

import { ROUTES } from "@/constants";
import { StubRoute } from "@/components/ui/stub-route";

export const metadata: Metadata = {
  title: "Settings — TrazeIQ",
};

export default function SettingsPage() {
  return <StubRoute href={ROUTES.settings} />;
}
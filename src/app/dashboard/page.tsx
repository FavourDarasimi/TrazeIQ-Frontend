import type { Metadata } from "next";

import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export const metadata: Metadata = {
  title: "Overview — TrazeIQ",
};

export default function OverviewPage() {
  return <DashboardPage />;
}
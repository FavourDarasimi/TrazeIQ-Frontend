import type { Metadata } from "next";

import { LogsPage } from "@/features/logs/components/logs-page";

export const metadata: Metadata = {
  title: "Logs — TrazeIQ",
};

export default function LogsRoute() {
  return <LogsPage />;
}
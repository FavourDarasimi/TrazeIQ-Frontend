import type { Metadata } from "next";

import { IncidentListPage } from "@/features/incidents/components/incident-list-page";

export const metadata: Metadata = {
  title: "Incidents — TrazeIQ",
};

export default function IncidentsPage() {
  return <IncidentListPage />;
}
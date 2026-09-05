import type { Metadata } from "next";
import { Suspense } from "react";

import { IncidentListPage } from "@/features/incidents/components/incident-list-page";

export const metadata: Metadata = {
  title: "Incidents — TrazeIQ",
};

export default function IncidentsPage() {
  return (
    <Suspense>
      <IncidentListPage />
    </Suspense>
  );
}

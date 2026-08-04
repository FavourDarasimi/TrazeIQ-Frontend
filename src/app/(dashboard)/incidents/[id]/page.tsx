import type { Metadata } from "next";

import { IncidentDetailPage } from "@/features/dashboard/components/incident-detail-page";

export const metadata: Metadata = {
  title: "Incident — TrazeIQ",
};

export default async function IncidentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incidentId = Number(id);
  if (!Number.isInteger(incidentId)) {
    return (
      <p className="text-sm text-muted">
        Unknown incident identifier — the id must be an integer.
      </p>
    );
  }
  return <IncidentDetailPage incidentId={incidentId} />;
}
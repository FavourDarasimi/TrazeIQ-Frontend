import type { Metadata } from "next";

import { IncidentDetailPage } from "@/features/dashboard/components/incident-detail-page";

export const metadata: Metadata = {
  title: "Incident — TrazeIQ",
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function IncidentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return (
      <p className="text-sm text-muted">
        Unknown incident identifier — the id must be a UUID.
      </p>
    );
  }
  return <IncidentDetailPage incidentId={id} />;
}
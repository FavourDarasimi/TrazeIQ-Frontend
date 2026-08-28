import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/constants";
import { IncidentDetailPage } from "@/features/incidents/components/incident-detail-page";

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
      <EmptyState
        title="Invalid incident ID"
        body="The incident link is malformed — an incident ID must be a UUID. Check the URL or return to the incident list."
        action={
          <Link
            href={ROUTES.incidents}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
          >
            Back to incidents
          </Link>
        }
      />
    );
  }
  return <IncidentDetailPage incidentId={id} />;
}
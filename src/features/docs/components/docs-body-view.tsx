import type { ReactNode } from "react";

import { DocsAlerts } from "./docs-alerts";
import { DocsAnalytics } from "./docs-analytics";
import { DocsAudit } from "./docs-audit";
import { DocsAuth } from "./docs-auth";
import { DocsErrors } from "./docs-errors";
import { DocsIngestion } from "./docs-ingestion";
import { DocsLimits } from "./docs-limits";
import { DocsNotifications } from "./docs-notifications";
import { DocsOrganizations } from "./docs-organizations";
import { DocsPipeline } from "./docs-pipeline";
import { DocsProjects } from "./docs-projects";
import { DocsQuickstart } from "./docs-quickstart";
import { DocsReadApi } from "./docs-read-api";
import { DocsRealtime } from "./docs-realtime";
import { DocsSDKs } from "./docs-sdks";
import { DocsSecurity } from "./docs-security";
import { DocsSlack } from "./docs-slack";
import { DocsTimeline } from "./docs-timeline";

/**
 * Static slug → page-body map. Kept as direct JSX (not a runtime component
 * constructor) so the React compiler can see every element is static.
 */
const bodyBySlug: Record<string, ReactNode> = {
  quickstart: <DocsQuickstart />,
  auth: <DocsAuth />,
  limits: <DocsLimits />,
  pipeline: <DocsPipeline />,
  sdks: <DocsSDKs />,
  "events/ingestion": <DocsIngestion />,
  "read-api": <DocsReadApi />,
  timeline: <DocsTimeline />,
  analytics: <DocsAnalytics />,
  realtime: <DocsRealtime />,
  organizations: <DocsOrganizations />,
  projects: <DocsProjects />,
  alerts: <DocsAlerts />,
  slack: <DocsSlack />,
  notifications: <DocsNotifications />,
  security: <DocsSecurity />,
  audit: <DocsAudit />,
  errors: <DocsErrors />,
};

export function DocsBodyView({ slug }: { slug: string }) {
  return bodyBySlug[slug] ?? null;
}
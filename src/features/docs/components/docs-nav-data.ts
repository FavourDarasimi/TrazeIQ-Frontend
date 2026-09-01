// Grouped navigation replacing the flat `toc` array in docs-page.tsx.
// IDs correspond to section anchors; labels are search/discovery keys.
export type DocsNavItem = { id: string; label: string };
export type DocsNavGroup = { id: string; label: string; items: DocsNavItem[] };

export const docsGroups: DocsNavGroup[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      { id: "quickstart", label: "Quickstart" },
      { id: "pipeline", label: "Concepts" },
      { id: "limits", label: "Limits & Budgets" },
    ],
  },
  {
    id: "authentication",
    label: "Authentication",
    items: [
      { id: "auth-overview", label: "Session vs API Key" },
      { id: "auth-otp", label: "OTP Registration" },
      { id: "auth-session", label: "Login & Session" },
      { id: "auth-google", label: "Google OAuth" },
      { id: "auth-password", label: "Forgot & Reset" },
    ],
  },
  {
    id: "account-team",
    label: "Account & Team",
    items: [
      { id: "organizations", label: "Organizations" },
      { id: "team", label: "Members & Invites" },
      { id: "projects", label: "Projects" },
      { id: "projects-rotate", label: "Rotate API Key" },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    items: [
      { id: "ingestion", label: "POST /events/" },
      { id: "read-api", label: "Events & Incidents" },
      { id: "timeline", label: "Timeline & Comments" },
      { id: "analytics", label: "Dashboard" },
      { id: "services-health", label: "Services Health" },
    ],
  },
  {
    id: "integrations-alerts",
    label: "Integrations & Alerts",
    items: [
      { id: "alerts", label: "Alert Rules" },
      { id: "alerts-webhook", label: "Webhooks & Payload" },
      { id: "slack", label: "Slack" },
      { id: "realtime", label: "Realtime" },
      { id: "notifications", label: "Notifications" },
    ],
  },
  {
    id: "security-reference",
    label: "Security & Reference",
    items: [
      { id: "security", label: "Security" },
      { id: "audit", label: "Audit Log" },
      { id: "errors", label: "Error Codes" },
      { id: "reference", label: "Full API Reference" },
    ],
  },
];

// Flat list for Cmd+K and scroll-spy, preserving group context.
export const allNavItems: Array<DocsNavItem & { group: string; groupId: string }> =
  docsGroups.flatMap((g) =>
    g.items.map((it) => ({ ...it, group: g.label, groupId: g.id }))
  );

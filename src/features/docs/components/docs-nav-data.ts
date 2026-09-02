// Grouped navigation replacing the flat `toc` array in docs-page.tsx.
// IDs correspond to section anchors; labels are search/discovery keys.
export type DocsNavItem = { id: string; label: string };
export type DocsNavGroup = { id: string; label: string; items: DocsNavItem[] };

export const docsGroups: DocsNavGroup[] = [
  {
    id: "product",
    label: "Product",
    items: [
      { id: "overview", label: "Overview" },
      { id: "why-trazeiq", label: "Why TrazeIQ" },
      { id: "pricing", label: "Pricing" },
    ],
  },
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      { id: "quickstart", label: "Quickstart" },
      { id: "pipeline", label: "How it works" },
      { id: "limits", label: "Limits & budgets" },
    ],
  },
  {
    id: "authentication",
    label: "Authentication",
    items: [
      { id: "auth-overview", label: "Session vs API key" },
      { id: "auth-otp", label: "OTP registration" },
      { id: "auth-session", label: "Login & session" },
      { id: "auth-google", label: "Google OAuth" },
      { id: "auth-password", label: "Forgot & reset" },
    ],
  },
  {
    id: "account-team",
    label: "Account & Team",
    items: [
      { id: "organizations", label: "Organizations" },
      { id: "projects", label: "Projects" },
      { id: "projects-rotate", label: "Rotate API key" },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    items: [
      { id: "ingestion", label: "POST /events/" },
      { id: "read-api", label: "Events & incidents" },
      { id: "timeline", label: "Timeline & comments" },
      { id: "analytics", label: "Dashboard" },
    ],
  },
  {
    id: "integrations-alerts",
    label: "Integrations & Alerts",
    items: [
      { id: "alerts", label: "Alert rules" },
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
      { id: "audit", label: "Audit log" },
      { id: "errors", label: "Error codes" },
      { id: "reference", label: "Full API reference" },
    ],
  },
];

// Flat list for Cmd+K and scroll-spy, preserving group context.
export const allNavItems: Array<DocsNavItem & { group: string; groupId: string }> =
  docsGroups.flatMap((g) =>
    g.items.map((it) => ({ ...it, group: g.label, groupId: g.id }))
  );

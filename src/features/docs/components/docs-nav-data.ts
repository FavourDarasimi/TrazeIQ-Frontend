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
      { id: "setup", label: "Setup in 10 minutes" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    id: "account-team",
    label: "Account & Team",
    items: [
      { id: "organizations", label: "Organizations" },
      { id: "projects", label: "Projects" },
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
    label: "Security & Trust",
    items: [
      { id: "security", label: "Security" },
    ],
  },
];

// Flat list for Cmd+K and scroll-spy, preserving group context.
export const allNavItems: Array<DocsNavItem & { group: string; groupId: string }> =
  docsGroups.flatMap((g) =>
    g.items.map((it) => ({ ...it, group: g.label, groupId: g.id }))
  );

// Grouped navigation replacing the flat `toc` array in docs-page.tsx.
// IDs correspond to section anchors; labels are search/discovery keys.
// `subs` are in-page sub-headings shown in the "On This Page" rail.
export type DocsNavSub = { id: string; label: string };
export type DocsNavItem = { id: string; label: string; subs?: DocsNavSub[] };
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
      { id: "setup", label: "Setup" },
      { id: "quickstart", label: "Quickstart" },
      {
        id: "sdks",
        label: "SDKs & Client Libraries",
        subs: [
          { id: "sdks-overview", label: "Overview" },
          { id: "sdks-usage", label: "Examples" },
          { id: "sdks-api", label: "API methods" },
        ],
      },
    ],
  },
  {
    id: "account-team",
    label: "Account & Team",
    items: [
      { id: "organizations", label: "Organizations" },
      {
        id: "team",
        label: "Members & invites",
        subs: [
          { id: "team-invite", label: "Invite flow" },
          { id: "team-members", label: "Members" },
        ],
      },
      {
        id: "projects",
        label: "Projects",
        subs: [{ id: "projects-rotate", label: "Rotate key" }],
      },
    ],
  },
  {
    id: "integrations-alerts",
    label: "Integrations & Alerts",
    items: [
      {
        id: "alerts",
        label: "Alert rules",
        subs: [{ id: "alerts-cooldown", label: "Cooldown & logs" }],
      },
      {
        id: "alerts-webhook",
        label: "Webhooks",
        subs: [{ id: "alerts-webhook-security", label: "SSRF defense" }],
      },
      { id: "slack", label: "Slack" },
      { id: "realtime", label: "Realtime" },
      {
        id: "notifications",
        label: "Notifications",
        subs: [
          { id: "notifications-list", label: "List & counts" },
          { id: "notifications-read", label: "Mark read" },
          { id: "notifications-prefs", label: "Preferences" },
        ],
      },
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

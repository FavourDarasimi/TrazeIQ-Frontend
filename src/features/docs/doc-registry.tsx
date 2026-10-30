export type DocHeading = { id: string; text: string; depth: 2 | 3 };

export type DocSection = {
  id: string;
  label: string;
  description: string;
  order: number;
};

export type DocEntry = {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  headings: DocHeading[];
};

// The docs site navigation. Sections render in `order` — on the docs home as
// card grids, in the sidebar as groups. Adding a page = one entry here.
export const docSections: DocSection[] = [
  {
    id: "start",
    label: "Start here",
    description: "Get your first event flowing and understand the guardrails.",
    order: 10,
  },
  {
    id: "concepts",
    label: "Concepts",
    description: "The mental model behind the dashboard.",
    order: 20,
  },
  {
    id: "sdks",
    label: "SDK guides",
    description: "Drop-in libraries for your stack.",
    order: 30,
  },
  {
    id: "features",
    label: "Features & API",
    description: "Ingest errors, read them back, and watch incidents live.",
    order: 40,
  },
  {
    id: "team",
    label: "Account & team",
    description: "Organizations, roles, and project API keys.",
    order: 50,
  },
  {
    id: "integrations",
    label: "Integrations & alerts",
    description: "Send alerts where your team already lives.",
    order: 60,
  },
  {
    id: "reference",
    label: "Security & reference",
    description: "Security posture, audit trail, and the error-code reference.",
    order: 70,
  },
];

export const docEntries: DocEntry[] = [
  // ---- Start here -----------------------------------------------------
  {
    slug: "quickstart",
    title: "Send your first event",
    description:
      "Create a project, drop the snippet into your error handler, and watch the first incident land in under two minutes.",
    section: "start",
    order: 10,
    headings: [],
  },
  {
    slug: "auth",
    title: "Authentication",
    description:
      "Two auth surfaces — dashboard JWT sessions and project API keys — plus OTP registration, Google OAuth, and password reset.",
    section: "start",
    order: 20,
    headings: [
      { id: "auth-overview", text: "Sessions vs API keys", depth: 2 },
      { id: "auth-otp", text: "OTP registration", depth: 2 },
      { id: "auth-otp-request", text: "Request OTP", depth: 3 },
      { id: "auth-otp-verify", text: "Verify OTP", depth: 3 },
      { id: "auth-otp-complete", text: "Complete signup", depth: 3 },
      { id: "auth-session", text: "Login, refresh, logout", depth: 2 },
      { id: "auth-session-login", text: "Login", depth: 3 },
      { id: "auth-session-refresh", text: "Refresh", depth: 3 },
      { id: "auth-session-logout", text: "Logout & me", depth: 3 },
      { id: "auth-google", text: "Google OAuth", depth: 2 },
      { id: "auth-password", text: "Forgot & reset password", depth: 2 },
    ],
  },
  {
    slug: "limits",
    title: "Payloads & rate limits",
    description:
      "Payload caps, per-project and per-IP ingestion throttles, and the rate-limit internals behind them.",
    section: "start",
    order: 30,
    headings: [
      { id: "limits", text: "Payloads & rate limits", depth: 2 },
      { id: "limits-rate-details", text: "Rate-limit internals", depth: 3 },
    ],
  },

  // ---- Concepts -------------------------------------------------------
  {
    slug: "pipeline",
    title: "From raw error to tracked incident",
    description:
      "How one raw error becomes a deduplicated incident: redact, fingerprint, group, incident, deliver.",
    section: "concepts",
    order: 10,
    headings: [],
  },

  // ---- SDK guides -----------------------------------------------------
  {
    slug: "sdks",
    title: "JavaScript & Python SDKs",
    description:
      "Official zero-dependency SDKs — capture errors, messages, breadcrumbs, and wrapped functions without blocking your app.",
    section: "sdks",
    order: 10,
    headings: [
      { id: "sdks-overview", text: "Overview", depth: 2 },
      { id: "sdks-usage", text: "Quick examples", depth: 2 },
      { id: "sdks-api", text: "API methods & symbols", depth: 2 },
    ],
  },

  // ---- Features & API -------------------------------------------------
  {
    slug: "events/ingestion",
    title: "Event ingestion API",
    description:
      "The single ingestion endpoint — POST /api/v1/events/ with X-API-Key. Fields, responses, throttling, payload caps.",
    section: "features",
    order: 10,
    headings: [
      { id: "ingestion", text: "POST /api/v1/events/", depth: 2 },
      { id: "ingestion-fields", text: "Fields", depth: 3 },
      { id: "ingestion-responses", text: "Responses & throttling", depth: 3 },
    ],
  },
  {
    slug: "read-api",
    title: "Read API — events & incidents",
    description:
      "Pull events and incidents back out with your session — filters, pagination, and race-safe bulk actions.",
    section: "features",
    order: 20,
    headings: [
      { id: "read-api-events", text: "Events", depth: 2 },
      { id: "read-api-incidents", text: "Incidents", depth: 2 },
      { id: "read-api-bulk", text: "Bulk actions", depth: 2 },
    ],
  },
  {
    slug: "timeline",
    title: "Timeline & comments",
    description:
      "The chronological feed per incident: events, comments, and status changes — plus the write endpoints.",
    section: "features",
    order: 30,
    headings: [
      { id: "timeline-feed", text: "Timeline feed", depth: 2 },
      { id: "timeline-comment", text: "Comments", depth: 2 },
      { id: "timeline-status", text: "Status changes", depth: 2 },
    ],
  },
  {
    slug: "analytics",
    title: "Dashboard & services health",
    description:
      "Overview, stats time-series, and per-service health endpoints — cached, membership-scoped, zero-filled.",
    section: "features",
    order: 40,
    headings: [
      { id: "analytics", text: "Overview & stats", depth: 2 },
      { id: "services-health", text: "Services health", depth: 2 },
    ],
  },
  {
    slug: "realtime",
    title: "Realtime (Pusher)",
    description:
      "Live incident flow over private Pusher channels — server-signed auth, event names, graceful degradation.",
    section: "features",
    order: 50,
    headings: [],
  },

  // ---- Account & team -------------------------------------------------
  {
    slug: "organizations",
    title: "Organizations & members",
    description:
      "Organizations, roles, and the invite → accept flow — every query scoped through membership.",
    section: "team",
    order: 10,
    headings: [
      { id: "organizations", text: "Organizations", depth: 2 },
      { id: "team", text: "Members & invites", depth: 2 },
      { id: "team-members", text: "List & remove", depth: 3 },
      { id: "team-invite", text: "Invite & accept", depth: 3 },
    ],
  },
  {
    slug: "projects",
    title: "Projects & API keys",
    description:
      "Create projects, manage environments, and rotate API keys safely — keys are hashed, shown once.",
    section: "team",
    order: 20,
    headings: [
      { id: "projects", text: "Projects", depth: 2 },
      { id: "projects-rotate", text: "Rotate API key", depth: 3 },
    ],
  },

  // ---- Integrations & alerts ------------------------------------------
  {
    slug: "alerts",
    title: "Alert rules & webhooks",
    description:
      "Cooldown-aware alert rules, dispatch logs, webhook payloads, and the SSRF defenses behind them.",
    section: "integrations",
    order: 10,
    headings: [
      { id: "alerts", text: "Alert rules", depth: 2 },
      { id: "alerts-cooldown", text: "Cooldown & logs", depth: 3 },
      { id: "alerts-webhook", text: "Webhooks", depth: 2 },
      { id: "alerts-webhook-security", text: "SSRF defense", depth: 3 },
    ],
  },
  {
    slug: "slack",
    title: "Slack integration",
    description:
      "Connect a Slack workspace via OAuth and check connection status — tokens encrypted at rest.",
    section: "integrations",
    order: 20,
    headings: [],
  },
  {
    slug: "notifications",
    title: "In-app notifications",
    description:
      "The self-scoped notification inbox, mark-read semantics, and per-user alert preferences.",
    section: "integrations",
    order: 30,
    headings: [
      { id: "notifications-list", text: "List & counts", depth: 2 },
      { id: "notifications-read", text: "Mark read", depth: 2 },
      { id: "notifications-prefs", text: "Preferences", depth: 2 },
    ],
  },

  // ---- Security & reference -------------------------------------------
  {
    slug: "security",
    title: "Security",
    description:
      "How TrazeIQ protects keys, redacts secrets, isolates tenants, and defends webhooks.",
    section: "reference",
    order: 10,
    headings: [],
  },
  {
    slug: "audit",
    title: "Audit log",
    description:
      "The owner/admin audit trail — who did what, when, across the orgs you administer.",
    section: "reference",
    order: 20,
    headings: [],
  },
  {
    slug: "errors",
    title: "Error codes",
    description:
      "The full error-code reference — branch on stable codes, never on human messages.",
    section: "reference",
    order: 30,
    headings: [],
  },
];

export type AuthProvider = "email" | "google";

export type AuthUser = {
  email: string;
  name: string;
  email_verified: boolean;
  auth_provider: AuthProvider;
};

export type AuthSession = {
  user: AuthUser;
};

export type Organization = {
  id: string;
  name: string;
  owner: string;
  created_at: string;
};

export type MembershipRole = "owner" | "admin" | "developer" | "viewer";

export type OrganizationMembership = {
  user: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
};

export type Invite = {
  id: string;
  email: string;
  role: MembershipRole;
  expires_at: string;
  created_at: string;
};

export type InviteCreated = {
  invite: Invite;
  invite_token: string;
};

export type InviteAcceptResult = {
  membership: {
    organization: Organization;
    role: MembershipRole;
  };
};

export type Project = {
  id: string;
  organization: string;
  name: string;
  api_key_prefix: string;
  environment: string;
  created_at: string;
};

export type CreatedProject = {
  project: Project;
  api_key: string;
  integration_snippet: string;
};

export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export type IncidentStatus = "open" | "investigating" | "resolved" | "ignored";

export type ProjectSummary = {
  id: string;
  name: string;
  environment: string;
};

export type ErrorGroupSummary = {
  id: string;
  fingerprint: string;
  title: string;
  count: number;
  first_seen: string;
  last_seen: string;
};

export type EventSummary = {
  id: string;
  message: string;
  stacktrace: string;
  level: string;
  environment: string;
  service: string;
  endpoint: string;
  created_at: string;
};

export type EventLevel = "debug" | "info" | "warning" | "error" | "fatal";

export type EventLog = {
  id: string;
  project: string;
  error_group: string | null;
  message: string;
  stacktrace: string;
  level: EventLevel;
  environment: string;
  service: string;
  endpoint: string;
  request_method: string;
  user_id: string;
  ip_address: string;
  metadata: Record<string, unknown>;
  fingerprint: string;
  created_at: string;
};

export type EventPageMeta = {
  page: number;
  page_size: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type Incident = {
  id: string;
  project: ProjectSummary;
  error_group: ErrorGroupSummary;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assigned_to: string | null;
  assigned_to_email: string | null;
  created_at: string;
  resolved_at: string | null;
  latest_event: EventSummary | null;
};

export type IncidentTimelineKind =
  | "event"
  | "comment"
  | "status_change"
  | "ai_analysis";

export type IncidentTimelineEntry = {
  id: string;
  kind: IncidentTimelineKind;
  level: string;
  message: string;
  environment: string;
  service: string;
  content: string;
  actor_email: string | null;
  created_at: string;
};

export type AnalysisStatus = "pending" | "ready" | "failed";

export type AnalysisConfidence = "low" | "medium" | "high";

export type DashboardRange = "24h" | "7d" | "30d";

export type DashboardHealth = "healthy" | "degraded" | "critical";

export type DashboardOverview = {
  open_incidents: {
    total: number;
    by_severity: Record<IncidentSeverity, number>;
  };
  events_24h: number;
  event_trend: {
    percent_change: number;
    trend: "up" | "down" | "flat";
  };
  resolved_24h: number;
  top_errors: Array<{
    fingerprint: string;
    title: string;
    count: number;
    last_seen: string;
    incident_id: string | null;
    severity: IncidentSeverity | null;
  }>;
  health: DashboardHealth;
};

export type DashboardStatPoint = {
  ts: string;
  events: number;
  incidents: number;
};

export type DashboardStats = {
  range: DashboardRange;
  points: DashboardStatPoint[];
};

export type AlertRuleChannel = "email" | "slack" | "webhook";

export type AlertRuleCondition = {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
};

export type AlertRule = {
  id: string;
  project: {
    id: string;
    name: string;
  };
  name: string;
  condition: AlertRuleCondition;
  channel: AlertRuleChannel;
  target: string;
  cooldown_minutes: number;
  created_at: string;
};

export type AlertLog = {
  id: string;
  rule: {
    id: string;
    name: string;
    channel: AlertRuleChannel;
    target: string;
  };
  incident: {
    id: string;
    title: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
  };
  status: "dispatched" | "failed";
  error: string;
  dispatched_at: string;
};

export type SlackStatus = {
  connected: boolean;
  team_name: string | null;
};

export type NotificationKind =
  | "incident_created"
  | "incident_assigned"
  | "incident_updated"
  | "incident_commented"
  | "incident_resolved"
  | "system";

export type AppNotification = {
  id: string;
  incident: {
    id: string;
    title: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
  } | null;
  kind: NotificationKind;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type AlertPreferences = {
  only_assigned_to_me: boolean;
  notify_on_new_incidents: boolean;
  notify_on_status_changes: boolean;
  notify_on_comments: boolean;
  updated_at: string;
};

export type AIAnalysis = {
  id: string;
  incident_id: string;
  status: AnalysisStatus;
  root_cause: string;
  suggested_fix: string;
  confidence: AnalysisConfidence | "";
  model_used: string;
  created_at: string;
};

export type ErrorCode =
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "ALREADY_VERIFIED"
  | "OTP_INVALID"
  | "OTP_EXPIRED"
  | "OTP_USED"
  | "OTP_TOO_MANY_ATTEMPTS"
  | "OTP_MISSING"
  | "REGISTRATION_TOKEN_INVALID"
  | "REGISTRATION_TOKEN_EXPIRED"
  | "REFRESH_TOKEN_INVALID"
  | "GOOGLE_AUTH_FAILED"
  | "ALREADY_MEMBER"
  | "INVITE_INVALID"
  | "INVITE_EXPIRED"
  | "INVITE_USED"
  | "INVITE_EMAIL_MISMATCH"
  | "SLACK_NOT_CONFIGURED"
  | "SLACK_CONNECT_FAILED"
  | "VALIDATION_FAILED"
  | "NOT_AUTHENTICATED"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export type ValidationFields = Record<string, string[]>;

export type ApiFailure = {
  success: false;
  message: string;
  error: {
    code: ErrorCode | string;
    fields?: ValidationFields;
  };
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

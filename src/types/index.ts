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

export type Incident = {
  id: string;
  project: ProjectSummary;
  error_group: ErrorGroupSummary;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_at: string;
  resolved_at: string | null;
  latest_event: EventSummary | null;
};

export type IncidentTimelineEntry = {
  id: string;
  kind: "event";
  level: string;
  message: string;
  environment: string;
  service: string;
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

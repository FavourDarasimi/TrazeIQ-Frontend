export const API_BASE = "/api/v1";

export const API_ROUTES = {
  registerRequestOtp: "/auth/register/request-otp/",
  registerVerifyOtp: "/auth/register/verify-otp/",
  registerComplete: "/auth/register/complete/",
  login: "/auth/login/",
  refresh: "/auth/refresh/",
  logout: "/auth/logout/",
  me: "/auth/me/",
  organizations: "/organizations/",
  projects: "/projects/",
  incidents: "/incidents/",
  events: "/events/",
  invites: "/invites/",
  pusherAuth: "/pusher/auth/",
  dashboardOverview: "/dashboard/overview/",
  dashboardStats: "/dashboard/stats/",
  servicesHealth: "/services/health/",
  alertRules: "/alerts/rules/",
  alertLogs: "/alerts/logs/",
  slackConnect: "/integrations/slack/connect/",
  slackStatus: "/integrations/slack/status/",
  notifications: "/notifications/",
  notificationUnreadCount: "/notifications/unread-count/",
  notificationMarkRead: "/notifications/read/",
  alertPreferences: "/notifications/preferences/",
} as const;

export const ROUTES = {
  home: "/",
  docs: "/docs",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  incidents: "/incidents",
  logs: "/logs",
  services: "/services",
  aiAssistant: "/ai-assistant",
  settings: "/settings",
  settingsTeam: "/settings/team",
  settingsAlerts: "/settings/alerts",
  slackCallback: "/integrations/slack/callback",
  invite: "/invite",
} as const;

export function inviteAcceptUrl(token: string): string {
  return `${ROUTES.invite}/${token}`;
}

export function incidentDetailUrl(id: string): string {
  return `${ROUTES.incidents}/${id}`;
}
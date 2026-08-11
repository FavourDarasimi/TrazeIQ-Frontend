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
  invites: "/invites/",
  pusherAuth: "/pusher/auth/",
  dashboardOverview: "/dashboard/overview/",
  dashboardStats: "/dashboard/stats/",
} as const;

export const ROUTES = {
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
  invite: "/invite",
} as const;

export function inviteAcceptUrl(token: string): string {
  return `${ROUTES.invite}/${token}`;
}

export function incidentDetailUrl(id: string): string {
  return `${ROUTES.incidents}/${id}`;
}
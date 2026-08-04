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
} as const;

export const ROUTES = {
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
} as const;

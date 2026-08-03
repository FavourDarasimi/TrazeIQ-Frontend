export const API_BASE = "/api/v1";

export const AUTH_ROUTES = {
  register: "/auth/register/",
  verify: "/auth/verify/",
  resendOtp: "/auth/resend-otp/",
  login: "/auth/login/",
  refresh: "/auth/refresh/",
  logout: "/auth/logout/",
  me: "/auth/me/",
  google: "/auth/google/",
  forgotPassword: "/auth/forgot-password/",
  resetPassword: "/auth/reset-password/",
} as const;
import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { AuthSession } from "@/types";

export type RegisterCredential = {
  registration_token: string;
  password: string;
  confirm_password: string;
};

export function requestRegistrationOtp(email: string): Promise<null> {
  return api<null>(API_ROUTES.registerRequestOtp, {
    method: "POST",
    body: { email },
  });
}

export function verifyRegistrationOtp(email: string, otp: string): Promise<{ registration_token: string }> {
  return api<{ registration_token: string }>(API_ROUTES.registerVerifyOtp, {
    method: "POST",
    body: { email, otp },
  });
}

export function completeRegistration(body: RegisterCredential): Promise<AuthSession> {
  return api<AuthSession>(API_ROUTES.registerComplete, {
    method: "POST",
    body,
  });
}

export function login(email: string, password: string): Promise<AuthSession> {
  return api<AuthSession>(API_ROUTES.login, {
    method: "POST",
    body: { email, password },
  });
}

export function fetchMe(): Promise<AuthSession> {
  return api<AuthSession>(API_ROUTES.me);
}

export function refreshSession(): Promise<AuthSession> {
  return api<AuthSession>(API_ROUTES.refresh, { method: "POST" });
}

export function logout(): Promise<null> {
  return api<null>(API_ROUTES.logout, { method: "POST" });
}
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
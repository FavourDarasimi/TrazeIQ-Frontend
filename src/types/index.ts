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
  id: number;
  name: string;
  owner: number;
  created_at: string;
};

export type Project = {
  id: number;
  organization: number;
  name: string;
  api_key_prefix: string;
  environment: string;
  created_at: string;
};

export type CreatedProject = {
  project: Project;
  api_key: string;
  sdk_snippet: string;
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

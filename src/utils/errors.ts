import { ApiError } from "@/lib/api";
import type { ValidationFields } from "@/types";

export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

export function apiFieldErrors(error: unknown): ValidationFields | undefined {
  return error instanceof ApiError ? error.fields : undefined;
}

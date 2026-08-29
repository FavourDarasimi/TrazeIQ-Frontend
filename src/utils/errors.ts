import { ApiError } from "@/lib/api";
import type { ValidationFields } from "@/types";

export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError && error.code === "PAYLOAD_TOO_LARGE") {
    return "Payload is too large. Try removing large stacktraces or trimming the metadata before sending again.";
  }
  if (error instanceof ApiError && error.message) return error.message;
  return fallback;
}

export function apiFieldErrors(error: unknown): ValidationFields | undefined {
  return error instanceof ApiError ? error.fields : undefined;
}

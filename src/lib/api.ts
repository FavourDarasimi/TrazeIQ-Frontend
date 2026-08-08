import { API_BASE, API_ROUTES } from "@/constants";
import type { ApiFailure, ApiSuccess } from "@/types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, message: string, code?: string, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

/**
 * Cookie-ready API client. Uses `credentials: "include"` so the httpOnly
 * auth cookies (`trazeiq_access` / `trazeiq_refresh`) are sent and stored.
 * Unwraps the `{success, message, data}` envelope; throws `ApiError` with
 * `code`/`fields` for `{success: false}` bodies.
 * Components must never call this directly — go through a `services/` layer.
 */

/** Single-flight refresh: 401s share one rotation so parallel failures
 * don't blacklist each other's refresh cookie (server rotates on every call). */
let refreshInFlight: Promise<boolean> | null = null;

function rotateSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}${API_BASE}${API_ROUTES.refresh}`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok || response.status === 204)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: ApiRequestOptions, allowRetry: boolean): Promise<T> {
  const { method = "GET", body, signal } = options;
  const response = await fetch(`${API_URL}${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && allowRetry && path !== API_ROUTES.refresh && (await rotateSession())) {
    return request<T>(path, options, false);
  }

  if (!response.ok) {
    try {
      const payload = (await response.json()) as ApiFailure;
      if (payload && payload.success === false && payload.error) {
        throw new ApiError(response.status, payload.message, payload.error.code, payload.error.fields);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
    }
    throw new ApiError(response.status, response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  const payload = (await response.json()) as ApiSuccess<T>;
  return payload.data;
}

export async function api<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return request<T>(path, options, true);
}
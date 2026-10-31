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

const PUBLIC_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/docs"];

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function rotateSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}${API_BASE}${API_ROUTES.refresh}`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        const ok = response.ok || response.status === 204;
        if (!ok && typeof window !== "undefined") {
          window.localStorage.removeItem("trazeiq_logged_in");
        }
        return ok;
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("trazeiq_logged_in");
        }
        return false;
      })
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

  if (response.status === 401 && allowRetry && path !== API_ROUTES.refresh) {
    const isPublic =
      typeof window !== "undefined" && isPublicRoute(window.location.pathname);
    // On public routes, an unauthenticated /auth/me/ check should not trigger an
    // extraneous /auth/refresh/ failure into the console.
    if (isPublic && path === API_ROUTES.me) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("trazeiq_logged_in");
      }
    } else if (await rotateSession()) {
      return request<T>(path, options, false);
    }
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
import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  PlatformHealth,
  PlatformOrganization,
  PlatformOverview,
  PlatformPageMeta,
  PlatformProject,
  PlatformUser,
} from "@/types";

export type PlatformListParams = {
  search?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
};

function query(params: Omit<PlatformListParams, "signal">): string {
  const parts: string[] = [];
  if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.page) parts.push(`page=${params.page}`);
  if (params.page_size) parts.push(`page_size=${params.page_size}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export function getPlatformOverview(signal?: AbortSignal): Promise<{ overview: PlatformOverview }> {
  return api<{ overview: PlatformOverview }>(API_ROUTES.platformOverview, { signal });
}

export function getPlatformHealth(signal?: AbortSignal): Promise<PlatformHealth> {
  // The health view returns its payload flat (status/checks/metrics), not nested.
  return api<PlatformHealth>(API_ROUTES.platformHealth, { signal });
}

export function listPlatformUsers(
  params: PlatformListParams = {},
): Promise<{ users: PlatformUser[]; pagination: PlatformPageMeta }> {
  const { signal, ...rest } = params;
  return api<{ users: PlatformUser[]; pagination: PlatformPageMeta }>(
    `${API_ROUTES.platformUsers}${query(rest)}`,
    { signal },
  );
}

export function listPlatformOrganizations(
  params: PlatformListParams = {},
): Promise<{ organizations: PlatformOrganization[]; pagination: PlatformPageMeta }> {
  const { signal, ...rest } = params;
  return api<{ organizations: PlatformOrganization[]; pagination: PlatformPageMeta }>(
    `${API_ROUTES.platformOrganizations}${query(rest)}`,
    { signal },
  );
}

export function listPlatformProjects(
  params: PlatformListParams = {},
): Promise<{ projects: PlatformProject[]; pagination: PlatformPageMeta }> {
  const { signal, ...rest } = params;
  return api<{ projects: PlatformProject[]; pagination: PlatformPageMeta }>(
    `${API_ROUTES.platformProjects}${query(rest)}`,
    { signal },
  );
}

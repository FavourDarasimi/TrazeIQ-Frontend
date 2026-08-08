import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  DashboardOverview,
  DashboardRange,
  DashboardStats,
} from "@/types";

export function getDashboardOverview(
  projectId: string | null,
  signal?: AbortSignal,
): Promise<{ overview: DashboardOverview }> {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);
  const query = params.toString();
  return api<{ overview: DashboardOverview }>(
    `${API_ROUTES.dashboardOverview}${query ? `?${query}` : ""}`,
    { signal },
  );
}

export function getDashboardStats(
  range: DashboardRange,
  projectId: string | null,
  signal?: AbortSignal,
): Promise<{ stats: DashboardStats }> {
  const params = new URLSearchParams({ range });
  if (projectId) params.set("project_id", projectId);
  return api<{ stats: DashboardStats }>(
    `${API_ROUTES.dashboardStats}?${params.toString()}`,
    { signal },
  );
}
import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { DashboardRange, ServicesHealthCatalog } from "@/types";

export function getServicesHealth(
  range: DashboardRange,
  projectId: string | null,
  signal?: AbortSignal,
): Promise<{ catalog: ServicesHealthCatalog }> {
  const params = new URLSearchParams({ range });
  if (projectId) params.set("project_id", projectId);
  return api<{ catalog: ServicesHealthCatalog }>(
    `${API_ROUTES.servicesHealth}?${params.toString()}`,
    { signal },
  );
}
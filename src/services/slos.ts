import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  SLO,
  SLOBreachAlert,
  SLODependencySummary,
  SLOInput,
  SLOBudgetSnapshot,
  SLOPatch,
} from "@/types";

export function listSlos(projectId?: string): Promise<{ slos: SLO[] }> {
  const query = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  return api<{ slos: SLO[] }>(`${API_ROUTES.slos}${query}`);
}

export function getSloBudget(sloId: string): Promise<{
  snapshot: SLOBudgetSnapshot | null;
}> {
  return api<{ snapshot: SLOBudgetSnapshot | null }>(
    `${API_ROUTES.slos}${sloId}/budget/`,
  );
}

export function getSloHistory(
  sloId: string,
  limit = 100,
): Promise<{ snapshots: SLOBudgetSnapshot[] }> {
  return api<{ snapshots: SLOBudgetSnapshot[] }>(
    `${API_ROUTES.slos}${sloId}/history/?limit=${limit}`,
  );
}

export function getSloAlerts(sloId: string): Promise<{
  alerts: SLOBreachAlert[];
}> {
  return api<{ alerts: SLOBreachAlert[] }>(
    `${API_ROUTES.slos}${sloId}/alerts/`,
  );
}

export function createSlo(input: SLOInput): Promise<{ slo: SLO }> {
  return api<{ slo: SLO }>(API_ROUTES.slos, { method: "POST", body: input });
}

export function updateSlo(id: string, patch: SLOPatch): Promise<{ slo: SLO }> {
  return api<{ slo: SLO }>(`${API_ROUTES.slos}${id}/`, {
    method: "PATCH",
    body: patch,
  });
}

export function deleteSlo(id: string): Promise<void> {
  return api<void>(`${API_ROUTES.slos}${id}/`, { method: "DELETE" });
}

export function acknowledgeSloAlert(
  sloId: string,
  alertId: string,
): Promise<{ alert: SLOBreachAlert }> {
  return api<{ alert: SLOBreachAlert }>(
    `${API_ROUTES.slos}${sloId}/alerts/${alertId}/acknowledge/`,
    { method: "POST" },
  );
}

export function getSloDependencies(projectId: string): Promise<{
  summary: SLODependencySummary;
}> {
  return api<{ summary: SLODependencySummary }>(
    `${API_ROUTES.sloDependencies}?project=${encodeURIComponent(projectId)}`,
  );
}
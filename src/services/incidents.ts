import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEntry,
} from "@/types";

export type IncidentFilters = {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  project?: number;
};

export function listIncidents(
  filters: IncidentFilters = {},
  signal?: AbortSignal,
): Promise<{ incidents: Incident[] }> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.project !== undefined) {
    params.set("project", String(filters.project));
  }
  const query = params.toString();
  return api<{ incidents: Incident[] }>(
    `${API_ROUTES.incidents}${query ? `?${query}` : ""}`,
    { signal },
  );
}

export function getIncident(
  id: number | string,
  signal?: AbortSignal,
): Promise<{ incident: Incident }> {
  return api<{ incident: Incident }>(`${API_ROUTES.incidents}${id}/`, {
    signal,
  });
}

export function getIncidentTimeline(
  id: number | string,
  signal?: AbortSignal,
): Promise<{ entries: IncidentTimelineEntry[] }> {
  return api<{ entries: IncidentTimelineEntry[] }>(
    `${API_ROUTES.incidents}${id}/timeline/`,
    { signal },
  );
}

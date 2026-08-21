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
  project?: string;
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
  id: string,
  signal?: AbortSignal,
): Promise<{ incident: Incident }> {
  return api<{ incident: Incident }>(`${API_ROUTES.incidents}${id}/`, {
    signal,
  });
}

export function getIncidentTimeline(
  id: string,
  signal?: AbortSignal,
): Promise<{ entries: IncidentTimelineEntry[] }> {
  return api<{ entries: IncidentTimelineEntry[] }>(
    `${API_ROUTES.incidents}${id}/timeline/`,
    { signal },
  );
}

export function createIncidentComment(
  id: string,
  content: string,
): Promise<{ entry: IncidentTimelineEntry }> {
  return api<{ entry: IncidentTimelineEntry }>(
    `${API_ROUTES.incidents}${id}/comments/`,
    { method: "POST", body: { content } },
  );
}

export type BulkUpdatePayload = {
  incident_ids: string[];
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  assigned_to?: string | null;
};

export type BulkUpdateResult = {
  updated_count: number;
  incidents: Incident[];
};

export function bulkUpdateIncidents(
  payload: BulkUpdatePayload,
): Promise<BulkUpdateResult> {
  return api<BulkUpdateResult>(
    `${API_ROUTES.incidents}bulk-update/`,
    { method: "POST", body: payload },
  );
}

export function bulkResolveIncidents(
  incidentIds: string[],
): Promise<BulkUpdateResult> {
  return api<BulkUpdateResult>(
    `${API_ROUTES.incidents}bulk-resolve/`,
    { method: "POST", body: { incident_ids: incidentIds } },
  );
}

export function bulkAssignIncidents(
  incidentIds: string[],
  assignedTo: string | null,
): Promise<BulkUpdateResult> {
  return api<BulkUpdateResult>(
    `${API_ROUTES.incidents}bulk-assign/`,
    { method: "POST", body: { incident_ids: incidentIds, assigned_to: assignedTo } },
  );
}

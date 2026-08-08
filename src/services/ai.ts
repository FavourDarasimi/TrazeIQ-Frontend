import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { AIAnalysis } from "@/types";

export function getIncidentAnalysis(
  incidentId: string,
  signal?: AbortSignal,
): Promise<{ analysis: AIAnalysis }> {
  return api<{ analysis: AIAnalysis }>(
    `${API_ROUTES.incidents}${incidentId}/analysis/`,
    { signal },
  );
}

export function triggerIncidentAnalysis(
  incidentId: string,
): Promise<{ analysis: AIAnalysis }> {
  return api<{ analysis: AIAnalysis }>(
    `${API_ROUTES.incidents}${incidentId}/analyze/`,
    { method: "POST" },
  );
}
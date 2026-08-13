import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  AlertLog,
  AlertRule,
  AlertRuleChannel,
  AlertRuleCondition,
} from "@/types";

export type AlertRuleInput = {
  project: string;
  name: string;
  condition: AlertRuleCondition;
  channel: AlertRuleChannel;
  target: string;
  cooldown_minutes?: number;
};

export type AlertRulePatch = Partial<{
  name: string;
  condition: AlertRuleCondition;
  channel: AlertRuleChannel;
  target: string;
  cooldown_minutes: number;
}>;

export function listAlertRules(
  projectId?: string,
): Promise<{ rules: AlertRule[] }> {
  const query = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  return api<{ rules: AlertRule[] }>(`${API_ROUTES.alertRules}${query}`);
}

export function createAlertRule(input: AlertRuleInput): Promise<{ rule: AlertRule }> {
  return api<{ rule: AlertRule }>(API_ROUTES.alertRules, {
    method: "POST",
    body: input,
  });
}

export function updateAlertRule(
  id: string,
  patch: AlertRulePatch,
): Promise<{ rule: AlertRule }> {
  return api<{ rule: AlertRule }>(`${API_ROUTES.alertRules}${id}/`, {
    method: "PATCH",
    body: patch,
  });
}

export function deleteAlertRule(id: string): Promise<void> {
  return api<void>(`${API_ROUTES.alertRules}${id}/`, {
    method: "DELETE",
  });
}

export function listAlertLogs(filter?: {
  rule?: string;
  incident?: string;
}): Promise<{ logs: AlertLog[] }> {
  const params = new URLSearchParams();
  if (filter?.rule) params.set("rule", filter.rule);
  if (filter?.incident) params.set("incident", filter.incident);
  const query = params.toString();
  return api<{ logs: AlertLog[] }>(
    `${API_ROUTES.alertLogs}${query ? `?${query}` : ""}`,
  );
}

export function connectSlack(input: {
  organization: string;
  code: string;
  redirect_uri?: string;
}): Promise<{ connected: boolean; team_name: string | null }> {
  return api<{ connected: boolean; team_name: string | null }>(
    API_ROUTES.slackConnect,
    { method: "POST", body: input },
  );
}

export function getSlackStatus(
  organization: string,
): Promise<{ connected: boolean; team_name: string | null }> {
  return api<{ connected: boolean; team_name: string | null }>(
    `${API_ROUTES.slackStatus}?organization=${encodeURIComponent(organization)}`,
  );
}

import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type {
  ApiKeyScope,
  CreatedProject,
  CreatedProjectApiKey,
  Project,
  ProjectApiKey,
  RotatedProjectApiKey,
} from "@/types";

export function listProjects(): Promise<{ projects: Project[] }> {
  return api<{ projects: Project[] }>(API_ROUTES.projects);
}

export function createProject(input: {
  name: string;
  organization?: string;
  environment?: string;
}): Promise<CreatedProject> {
  return api<CreatedProject>(API_ROUTES.projects, {
    method: "POST",
    body: input,
  });
}

export function rotateProjectKey(projectId: string): Promise<CreatedProject> {
  return api<CreatedProject>(`${API_ROUTES.projects}${projectId}/rotate-key/`, {
    method: "POST",
  });
}

export function listProjectKeys(projectId: string): Promise<{ keys: ProjectApiKey[] }> {
  return api<{ keys: ProjectApiKey[] }>(`${API_ROUTES.projects}${projectId}/keys/`);
}

export function createProjectKey(
  projectId: string,
  data: { name: string; scopes?: ApiKeyScope[] }
): Promise<CreatedProjectApiKey> {
  return api<CreatedProjectApiKey>(`${API_ROUTES.projects}${projectId}/keys/`, {
    method: "POST",
    body: data,
  });
}

export function revokeProjectKey(
  projectId: string,
  keyId: string
): Promise<{ key: ProjectApiKey }> {
  return api<{ key: ProjectApiKey }>(
    `${API_ROUTES.projects}${projectId}/keys/${keyId}/`,
    {
      method: "DELETE",
    }
  );
}

export function rotateProjectApiKeyV2(
  projectId: string,
  keyId: string,
  options: { grace_period_hours?: number; name?: string } = {}
): Promise<RotatedProjectApiKey> {
  return api<RotatedProjectApiKey>(
    `${API_ROUTES.projects}${projectId}/keys/${keyId}/rotate/`,
    {
      method: "POST",
      body: options,
    }
  );
}


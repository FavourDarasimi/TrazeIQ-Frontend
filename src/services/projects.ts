import { API_ROUTES } from "@/constants";
import { api } from "@/lib/api";
import type { CreatedProject, Project } from "@/types";

export function listProjects(): Promise<{ projects: Project[] }> {
  return api<{ projects: Project[] }>(API_ROUTES.projects);
}

export function createProject(input: {
  name: string;
  organization?: number;
  environment?: string;
}): Promise<CreatedProject> {
  return api<CreatedProject>(API_ROUTES.projects, {
    method: "POST",
    body: input,
  });
}
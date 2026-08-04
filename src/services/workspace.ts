import type { Organization, Project } from "@/types";

import { listOrganizations } from "@/services/organizations";
import { listProjects } from "@/services/projects";

export type WorkspaceSnapshot = {
  organizations: Organization[];
  projects: Project[];
};

export async function loadWorkspace(): Promise<WorkspaceSnapshot> {
  const [orgResult, projectResult] = await Promise.all([
    listOrganizations(),
    listProjects(),
  ]);
  return {
    organizations: orgResult.organizations,
    projects: projectResult.projects,
  };
}
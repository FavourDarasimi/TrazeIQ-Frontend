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

// A user who signed up but never finished setup has no org or no project;
// they belong in the onboarding flow, which resumes at the right stage.
// Best-effort: a failed lookup must never block sign-in routing.
export async function needsOnboarding(): Promise<boolean> {
  try {
    const { organizations, projects } = await loadWorkspace();
    return organizations.length === 0 || projects.length === 0;
  } catch {
    return false;
  }
}
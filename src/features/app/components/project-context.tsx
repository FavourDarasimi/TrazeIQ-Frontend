"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Organization, Project } from "@/types";
import { loadWorkspace } from "@/services/workspace";
import { useAuth } from "@/providers/auth-provider";

const PROJECT_STORAGE_KEY = "trazeiq.selectedProject";
const ORG_STORAGE_KEY = "trazeiq.selectedOrganization";

// Module-level cache survives AppShell remounts (dashboard ↔ settings)
// so page switches don't flash "Loading…" or reset the project.
let moduleCache: {
  projects: Project[];
  organizations: Organization[];
  selectedId: string | null;
  selectedOrgId: string | null;
} | null = null;

function readStoredProject(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(PROJECT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStoredOrg(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getInitialSelectedId(): string | null {
  if (moduleCache?.selectedId) return moduleCache.selectedId;
  return readStoredProject();
}

function getInitialOrgId(): string | null {
  if (moduleCache?.selectedOrgId) return moduleCache.selectedOrgId;
  return readStoredOrg();
}

type ProjectContextValue = {
  status: "loading" | "ready" | "error";
  projects: Project[];
  organizations: Organization[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectedOrganizationId: string | null;
  selectedOrganization: Organization | null;
  selectProject: (id: string) => void;
  selectOrganization: (id: string) => void;
  retry: () => void;
  refresh: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(() =>
    moduleCache ? "ready" : "loading",
  );
  const [projects, setProjects] = useState<Project[]>(() => moduleCache?.projects ?? []);
  const [organizations, setOrganizations] = useState<Organization[]>(() => moduleCache?.organizations ?? []);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => getInitialSelectedId());
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(() => getInitialOrgId());
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      if (authStatus === "loading") return;
      // Authenticated context no longer valid — reset to empty ready state without network call.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset context when auth expires
      setProjects([]);
      setOrganizations([]);
      setSelectedProjectId(null);
      setSelectedOrganizationId(null);
      moduleCache = null;
      setStatus("ready");
      return;
    }
    let cancelled = false;
    // Keep cached UI visible while revalidating in background — don't flash loading
    // if we already have projects. Only show loading on cold start.
    if (!moduleCache) setStatus("loading");
    loadWorkspace()
      .then((snapshot) => {
        if (cancelled) return;
        setOrganizations(snapshot.organizations);
        setProjects(snapshot.projects);

        const storedOrg = readStoredOrg();
        const storedProj = readStoredProject();

        let nextOrgId: string | null = null;
        let nextProjId: string | null = null;

        // Determine org: stored org if valid, else org of stored project, else first org
        if (storedOrg && snapshot.organizations.some((o) => o.id === storedOrg)) {
          nextOrgId = storedOrg;
        } else if (storedProj) {
          const proj = snapshot.projects.find((p) => p.id === storedProj);
          if (proj) nextOrgId = proj.organization;
        }
        if (!nextOrgId) nextOrgId = snapshot.organizations[0]?.id ?? null;

        // Determine project within that org
        const projectsForOrg = snapshot.projects.filter((p) => p.organization === nextOrgId);
        if (storedProj && projectsForOrg.some((p) => p.id === storedProj)) {
          nextProjId = storedProj;
        } else {
          nextProjId = projectsForOrg[0]?.id ?? snapshot.projects[0]?.id ?? null;
          // If selected org has no projects, keep nextOrgId but project null
          if (!nextProjId && snapshot.projects.length > 0 && nextOrgId && projectsForOrg.length === 0) {
            // org has no projects — keep org, no project selected
            nextProjId = null;
          }
        }

        setSelectedOrganizationId(nextOrgId);
        setSelectedProjectId(nextProjId);
        moduleCache = {
          projects: snapshot.projects,
          organizations: snapshot.organizations,
          selectedId: nextProjId,
          selectedOrgId: nextOrgId,
        };
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, attempt]);

  const selectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    // Keep org in sync — selecting a project implicitly switches org
    const proj = projects.find((p) => p.id === id) ?? moduleCache?.projects.find((p) => p.id === id);
    if (proj) {
      setSelectedOrganizationId(proj.organization);
      try {
        window.localStorage.setItem(ORG_STORAGE_KEY, proj.organization);
      } catch {}
    }
    if (moduleCache) moduleCache = { ...moduleCache, selectedId: id, selectedOrgId: proj?.organization ?? moduleCache.selectedOrgId };
    try {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, id);
    } catch {
      // Storage unavailable (private mode) — selection still works in memory.
    }
  }, [projects]);

  const selectOrganization = useCallback((id: string) => {
    setSelectedOrganizationId(id);
    try {
      window.localStorage.setItem(ORG_STORAGE_KEY, id);
    } catch {}
    // Pick first project of that org, or clear if none
    const nextProj = projects.find((p) => p.organization === id) ?? moduleCache?.projects.find((p) => p.organization === id) ?? null;
    const nextProjId = nextProj?.id ?? null;
    setSelectedProjectId(nextProjId);
    if (nextProjId) {
      try {
        window.localStorage.setItem(PROJECT_STORAGE_KEY, nextProjId);
      } catch {}
    } else {
      try {
        window.localStorage.removeItem(PROJECT_STORAGE_KEY);
      } catch {}
    }
    if (moduleCache) moduleCache = { ...moduleCache, selectedOrgId: id, selectedId: nextProjId };
  }, [projects]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  const value = useMemo<ProjectContextValue>(
    () => ({
      status,
      projects,
      organizations,
      selectedProjectId,
      selectedProject:
        projects.find((project) => project.id === selectedProjectId) ?? null,
      selectedOrganizationId,
      selectedOrganization:
        organizations.find((org) => org.id === selectedOrganizationId) ?? null,
      selectProject,
      selectOrganization,
      retry,
      refresh,
    }),
    [status, projects, organizations, selectedProjectId, selectedOrganizationId, selectProject, selectOrganization, retry, refresh],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}

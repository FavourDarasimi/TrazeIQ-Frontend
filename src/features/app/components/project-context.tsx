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

import type { Project } from "@/types";
import { loadWorkspace } from "@/services/workspace";
import { useAuth } from "@/providers/auth-provider";

const STORAGE_KEY = "trazeiq.selectedProject";

// Module-level cache survives AppShell remounts (dashboard ↔ settings)
// so page switches don't flash "Loading…" or reset the project.
let moduleCache: { projects: Project[]; selectedId: string | null } | null = null;

function readStoredSelection(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getInitialSelectedId(): string | null {
  if (moduleCache?.selectedId) return moduleCache.selectedId;
  return readStoredSelection();
}

type ProjectContextValue = {
  status: "loading" | "ready" | "error";
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectProject: (id: string) => void;
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => getInitialSelectedId());
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      if (authStatus === "loading") return;
      // Authenticated context no longer valid — reset to empty ready state without network call.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset context when auth expires
      setProjects([]);
      setSelectedProjectId(null);
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
        setProjects(snapshot.projects);
        const stored = readStoredSelection();
        const valid = snapshot.projects.some((project) => project.id === stored);
        const nextId = valid ? stored : (snapshot.projects[0]?.id ?? null);
        setSelectedProjectId(nextId);
        moduleCache = { projects: snapshot.projects, selectedId: nextId };
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
    if (moduleCache) moduleCache = { ...moduleCache, selectedId: id };
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage unavailable (private mode) — selection still works in memory.
    }
  }, []);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((value) => value + 1);
  }, []);

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);

  const value = useMemo<ProjectContextValue>(
    () => ({
      status,
      projects,
      selectedProjectId,
      selectedProject:
        projects.find((project) => project.id === selectedProjectId) ?? null,
      selectProject,
      retry,
      refresh,
    }),
    [status, projects, selectedProjectId, selectProject, retry, refresh],
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

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

type ProjectContextValue = {
  status: "loading" | "ready" | "error";
  projects: Project[];
  selectedProjectId: string | null;
  selectedProject: Project | null;
  selectProject: (id: string) => void;
  retry: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function readStoredSelection(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      if (authStatus === "loading") return;
      // Authenticated context no longer valid — reset to empty ready state without network call.
      setProjects([]);
      setSelectedProjectId(null);
      setStatus("ready");
      return;
    }
    let cancelled = false;
    loadWorkspace()
      .then((snapshot) => {
        if (cancelled) return;
        setProjects(snapshot.projects);
        const stored = readStoredSelection();
        const valid = snapshot.projects.some((project) => project.id === stored);
        setSelectedProjectId(
          valid ? stored : (snapshot.projects[0]?.id ?? null),
        );
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

  const value = useMemo<ProjectContextValue>(
    () => ({
      status,
      projects,
      selectedProjectId,
      selectedProject:
        projects.find((project) => project.id === selectedProjectId) ?? null,
      selectProject,
      retry,
    }),
    [status, projects, selectedProjectId, selectProject, retry],
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
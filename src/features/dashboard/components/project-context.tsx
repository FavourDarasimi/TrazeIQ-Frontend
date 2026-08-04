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

const STORAGE_KEY = "trazeiq.selectedProject";

type ProjectContextValue = {
  status: "loading" | "ready" | "error";
  projects: Project[];
  selectedProjectId: number | null;
  selectedProject: Project | null;
  selectProject: (id: number) => void;
  retry: () => void;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function readStoredSelection(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
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
  }, [attempt]);

  const selectProject = useCallback((id: number) => {
    setSelectedProjectId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
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
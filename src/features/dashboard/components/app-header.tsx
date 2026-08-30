"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon, ArrowUpDownIcon, Menu01Icon } from "@hugeicons/core-free-icons";

import { HeaderActions } from "@/components/ui/header-actions";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";

function ProjectSwitcher() {
  const { status, projects, selectedProjectId, selectedProject, selectedOrganizationId, selectProject } = useProjectContext();

  const projectsForOrg = selectedOrganizationId
    ? projects.filter((p) => p.organization === selectedOrganizationId)
    : projects;

  if (status === "loading" && projects.length === 0) {
    return <div className="flex h-9 w-32 animate-pulse rounded-lg border border-line bg-surface sm:w-48" aria-hidden="true" />;
  }

  if (projectsForOrg.length === 0) {
    return (
      <Link
        href={ROUTES.onboarding}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-ink"
      >
        <HugeiconsIcon icon={AddCircleIcon} size={14} color="currentColor" strokeWidth={1.5} />
        <span className="hidden sm:inline">New project</span>
        <span className="sm:hidden">New</span>
      </Link>
    );
  }

  const displayProject = selectedProject ?? projectsForOrg.find((p) => p.id === selectedProjectId) ?? projectsForOrg[0];

  return (
    <div className="group relative flex">
      <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-1.5 shadow-sm transition-colors group-hover:border-line-soft group-hover:bg-bg-panel group-focus-within:border-accent/50 group-focus-within:ring-1 group-focus-within:ring-accent/30">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 font-mono text-[11px] font-semibold text-accent">
          {(displayProject?.name ?? "?")[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="max-w-[14ch] truncate text-sm font-medium leading-none tracking-tight text-ink md:max-w-[18ch]">
            {displayProject?.name ?? "Select project"}
          </p>
          <p className="truncate font-mono text-[10px] uppercase tracking-wide text-muted">
            {displayProject?.environment ?? "—"}
          </p>
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-bg-panel text-muted transition-colors group-hover:border-accent/30 group-hover:text-ink">
          <HugeiconsIcon icon={ArrowUpDownIcon} size={12} color="currentColor" strokeWidth={1.5} />
        </span>
      </div>
      <select
        value={displayProject?.id ?? selectedProjectId ?? ""}
        onChange={(e) => selectProject(e.target.value)}
        aria-label="Select project"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-lg opacity-0 focus:outline-none"
      >
        {projectsForOrg.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.environment}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AppHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg-panel/95 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <HugeiconsIcon icon={Menu01Icon} size={22} color="currentColor" strokeWidth={1.5} />
        </button>
        <ProjectSwitcher />
      </div>
      <HeaderActions />
    </header>
  );
}

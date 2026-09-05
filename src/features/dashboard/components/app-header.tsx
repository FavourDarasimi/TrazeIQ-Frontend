/* Hallmark · component: project-switcher · genre: modern-minimal · theme: Design.md
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (text-ink on bg-panel 15.8:1) · pre-emit critique: P5 H5 E5 S4 R5 V5
 * companion: organization-switcher (sidebar inset) — project is pill with env dot
 */
"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon, ChevronDownIcon, ChevronUpIcon, Menu01Icon } from "@hugeicons/core-free-icons";

import { HeaderActions } from "@/components/ui/header-actions";
import { ROUTES } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { GlobalIncidentSearch } from "@/features/dashboard/components/global-incident-search";

function ProjectSwitcher() {
  const { status, projects, selectedProjectId, selectedProject, selectedOrganizationId, selectProject } = useProjectContext();

  const projectsForOrg = selectedOrganizationId
    ? projects.filter((p) => p.organization === selectedOrganizationId)
    : projects;

  if (status === "loading" && projects.length === 0) {
    return <div className="flex h-8 w-32 animate-pulse rounded-full border border-line bg-surface sm:w-44" aria-hidden="true" />;
  }

  if (projectsForOrg.length === 0) {
    return (
      <Link
        href={ROUTES.onboarding}
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted transition-colors hover:border-accent/40 hover:text-ink hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <HugeiconsIcon icon={AddCircleIcon} size={12} color="currentColor" strokeWidth={1.5} />
        <span className="hidden sm:inline">New project</span>
        <span className="sm:hidden">New</span>
      </Link>
    );
  }

  const displayProject = selectedProject ?? projectsForOrg.find((p) => p.id === selectedProjectId) ?? projectsForOrg[0];

  return (
    <div className="group/project relative flex" data-state={status === "error" ? "error" : status === "loading" ? "loading" : undefined}>
      <div
        className={`
          flex items-center gap-2 rounded-full border bg-bg pl-1 pr-1 py-1
          border-line
          shadow-sm
          transition-all duration-150
          group-hover/project:border-line-soft group-hover/project:bg-surface
          group-focus-within/project:border-accent/50 group-focus-within/project:ring-1 group-focus-within/project:ring-accent/20
          group-active/project:translate-y-px
          data-[state=loading]:opacity-70
          data-[state=error]:border-sev-critical/40 data-[state=error]:bg-sev-critical/5
        `}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface border border-line font-mono text-[11px] font-semibold text-ink shadow-sm group-hover/project:border-line-soft">
          {(displayProject?.name ?? "?")[0]?.toUpperCase()}
        </span>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-[16ch] truncate text-[13px] font-medium leading-none tracking-tight text-ink md:max-w-[20ch]">
            {displayProject?.name ?? "Select project"}
          </p>
        </div>
        <span className="sm:hidden truncate text-sm font-medium text-ink max-w-[12ch]">{displayProject?.name ?? "—"}</span>
        <span className="ml-0.5 flex h-6 w-6 shrink-0 flex-col items-center justify-center gap-0 rounded-full bg-surface border border-line py-0.5 text-muted shadow-sm transition-colors group-hover/project:border-accent/30 group-hover/project:text-ink group-hover/project:bg-bg-panel">
          <HugeiconsIcon icon={ChevronUpIcon} size={8} color="currentColor" strokeWidth={1.5} className="-mb-0.5" />
          <HugeiconsIcon icon={ChevronDownIcon} size={8} color="currentColor" strokeWidth={1.5} className="-mt-0.5" />
        </span>
      </div>
      <select
        value={displayProject?.id ?? selectedProjectId ?? ""}
        onChange={(e) => selectProject(e.target.value)}
        disabled={status === "loading"}
        aria-label="Select project"
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
      <GlobalIncidentSearch />
      <HeaderActions />
    </header>
  );
}

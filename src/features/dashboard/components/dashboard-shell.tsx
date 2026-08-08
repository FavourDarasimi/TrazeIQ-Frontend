"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon, Logout01Icon } from "@hugeicons/core-free-icons";

import { DASHBOARD_NAV } from "@/config/navigation";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { useProjectContext } from "@/features/app/components/project-context";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { status, projects, selectedProjectId, selectProject, retry } =
    useProjectContext();

  async function handleLogout() {
    await signOut();
    router.replace(ROUTES.login);
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-bg-panel">
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link href={ROUTES.dashboard} className="font-mono text-sm font-semibold tracking-tight text-ink">
            traze<span className="text-accent">iq</span>
          </Link>
        </div>

        <div className="px-4">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Project
          </p>
          <div className="relative">
            <select
              value={selectedProjectId ?? ""}
              onChange={(event) => selectProject(event.target.value)}
              disabled={status === "loading" || projects.length === 0}
              className="h-10 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-9 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 disabled:opacity-50"
            >
              {status === "loading" ? (
                <option value="">Loading…</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
              <HugeiconsIcon icon={ChevronDownIcon} size={16} color="currentColor" strokeWidth={1.5} />
            </span>
          </div>
          {status === "error" ? (
            <button
              type="button"
              onClick={retry}
              className="mt-1.5 text-xs text-sev-critical transition-colors hover:text-ink"
            >
              Couldn&apos;t load projects — retry
            </button>
          ) : null}
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-0.5 px-3">
          {DASHBOARD_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  active
                    ? "border-l-2 border-accent bg-white/5 font-medium text-ink"
                    : "border-l-2 border-transparent text-muted hover:bg-accent/10 hover:text-ink hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                <span>{item.label}</span>
                {item.stub ? (
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    {item.stub}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs uppercase text-muted">
              {user?.name?.slice(0, 2) || user?.email?.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">
                {user?.name || user?.email}
              </p>
              <p className="truncate text-[11px] text-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="mx-auto w-full max-w-[1500px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
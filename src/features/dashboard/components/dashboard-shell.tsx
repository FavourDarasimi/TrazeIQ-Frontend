"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";

import { DASHBOARD_NAV } from "@/config/navigation";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { useProjectContext } from "@/features/app/components/project-context";
import { AppHeader } from "@/features/dashboard/components/app-header";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { status, projects, selectedProjectId, selectProject, retry } =
    useProjectContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  // Restore and persist the collapsed state of the sidebar rail.
  useEffect(() => {
    const restore = async () => {
      try {
        if (
          window.localStorage.getItem("trazeiq-sidebar-collapsed") === "1"
        ) {
          setCollapsed(true);
        }
      } catch {
        // Storage unavailable — keep the default expanded state.
      }
    };
    void restore();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "trazeiq-sidebar-collapsed",
        collapsed ? "1" : "0",
      );
    } catch {
      // Storage unavailable — collapse still applies for this session.
    }
  }, [collapsed]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  async function handleLogout() {
    await signOut();
    router.replace(ROUTES.login);
  }

  return (
    <div className="flex min-h-screen">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          data-overlay
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-bg-panel transition-all duration-200 ease-out lg:translate-x-0 ${
          collapsed ? "lg:w-[68px]" : "lg:w-64"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex items-center justify-between px-5 pb-4 pt-5 ${
            collapsed ? "lg:justify-center" : ""
          }`}
        >
          <Link
            href={ROUTES.dashboard}
            className={`font-mono text-sm font-semibold tracking-tight text-ink ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            traze<span className="text-accent">iq</span>
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink lg:hidden"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:flex"
          >
            <HugeiconsIcon
              icon={collapsed ? ChevronRightIcon : ChevronLeftIcon}
              size={18}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        </div>

        <div
          className={`px-4 ${collapsed ? "lg:hidden" : ""}`}
        >
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

        <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {DASHBOARD_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                title={collapsed ? item.label : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  active
                    ? "bg-accent font-medium text-ink shadow-[0_0_20px_rgba(79,70,229,0.25)] hover:bg-accent"
                    : "text-muted hover:bg-accent/10 hover:text-ink hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                <span className={collapsed ? "lg:hidden" : ""}>
                  {item.label}
                </span>
                {item.stub ? (
                  <span
                    className={`ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted ${
                      collapsed ? "lg:hidden" : ""
                    }`}
                  >
                    {item.stub}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-4 py-4">
          <div
            className={`flex items-center gap-2.5 ${
              collapsed ? "lg:flex-col lg:justify-center lg:gap-2" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs uppercase text-muted">
              {user?.name?.slice(0, 2) || user?.email?.slice(0, 2)}
            </span>
            <div
              className={`min-w-0 flex-1 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
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

      <main
        className={`min-w-0 flex-1 transition-[margin] duration-200 ease-out ${
          collapsed ? "lg:ml-[68px]" : "lg:ml-64"
        }`}
      >
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
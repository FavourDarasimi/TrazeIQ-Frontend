"use client";

/* Hallmark · genre: modern-minimal · macrostructure: settings-app-family
 * design-system: Design.md · unified-settings-nav · accent: indigo · icon: Settings02Icon
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleIcon,
  ArrowUpDownIcon,
  BookOpen01Icon,
  Cancel01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";

import { DASHBOARD_NAV, SETTINGS_SUBNAV } from "@/config/navigation";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { useProjectContext } from "@/features/app/components/project-context";
import { AppHeader } from "@/features/dashboard/components/app-header";
import { FirstTourModal } from "@/features/onboarding/components/first-tour-modal";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { status, projects, selectedProjectId, selectedProject, selectProject, retry } =
    useProjectContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("trazeiq-sidebar-collapsed") === "1";
      }
    } catch {
      // Storage unavailable — keep expanded.
    }
    return false;
  });
  const [hasMounted, setHasMounted] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag to disable initial transition flash
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    try {
      window.localStorage.setItem(
        "trazeiq-sidebar-collapsed",
        collapsed ? "1" : "0",
      );
    } catch {
      // Storage unavailable — collapse still applies for this session.
    }
  }, [collapsed, hasMounted]);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-bg-panel shadow-[12px_0_40px_rgba(0,0,0,0.12)] ${hasMounted ? "transition-[width,transform] duration-200 ease-out" : ""} lg:translate-x-0 ${
          collapsed ? "lg:w-[76px]" : "lg:w-64"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex items-center justify-between border-b border-line px-4 pb-4 pt-4 ${
            collapsed ? "lg:flex-col lg:gap-4" : ""
          }`}
        >
          <Link
            href={ROUTES.dashboard}
            aria-label="TrazeIQ dashboard"
            className={`flex min-w-0 items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-ink ${
              collapsed ? "lg:justify-center" : ""
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent shadow-[0_0_18px_rgba(79,70,229,0.35)]">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
            <span className={collapsed ? "lg:hidden" : ""}>
            traze<span className="text-accent">iq</span>
            </span>
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
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute right-0 top-5 z-10 hidden h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-line bg-bg-panel text-muted shadow-[0_4px_16px_rgba(0,0,0,0.28)] transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:flex"
        >
          <HugeiconsIcon
            icon={collapsed ? ChevronRightIcon : ChevronLeftIcon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>

        <div
          className={`px-4  pt-5 ${collapsed ? "lg:hidden" : ""}`}
        >
            {status === "loading" && projects.length === 0 ? (
              <div className="h-10 animate-pulse rounded-lg border border-line bg-surface" aria-hidden="true" />
            ) : status === "ready" && projects.length === 0 ? (
              <Link
                href={ROUTES.onboarding}
                onClick={closeMenu}
                className="flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-line bg-surface px-3 text-sm text-muted transition-colors hover:border-accent/60 hover:text-ink"
              >
                <HugeiconsIcon
                  icon={AddCircleIcon}
                  size={14}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Create a project
              </Link>
            ) : (
              <>
                <div className="group relative">
                  <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-sm transition-colors group-hover:border-line-soft group-hover:bg-bg-panel group-focus-within:border-accent/50 group-focus-within:ring-1 group-focus-within:ring-accent/30">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                      {(selectedProject?.name ?? projects.find((p) => p.id === selectedProjectId)?.name ?? "?")[0]?.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-none tracking-tight text-ink">
                        {selectedProject?.name ?? projects.find((p) => p.id === selectedProjectId)?.name ?? "Select project"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-ok" />
                        {selectedProject?.environment ?? projects.find((p) => p.id === selectedProjectId)?.environment ?? "—"}
                      </p>
                    </div>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-bg-panel text-muted transition-colors group-hover:border-accent/30 group-hover:text-ink">
                      <HugeiconsIcon icon={ArrowUpDownIcon} size={12} color="currentColor" strokeWidth={1.5} />
                    </span>
                  </div>
                  <select
                    value={selectedProjectId ?? ""}
                    onChange={(event) => selectProject(event.target.value)}
                    disabled={projects.length === 0}
                    aria-label="Select project"
                    className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0 focus:outline-none disabled:cursor-not-allowed"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} · {project.environment}
                      </option>
                    ))}
                  </select>
                </div>
                {status === "error" ? (
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-sev-critical/20 bg-sev-critical/10 px-3 py-2 font-mono text-xs text-sev-critical transition-colors hover:bg-sev-critical/15 hover:text-ink"
                  >
                    Couldn&apos;t load projects — retry
                  </button>
                ) : null}
              </>
            )}
          </div>

        <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {isActive(pathname, ROUTES.settings) ? (
            <>
              <Link
                href={ROUTES.dashboard}
                onClick={closeMenu}
                className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon icon={ChevronLeftIcon} size={16} color="currentColor" strokeWidth={1.5} />
                <span className={collapsed ? "lg:hidden" : ""}>Settings</span>
              </Link>
              <div className="mb-2 border-b border-line" />
              {[
                { href: ROUTES.settings, label: "Overview", icon: DASHBOARD_NAV.find((item) => item.href === ROUTES.settings)!.icon },
                ...SETTINGS_SUBNAV,
              ].map((item) => {
                const active =
                  item.href === ROUTES.settings
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "lg:justify-center lg:px-0" : ""} ${active ? "bg-accent font-medium text-ink shadow-[0_0_20px_rgba(79,70,229,0.25)]" : "text-muted hover:bg-accent/10 hover:text-ink hover:shadow-[0_0_20px_rgba(79,70,229,0.15)]"}`}
                  >
                    <HugeiconsIcon icon={item.icon} size={20} color="currentColor" strokeWidth={1.5} />
                    <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              {DASHBOARD_NAV.filter((i) => i.href !== ROUTES.settings).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
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
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
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
              <Link
                href={ROUTES.settings}
                onClick={closeMenu}
                title={collapsed ? "Settings" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-accent/10 hover:text-ink hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <HugeiconsIcon icon={DASHBOARD_NAV.find((item) => item.href === ROUTES.settings)!.icon} size={20} color="currentColor" strokeWidth={1.5} />
                <span className={collapsed ? "lg:hidden" : ""}>Settings</span>
                <HugeiconsIcon icon={ChevronRightIcon} size={16} color="currentColor" strokeWidth={1.5} className={collapsed ? "lg:hidden" : "ml-auto"} />
              </Link>
            </>
          )}

        </nav>

        {!isActive(pathname, ROUTES.settings) ? <div className="px-3 pb-3">
          <Link
            href={ROUTES.docs}
            onClick={closeMenu}
            title={collapsed ? "Docs" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-accent/10 hover:text-ink hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={20} color="currentColor" strokeWidth={1.5} />
            <span className={collapsed ? "lg:hidden" : ""}>Docs</span>
          </Link>
        </div> : null}

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
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`min-w-0 flex-1 ${hasMounted ? "transition-[margin] duration-200 ease-out" : ""} ${
          collapsed ? "lg:ml-[76px]" : "lg:ml-64"
        }`}
      >
        <AppHeader onOpenMenu={() => setMenuOpen(true)} />
        <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
      <FirstTourModal />
    </div>
  );
}

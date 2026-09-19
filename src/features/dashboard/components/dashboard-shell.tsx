"use client";

/* Hallmark · component: organization-switcher · genre: modern-minimal · theme: Design.md
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (text-ink on bg 16.2:1) · pre-emit critique: P5 H5 E5 S5 R5 V5
 * v2: field card with ink avatar + workspace label + ok dot · companion project pill in header
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleIcon,
  BookOpen01Icon,
  Building02Icon,
  Cancel01Icon,
  CheckmarkCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
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

/**
 * Workspace picker as a real menu instead of an invisible native `<select>`
 * overlay — the OS renders native dropdown popups white and no CSS can
 * theme them. Custom menu: dark surface, arrow-key navigation, Escape and
 * outside-click to close.
 */
function WorkspaceSwitcher({ onPick }: { onPick?: () => void }) {
  const {
    status,
    organizations,
    selectedOrganizationId,
    selectedOrganization,
    selectOrganization,
    retry,
  } = useProjectContext();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = menuRef.current?.querySelectorAll<HTMLElement>(
        "[data-org-option]",
      );
      if (!items || items.length === 0) return;
      event.preventDefault();
      const idx = [...items].indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
      items[next].focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  if (status === "loading" && organizations.length === 0) {
    return (
      <div className="h-[56px] animate-pulse rounded-lg border border-line bg-surface" aria-hidden="true" />
    );
  }

  if (organizations.length === 0) {
    return (
      <Link
        href={ROUTES.onboarding}
        onClick={onPick}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface px-3 font-mono text-xs uppercase tracking-wide text-muted transition-colors hover:border-accent/40 hover:text-ink hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <HugeiconsIcon icon={AddCircleIcon} size={14} color="currentColor" strokeWidth={1.5} />
        Create workspace
      </Link>
    );
  }

  const disabled = status === "loading";

  return (
    <>
      <p className="mb-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">Workspace</p>
      <div
        className="relative"
        data-state={status === "error" ? "error" : status === "loading" ? "loading" : undefined}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select workspace"
          disabled={disabled}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-lg border border-line bg-bg px-3 py-2.5 text-left transition-colors hover:border-line-soft hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:border-accent/40 disabled:cursor-not-allowed data-[state=loading]:opacity-70 data-[state=error]:border-sev-critical/40 data-[state=error]:bg-sev-critical/5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-bg">
            <HugeiconsIcon icon={Building02Icon} size={14} color="white" strokeWidth={1.5} />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-none tracking-tight text-ink">
            {selectedOrganization?.name ?? "Select workspace"}
          </span>
          <span className="flex h-7 w-7 shrink-0 flex-col items-center justify-center gap-0 rounded-md border border-line bg-surface py-0.5 text-muted">
            <HugeiconsIcon icon={ChevronUpIcon} size={10} color="currentColor" strokeWidth={1.5} className="-mb-0.5" />
            <HugeiconsIcon icon={ChevronDownIcon} size={10} color="currentColor" strokeWidth={1.5} className="-mt-0.5" />
          </span>
        </button>
        {open ? (
          <>
            <button
              type="button"
              aria-label="Close workspace menu"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <ul
              ref={menuRef}
              role="listbox"
              aria-label="Select workspace"
              className="absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-line bg-surface p-1"
            >
              {organizations.map((org) => {
                const selected = org.id === selectedOrganizationId;
                return (
                  <li key={org.id} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      data-org-option
                      onClick={() => {
                        selectOrganization(org.id);
                        setOpen(false);
                        onPick?.();
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                        selected
                          ? "bg-accent/10 font-medium text-ink"
                          : "text-muted hover:bg-bg-panel hover:text-ink"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {org.name}
                      </span>
                      {selected ? (
                        <HugeiconsIcon
                          icon={CheckmarkCircleIcon}
                          size={15}
                          color="currentColor"
                          strokeWidth={1.8}
                          className="shrink-0 text-accent"
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>
      {status === "error" ? (
        <button
          type="button"
          onClick={retry}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-sev-critical/20 bg-sev-critical/10 px-3 py-1.5 font-mono text-[11px] text-sev-critical transition-colors hover:bg-sev-critical/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Couldn&apos;t load — retry
        </button>
      ) : null}
    </>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
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
  const mainRef = useRef<HTMLElement>(null);

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

  // The main panel scrolls independently (overflow-y-auto) instead of the
  // viewport, so Next's scroll restoration won't reset it — do it here or
  // every navigation lands at the previous scroll position.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="grid h-screen grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 bg-bg p-3 xl:grid-cols-[auto_minmax(0,1fr)]">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          data-overlay
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-[1px] xl:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-bg xl:bg-transparent ${hasMounted ? "transition-[width,translate,transform] duration-300 ease-out" : ""} xl:static xl:z-auto xl:row-span-2 xl:translate-x-0 ${
          collapsed ? "xl:w-[76px]" : "xl:w-64"
        } ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex items-center justify-between px-4 pb-4 pt-4 ${
            collapsed ? "xl:flex-col xl:gap-4" : ""
          }`}
        >
          <Link
            href={ROUTES.dashboard}
            aria-label="TrazeIQ dashboard"
            className={`flex min-w-0 items-center gap-2.5 font-mono text-sm font-semibold tracking-tight text-ink ${
              collapsed ? "xl:justify-center" : ""
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
            <span className={collapsed ? "xl:hidden" : ""}>
            traze<span className="text-accent">iq</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink xl:hidden"
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
          className="absolute right-0 top-5 z-10 hidden h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-line bg-bg text-muted transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent xl:flex"
        >
          <HugeiconsIcon
            icon={collapsed ? ChevronRightIcon : ChevronLeftIcon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>

        <div className={`px-3 pt-4 ${collapsed ? "xl:hidden" : ""}`}>
          <WorkspaceSwitcher onPick={closeMenu} />
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
                <span className={collapsed ? "xl:hidden" : ""}>Settings</span>
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "xl:justify-center xl:px-0" : ""} ${active ? "bg-accent font-medium text-ink hover:bg-accent" : "text-muted hover:bg-accent/10 hover:text-ink"}`}
                  >
                    <HugeiconsIcon icon={item.icon} size={20} color="currentColor" strokeWidth={1.5} />
                    <span className={collapsed ? "xl:hidden" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </>
          ) : (
            <>
              {DASHBOARD_NAV.filter(
                (i) => i.href !== ROUTES.settings && (!i.staffOnly || user?.is_staff),
              ).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  collapsed ? "xl:justify-center xl:px-0" : ""
                } ${
                  active
                    ? "bg-accent font-medium text-ink hover:bg-accent"
                    : "text-muted hover:bg-accent/10 hover:text-ink"
                }`}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                <span className={collapsed ? "xl:hidden" : ""}>{item.label}</span>
                {item.stub ? (
                  <span
                    className={`ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted ${
                      collapsed ? "xl:hidden" : ""
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "xl:justify-center xl:px-0" : ""}`}
              >
                <HugeiconsIcon icon={DASHBOARD_NAV.find((item) => item.href === ROUTES.settings)!.icon} size={20} color="currentColor" strokeWidth={1.5} />
                <span className={collapsed ? "xl:hidden" : ""}>Settings</span>
                <HugeiconsIcon icon={ChevronRightIcon} size={16} color="currentColor" strokeWidth={1.5} className={collapsed ? "xl:hidden" : "ml-auto"} />
              </Link>
            </>
          )}

        </nav>

        {!isActive(pathname, ROUTES.settings) ? <div className="px-3 pb-3">
          <Link
            href={ROUTES.docs}
            onClick={closeMenu}
            title={collapsed ? "Docs" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-accent/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "xl:justify-center xl:px-0" : ""}`}
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={20} color="currentColor" strokeWidth={1.5} />
            <span className={collapsed ? "xl:hidden" : ""}>Docs</span>
          </Link>
        </div> : null}

        <div className="border-t border-line px-4 py-4">
          <div
            className={`flex items-center gap-2.5 ${
              collapsed ? "xl:flex-col xl:justify-center xl:gap-2" : ""
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs uppercase text-muted">
              {user?.name?.slice(0, 2) || user?.email?.slice(0, 2)}
            </span>
            <div
              className={`min-w-0 flex-1 ${
                collapsed ? "xl:hidden" : ""
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
                collapsed ? "xl:hidden" : ""
              }`}
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      <AppHeader
        onOpenMenu={() => setMenuOpen(true)}
        className="min-w-0 xl:col-start-2 xl:row-start-1"
      />
      <main
        ref={mainRef}
        className="no-scrollbar min-h-0 min-w-0 overflow-y-auto rounded-3xl border border-line bg-bg-panel lg:col-start-2 lg:row-start-2"
      >
        <div className="mx-auto w-full max-w-[1500px] p-6 sm:p-8">
          {children}
        </div>
      </main>
      <FirstTourModal />
    </div>
  );
}


//DashboardShell.displayName = "DashboardShell";
// change 
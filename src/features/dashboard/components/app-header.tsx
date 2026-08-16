"use client";

import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { DASHBOARD_NAV } from "@/config/navigation";
import { ROUTES } from "@/constants";
import { HeaderActions } from "@/components/ui/header-actions";

const SETTINGS_LABELS: Record<string, string> = {
  team: "Team",
  alerts: "Alerts",
};

function pathCrumbs(pathname: string): string[] {
  const exact = DASHBOARD_NAV.find((item) => item.href === pathname);
  if (exact) return [exact.label];
  if (pathname.startsWith(ROUTES.settings)) {
    const rest = pathname
      .slice(ROUTES.settings.length)
      .replace(/^\/+|\/+$/g, "");
    if (!rest) return ["Settings"];
    const sub =
      SETTINGS_LABELS[rest] ??
      rest.charAt(0).toUpperCase() + rest.slice(1);
    return ["Settings", sub];
  }
  if (pathname.startsWith(ROUTES.incidents)) {
    const rest = pathname
      .slice(ROUTES.incidents.length)
      .replace(/^\/+|\/+$/g, "");
    if (rest) return ["Incidents", rest.slice(0, 8)];
    return ["Incidents"];
  }
  const nested = DASHBOARD_NAV.find((item) => pathname.startsWith(item.href));
  return nested ? [nested.label] : [pathname.replace(/^\/+/, "") || "Overview"];
}

export function AppHeader({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();
  const crumbs = pathCrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg-panel/95 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <HugeiconsIcon
            icon={Menu01Icon}
            size={22}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
        <nav aria-label="Breadcrumb" className="hidden lg:block">
          <ol className="flex items-center gap-1.5 font-mono text-xs text-muted">
            {crumbs.map((crumb, index) => (
              <li key={`${crumb}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-line-soft">
                    /
                  </span>
                ) : null}
                <span
                  className={
                    index === crumbs.length - 1 ? "text-ink" : "text-muted"
                  }
                >
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <HeaderActions />
    </header>
  );
}
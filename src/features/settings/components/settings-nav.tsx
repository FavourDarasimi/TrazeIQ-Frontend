"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants";

const SETTINGS_NAV = [
  { href: ROUTES.settings, label: "Overview" },
  { href: ROUTES.settingsTeam, label: "Team" },
  { href: ROUTES.settingsAlerts, label: "Alerts" },
];

/* Hallmark · genre: modern-minimal · macrostructure: settings-app-family
 * design-system: Design.md · designed-as-app
 */
export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings sections"
      className="flex items-center gap-6 border-b border-line"
    >
      {SETTINGS_NAV.map((item) => {
        const active =
          item.href === ROUTES.settingsTeam
            ? pathname.startsWith(item.href)
            : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative -mb-px py-3 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors ${
              active
                ? "border-b-2 border-accent font-medium text-ink"
                : "border-b-2 border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants";

const SETTINGS_NAV = [
  { href: ROUTES.settings, label: "Overview" },
  { href: ROUTES.settingsTeam, label: "Team" },
  { href: ROUTES.settingsAlerts, label: "Alerts" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 border-b border-line pb-0">
      {SETTINGS_NAV.map((item) => {
        const active =
          item.href === ROUTES.settingsTeam
            ? pathname.startsWith(item.href)
            : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
              active
                ? "border-accent font-medium text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

/* Hallmark · macrostructure: settings-app-family · tone: technical · anchor hue: indigo
 * genre: modern-minimal · theme: Design.md monochrome+accent · nav: pills with icons
 * pre-emit critique: P5 H5 E5 S5 R5 V5 · tokens: var(--color-accent) etc.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  Layers02Icon,
  Notification03Icon,
  Plug02Icon,
  UserGroupIcon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";

import { ROUTES } from "@/constants";

const SETTINGS_NAV = [
  { href: ROUTES.settings, label: "Overview", icon: Layers02Icon },
  { href: ROUTES.settingsTeam, label: "Team", icon: UserGroupIcon },
  { href: ROUTES.settingsAlerts, label: "Alerts", icon: Notification03Icon },
  { href: ROUTES.settingsIntegrations, label: "Integrations", icon: Plug02Icon },
  { href: ROUTES.settingsPreferences, label: "Preferences", icon: UserSettings01Icon },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref =
    SETTINGS_NAV.find((item) =>
      item.href === ROUTES.settings ? pathname === item.href : pathname.startsWith(item.href),
    )?.href ?? ROUTES.settings;

  return (
    <>
      {/* Mobile: native select to avoid crowded 5-pill overflow at 320/375 */}
      <div className="border-b border-line pb-3 sm:hidden">
        <label htmlFor="settings-nav-select" className="sr-only">
          Settings section
        </label>
        <div className="relative">
          <select
            id="settings-nav-select"
            value={activeHref}
            onChange={(e) => router.push(e.target.value)}
            className="h-10 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-9 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
          >
            {SETTINGS_NAV.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
            <HugeiconsIcon icon={ChevronDownIcon} size={16} color="currentColor" strokeWidth={1.5} />
          </span>
        </div>
      </div>

      {/* Desktop: pill nav */}
      <nav
        aria-label="Settings sections"
        className="hidden items-center gap-6 border-b border-line sm:flex"
      >
        {SETTINGS_NAV.map((item) => {
          const active =
            item.href === ROUTES.settings
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active
                  ? "border-accent font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={14} color="currentColor" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
import {
  FlashIcon,
  Home01Icon,
  Layers02Icon,
  Notification03Icon,
  Plug02Icon,
  Settings02Icon,
  TerminalIcon,
  UserGroupIcon,
  UserSettings01Icon,
} from "@hugeicons/core-free-icons";

import { ROUTES } from "@/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof Home01Icon;
  stub?: string;
};

export const DASHBOARD_NAV: NavItem[] = [
  { href: ROUTES.dashboard, label: "Overview", icon: Home01Icon },
  { href: ROUTES.incidents, label: "Incidents", icon: FlashIcon },
  { href: ROUTES.logs, label: "Logs", icon: TerminalIcon },
  { href: ROUTES.services, label: "Services", icon: Layers02Icon },
  { href: ROUTES.settings, label: "Settings", icon: Settings02Icon },
];

export type SettingsSubItem = {
  href: string;
  label: string;
  icon: typeof Home01Icon;
};

export const SETTINGS_SUBNAV: SettingsSubItem[] = [
  { href: ROUTES.settingsTeam, label: "Team", icon: UserGroupIcon },
  { href: ROUTES.settingsAlerts, label: "Alerts", icon: Notification03Icon },
  { href: ROUTES.settingsIntegrations, label: "Integrations", icon: Plug02Icon },
  { href: ROUTES.settingsPreferences, label: "Preferences", icon: UserSettings01Icon },
];

export const SECTION_STUBS: Record<string, { title: string; body: string }> = {
  [ROUTES.dashboard]: {
    title: "Overview",
    body: "Open incident counts, error-rate trends, and top recurring errors land here in Phase 3C.",
  },
  [ROUTES.logs]: {
    title: "Logs",
    body: "Structured, non-error log ingestion is optional scope and not wired up yet.",
  },
  [ROUTES.aiAssistant]: {
    title: "AI Assistant",
    body: "The AI Incident Copilot lives on each incident's detail page — Phase 2 wires it to the analysis endpoints.",
  },
  [ROUTES.settings]: {
    title: "Settings",
    body: "Team invites and roles live under Team; alert rules and Slack delivery live under Alerts.",
  },
};
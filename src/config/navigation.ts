import {
  FlashIcon,
  Home01Icon,
  Layers02Icon,
  Settings01Icon,
  SparklesIcon,
  TerminalIcon,
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
  {
    href: ROUTES.aiAssistant,
    label: "AI Assistant",
    icon: SparklesIcon,
    stub: "Phase 2",
  },
  { href: ROUTES.settings, label: "Settings", icon: Settings01Icon },
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
  [ROUTES.services]: {
    title: "Services",
    body: "Per-service health and breakdown views arrive in a later phase.",
  },
  [ROUTES.aiAssistant]: {
    title: "AI Assistant",
    body: "The AI Incident Copilot lives on each incident's detail page — Phase 2 wires it to the analysis endpoints.",
  },
  [ROUTES.settings]: {
    title: "Settings",
    body: "Team invites, roles, and alert-rule configuration arrive in Phase 4.",
  },
};
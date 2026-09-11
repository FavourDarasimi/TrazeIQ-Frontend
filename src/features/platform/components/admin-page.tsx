"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  Building02Icon,
  Layers02Icon,
  Shield01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/glass-card";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

import { AdminHealth } from "@/features/platform/components/admin-health";
import { AdminOrganizations } from "@/features/platform/components/admin-organizations";
import { AdminOverview } from "@/features/platform/components/admin-overview";
import { AdminProjects } from "@/features/platform/components/admin-projects";
import { AdminUsers } from "@/features/platform/components/admin-users";

/* Hallmark · genre: modern-minimal · macrostructure: settings-app-family
 * design-system: Design.md · read-only monitoring surface, staff-gated
 */

const TABS = [
  { id: "overview", label: "Overview", icon: Shield01Icon },
  { id: "users", label: "Users", icon: UserGroupIcon },
  { id: "organizations", label: "Organizations", icon: Building02Icon },
  { id: "projects", label: "Projects", icon: Layers02Icon },
  { id: "health", label: "Health", icon: Activity01Icon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminPage() {
  const { status, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${ROUTES.admin}/login`);
    }
  }, [status, router]);

  if (status === "loading") return <Spinner label="Checking access…" />;

  if (status === "unauthenticated") return <Spinner label="Redirecting…" />;

  // UX gate only — every /api/v1/admin/* endpoint re-checks is_staff
  // server-side and returns 403 for non-staff callers.
  if (!user?.is_staff) {
    return (
      <EmptyState
        icon={Shield01Icon}
        title="Restricted to staff"
        body="Platform monitoring is available to TrazeIQ operators only. If you need access, ask an existing staff member to grant it."
        action={
          <Link
            href={ROUTES.dashboard}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to dashboard
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
          Platform admin · read-only
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
          Website monitoring
        </h1>
        <p className="mt-1 text-sm text-muted">
          Site-wide usage, tenants, projects and pipeline health. This surface never mutates data.
        </p>
      </div>

      <nav aria-label="Platform sections" className="flex items-center gap-6 overflow-x-auto border-b border-line">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={14} color="currentColor" strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab === "overview" ? <AdminOverview /> : null}
      {tab === "users" ? <AdminUsers /> : null}
      {tab === "organizations" ? <AdminOrganizations /> : null}
      {tab === "projects" ? <AdminProjects /> : null}
      {tab === "health" ? <AdminHealth /> : null}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  ArrowLeft01Icon,
  Building02Icon,
  Layers02Icon,
  Shield01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

import { AdminHealth } from "@/features/platform/components/admin-health";
import { AdminOrganizations } from "@/features/platform/components/admin-organizations";
import { AdminOverview } from "@/features/platform/components/admin-overview";
import { AdminProjects } from "@/features/platform/components/admin-projects";
import { AdminUsers } from "@/features/platform/components/admin-users";
import { AdminLoading } from "@/features/platform/components/admin-ui";

/* Platform admin console — dark ops console that follows the page's dark mode.
 * Staff-gated read-only surface (UX gate; every /api/v1/admin/*
 * endpoint re-checks is_staff server-side). Same calm Stripe-style layout
 * as the light reference, translated to --color-bg / --color-surface.
 */

const TABS = [
  { id: "overview", label: "Overview", icon: Shield01Icon },
  { id: "users", label: "Users", icon: UserGroupIcon },
  { id: "organizations", label: "Organizations", icon: Building02Icon },
  { id: "projects", label: "Projects", icon: Layers02Icon },
  { id: "health", label: "Health", icon: Activity01Icon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SidebarNav({
  tab,
  onSelect,
}: {
  tab: TabId;
  onSelect: (t: TabId) => void;
}) {
  return (
    <nav aria-label="Platform sections" className="flex flex-col gap-0.5">
      {TABS.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              active
                ? "bg-white/[0.06] font-medium text-ink"
                : "text-muted hover:bg-white/[0.04] hover:text-ink"
            }`}
          >
            <HugeiconsIcon
              icon={item.icon}
              size={17}
              color="currentColor"
              strokeWidth={1.5}
              className={active ? "text-ink" : "text-muted"}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export function AdminPage() {
  const { status, user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${ROUTES.admin}/login`);
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-bg">
        <AdminLoading label={status === "loading" ? "Checking access…" : "Redirecting…"} />
      </div>
    );
  }

  if (!user?.is_staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-bg text-muted">
            <HugeiconsIcon icon={Shield01Icon} size={20} color="currentColor" strokeWidth={1.5} />
          </span>
          <h1 className="mt-4 text-base font-semibold text-ink">Restricted to staff</h1>
          <p className="mt-1 text-sm text-muted">
            Platform monitoring is available to TrazeIQ operators only. If you need
            access, ask an existing staff member to grant it.
          </p>
          <Link
            href={ROUTES.dashboard}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={15} color="currentColor" strokeWidth={1.5} />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="flex min-h-screen">
        {/* Sidebar — sits on --color-bg-panel, same dark family as dashboard */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-bg-panel lg:flex">
          <div className="border-b border-line px-5 py-5">
            <p className="text-[13px] font-semibold text-ink">
              TrazeIQ <span className="font-normal text-muted">· Admin</span>
            </p>
            <p className="mt-0.5 text-xs text-muted">Platform operations</p>
          </div>
          <div className="flex-1 px-3 py-4">
            <SidebarNav tab={tab} onSelect={setTab} />
          </div>
          <div className="border-t border-line px-5 py-4">
            <p className="truncate text-xs text-muted">
              Signed in as <span className="font-medium text-ink">{user.email}</span>
            </p>
            <Link
              href={ROUTES.dashboard}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent/80"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} color="currentColor" strokeWidth={1.5} />
              Back to dashboard
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Mobile nav */}
          <div className="border-b border-line bg-bg-panel px-4 py-3 lg:hidden">
            <p className="mb-2 text-[13px] font-semibold text-ink">
              TrazeIQ <span className="font-normal text-muted">· Admin</span>
            </p>
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-white/[0.06] font-medium text-ink"
                        : "text-muted hover:bg-white/[0.04] hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8" key={tab}>
            {tab === "overview" ? <AdminOverview /> : null}
            {tab === "users" ? <AdminUsers /> : null}
            {tab === "organizations" ? <AdminOrganizations /> : null}
            {tab === "projects" ? <AdminProjects /> : null}
            {tab === "health" ? <AdminHealth /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

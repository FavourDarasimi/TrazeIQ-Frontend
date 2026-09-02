// Hallmark · genre: modern-minimal · macrostructure: component-playground · design-system: /Design.md · designed-as-app
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import { Footer } from "@/features/landing/components/footer";
import { Logo } from "@/features/landing/components/navbar";
import { Container } from "@/components/ui/shared";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";

import { DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";
import { DocsSearch, SearchTrigger } from "./docs-search";
import { allNavItems } from "./docs-nav-data";
import { Code, DocsSection, DocsTable } from "./docs-shared";

import { DocsQuickstart } from "./docs-quickstart";
import { DocsPipeline } from "./docs-pipeline";
import { DocsLimits } from "./docs-limits";
import { DocsAuth } from "./docs-auth";
import { DocsOrganizations } from "./docs-organizations";
import { DocsProjects } from "./docs-projects";
import { DocsIngestion } from "./docs-ingestion";
import { DocsReadApi } from "./docs-read-api";
import { DocsTimeline } from "./docs-timeline";
import { DocsAnalytics } from "./docs-analytics";
import { DocsAlerts } from "./docs-alerts";
import { DocsSlack } from "./docs-slack";
import { DocsRealtime } from "./docs-realtime";
import { DocsNotifications } from "./docs-notifications";
import { DocsSecurity } from "./docs-security";
import { DocsAudit } from "./docs-audit";
import { DocsErrors } from "./docs-errors";
import { DocsReference } from "./docs-reference";

function DocsProductOverview() {
  return (
    <DocsSection
      id="overview"
      label="Product"
      title="TrazeIQ helps small teams catch production issues before customers do"
      sub="The platform collects errors, groups repeated failures, and turns noisy production signals into a single, actionable incident workflow."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Collect", body: "Capture errors from your backend, APIs, workers, and jobs in one place." },
          { title: "Group", body: "Merge repeated failures into a single incident so your team is not chasing duplicates." },
          { title: "Analyze", body: "Use AI to highlight the likely root cause and suggested fix before the ticket escalates." },
          { title: "Alert", body: "Send the right issue to Slack, notifications, and the dashboard without polling." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-line bg-bg-panel p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{item.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </DocsSection>
  );
}

function DocsWhyTrazeIQ() {
  return (
    <DocsSection
      id="why-trazeiq"
      label="Why teams choose us"
      title="Built for small SaaS teams that need clarity, not a giant observability stack"
      sub="TrazeIQ is designed for fast-moving product teams that need a practical signal-to-action workflow without Datadog-scale overhead."
    >
      <DocsTable
        head={["Need", "Typical workflow", "TrazeIQ outcome"]}
        rows={[
          [
            "Catch new production issues quickly",
            "Dashboards are noisy and alerts are delayed.",
            "A new error is grouped, prioritized, and surfaced in a single incident track.",
          ],
          [
            "Understand the likely cause",
            "Teams manually inspect logs and stack traces.",
            "AI produces a root-cause summary and fix suggestion before investigation deepens.",
          ],
          [
            "Keep the team aligned",
            "Updates are spread across chat, email, and comments.",
            "One incident timeline keeps status, comments, assignments, and notifications in sync.",
          ],
        ]}
      />
    </DocsSection>
  );
}

function DocsOnboardingChecklist() {
  return (
    <DocsSection
      id="setup"
      label="Onboarding"
      title="Get to your first incident in under 10 minutes"
      sub="The setup flow is intentionally simple: define your project, send one event, and let TrazeIQ turn the noise into a clean investigation path."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { step: "01", title: "Create a project", body: "Create your organization, add a project, and generate a project API key for ingestion." },
          { step: "02", title: "Send one event", body: "Capture a production error with a single POST to the ingestion endpoint from your app." },
          { step: "03", title: "Review the incident", body: "TrazeIQ groups repeats, surfaces the issue, and summarizes the likely root cause." },
          { step: "04", title: "Set alerts", body: "Connect Slack or notifications to trigger when issues cross the threshold your team cares about." },
        ].map((item) => (
          <div key={item.step} className="rounded-xl border border-line bg-bg-panel p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{item.step}</p>
            <h3 className="mt-3 text-base font-medium text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </DocsSection>
  );
}

function DocsPricing() {
  return (
    <DocsSection
      id="pricing"
      label="Pricing"
      title="Simple plans for teams at every stage"
      sub="The product is designed to be self-serve and lightweight — start small, add capacity as your team and incident volume grow."
    >
      <DocsTable
        head={["Plan", "Best for", "Includes"]}
        rows={[
          [
            <Code key="starter">Starter</Code>,
            "Early-stage SaaS teams with a few apps and services",
            "Project-based monitoring, core alerts, incident timeline, basic AI summaries.",
          ],
          [
            <Code key="growth">Growth</Code>,
            "Teams with multiple services and ongoing production load",
            "Advanced alert rules, more event volume, richer team workflows, shared ownership.",
          ],
          [
            <Code key="enterprise">Enterprise</Code>,
            "Larger organizations with compliance and operational rigor",
            "Custom retention, managed setup, deeper access controls, and expanded support.",
          ],
        ]}
      />
      <p className="text-sm leading-relaxed text-muted">
        For actual pricing, billing cadence, and enterprise contracts, use the product billing flow inside the app. This section is meant to explain the product model rather than replace the live commercial configuration.
      </p>
    </DocsSection>
  );
}

export function DocsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(allNavItems[0]?.id ?? "quickstart");
  const { status: authStatus } = useAuth();
  const authReady = authStatus !== "loading";
  const authenticated = authStatus === "authenticated";
  const mainRef = useRef<HTMLDivElement>(null);

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "/" && !searchOpen && (e.target as HTMLElement)?.tagName !== "INPUT" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        // optional vim-like quick open when not typing
        // don't hijack when user is in input
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [drawerOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  // Scroll spy via IntersectionObserver (respects reduced-motion: observer itself is not animation)
  useEffect(() => {
    const ids = allNavItems.map((i) => i.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible entry that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // top offset accounts for sticky header (64px) + small margin
        rootMargin: "-72px 0px -55% 0px",
        threshold: [0, 0.2, 0.5, 1],
      }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // respect prefers-reduced-motion: check media query
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    // also update hash without adding extra history when user came via search
    window.history.pushState(null, "", `#${id}`);
    setActiveId(id);
    setDrawerOpen(false);
    setSearchOpen(false);
  }, []);

  return (
    <main className="bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={drawerOpen ? "Close docs navigation" : "Open docs navigation"}
              aria-expanded={drawerOpen}
              aria-controls="docs-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <HugeiconsIcon
                icon={drawerOpen ? Cancel01Icon : Menu01Icon}
                size={20}
                color="currentColor"
                strokeWidth={1.5}
              />
            </button>
            <Logo href="/" />
            <span className="hidden font-mono text-xs text-muted sm:inline">/ docs</span>
          </div>

          <div className="flex items-center gap-3">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
            <div className="hidden items-center gap-3 sm:flex">
              {authReady ? (
                authenticated ? (
                  <a
                    href={ROUTES.dashboard}
                    className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Dashboard
                  </a>
                ) : (
                  <>
                    <a href={ROUTES.login} className="rounded-sm text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      Sign in
                    </a>
                    <a href={ROUTES.register} className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                      Start Monitoring
                    </a>
                  </>
                )
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" id="docs-drawer">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[300px] max-w-[86vw] flex-col border-r border-line bg-bg shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Documentation</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="currentColor" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocsSidebar activeId={activeId} onNavigate={scrollTo} variant="drawer" />
            </div>
            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-line bg-bg-panel px-3 py-2 font-mono text-xs text-muted hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="text-muted">Search docs</span>
                <span className="ml-auto rounded bg-surface px-1.5 py-0.5 text-[10px]">⌘K</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DocsSearch open={searchOpen} onOpenChange={setSearchOpen} onNavigate={scrollTo} />

      {/* Layout: sidebar | content | toc */}
      <div className="mx-auto flex w-full max-w-[1500px] items-start">
        <DocsSidebar activeId={activeId} onNavigate={scrollTo} />

        <div ref={mainRef} className="min-w-0 flex-1">
          <Container className="max-w-3xl py-10 sm:py-12">
            {/* Hero */}
            <div className="flex flex-col gap-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">documentation</p>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
                Monitor what breaks before customers do.
              </h1>
              <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                TrazeIQ helps product and engineering teams capture production errors, understand the likely root cause, and resolve incidents before they turn into noisy customer-facing outages.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <a href="#quickstart" className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-ink hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-accent">Get started</a>
                <a href="#why-trazeiq" className="inline-flex items-center rounded-full border border-line bg-bg-panel px-4 py-2 text-sm text-ink hover:border-line-soft focus-visible:outline-2 focus-visible:outline-accent">Why TrazeIQ</a>
                <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex items-center rounded-full border border-line bg-transparent px-4 py-2 text-sm text-muted hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent">Press ⌘K to search</button>
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-12">
              {/* Product overview */}
              <DocsProductOverview />
              <DocsWhyTrazeIQ />
              <DocsOnboardingChecklist />
              <DocsPricing />

              {/* Getting Started */}
              <DocsQuickstart />
              <DocsPipeline />
              <DocsLimits />

              {/* Authentication */}
              <DocsAuth />

              {/* Account & Team */}
              <DocsOrganizations />
              <DocsProjects />

              {/* API Reference */}
              <DocsIngestion />
              <DocsReadApi />
              <DocsTimeline />
              <DocsAnalytics />

              {/* Integrations & Alerts */}
              <DocsAlerts />
              <DocsSlack />
              <DocsRealtime />
              <DocsNotifications />

              {/* Security & Reference */}
              <DocsSecurity />
              <DocsAudit />
              <DocsErrors />
              <DocsReference />
            </div>
          </Container>
        </div>

        <DocsToc activeId={activeId} />
      </div>

      <Footer />
    </main>
  );
}

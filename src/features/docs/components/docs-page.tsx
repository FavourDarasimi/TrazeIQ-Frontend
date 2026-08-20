// Hallmark · genre: modern-minimal · macrostructure: component-playground · design-system: /Design.md · designed-as-app
/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";

import { Footer } from "@/features/landing/components/footer";
import { Logo } from "@/features/landing/components/navbar";
import { Container } from "@/components/ui/shared";

import { DocsIngestion } from "./docs-ingestion";
import { DocsLimits } from "./docs-limits";
import { DocsPipeline } from "./docs-pipeline";
import { DocsQuickstart } from "./docs-quickstart";
import { DocsReadApi } from "./docs-read-api";
import { DocsSecurity } from "./docs-security";

const toc = [
  { label: "Quickstart", href: "#quickstart" },
  { label: "Ingestion API", href: "#ingestion" },
  { label: "Concepts", href: "#pipeline" },
  { label: "Read API", href: "#read-api" },
  { label: "Limits", href: "#limits" },
  { label: "Security", href: "#security" },
];

export function DocsPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="bg-bg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Logo href="/" />
          <nav className="hidden items-center gap-8 md:flex">
            {toc.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-sm text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/login"
              className="rounded-sm text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign in
            </a>
            <a
              href="/register"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start Monitoring
            </a>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
          >
            <HugeiconsIcon
              icon={open ? Cancel01Icon : Menu01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        </Container>

        {open ? (
          <div className="border-t border-line bg-bg-panel md:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {toc.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
                <a
                  href="/login"
                  className="rounded-lg border border-line px-3 py-2.5 text-center text-sm text-ink transition-colors hover:border-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Sign in
                </a>
                <a
                  href="/register"
                  className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Start Monitoring
                </a>
              </div>
            </Container>
          </div>
        ) : null}
      </header>

      <Container className="max-w-3xl py-16">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            documentation
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Send an error. Read the incident back.
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            TrazeIQ watches your production errors, groups the repeats, gets an
            AI root cause and fix, and tells your team — before a customer
            does. This page is the whole integration guide.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <DocsQuickstart />
          <DocsIngestion />
          <DocsPipeline />
          <DocsReadApi />
          <DocsLimits />
          <DocsSecurity />
        </div>
      </Container>

      <Footer />
    </main>
  );
}
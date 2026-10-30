import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/shared";
import { Footer } from "@/features/landing/components/footer";
import { DocsDashboardChip, DocsHeader } from "@/features/docs/components/docs-header";
import { getDocGroups, getSearchIndex } from "@/features/docs/lib/docs";

export const metadata: Metadata = {
  title: "Docs — TrazeIQ",
  description:
    "Install TrazeIQ, ingest events, read data back, and route alerts — SDK guides, the full API, and the security model.",
};

export default function DocsHome() {
  const groups = getDocGroups();
  const searchIndex = getSearchIndex();

  return (
    <main className="bg-bg">
      <DocsHeader entries={searchIndex} />

      <Container className="max-w-5xl py-10 sm:py-14">
        <DocsDashboardChip />

        <div className="mt-8 flex flex-col gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
            Developer docs
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Everything to ship error monitoring with TrazeIQ
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            One ingest endpoint, deduplicated incidents, live timelines, and
            alerts that reach your team where they work. Start with the
            quickstart, then follow your stack&apos;s SDK guide — or drop to the
            raw API and carry your own code.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/docs/quickstart"
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
            >
              Send your first event
            </Link>
            <Link
              href="/docs/errors"
              className="rounded-full border border-line bg-bg-panel px-5 py-2 text-sm font-medium text-muted transition-colors hover:border-line-soft hover:text-ink"
            >
              Error-code reference
            </Link>
          </div>
          <p className="pt-1 font-mono text-xs text-muted">
            Tip: press ⌘K to search across every page.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-14">
          {groups.map((group) => (
            <section key={group.section} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {group.label}
                </p>
                <p className="max-w-2xl text-sm leading-relaxed text-muted">
                  {group.description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className="group flex flex-col gap-2 rounded-xl border border-line bg-bg-panel p-5 transition-colors hover:border-line-soft"
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-medium text-ink">
                      {item.title}
                      <span
                        aria-hidden
                        className="text-muted transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                    <span className="text-sm leading-relaxed text-muted">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-bg-panel p-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-ink">
              Not sure where to start?
            </p>
            <p className="text-sm leading-relaxed text-muted">
              The quickstart takes about two minutes: one snippet, one event,
              one incident in your dashboard.
            </p>
          </div>
          <Link
            href="/docs/quickstart"
            className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
          >
            Open quickstart
          </Link>
        </div>
      </Container>

      <Footer />
    </main>
  );
}
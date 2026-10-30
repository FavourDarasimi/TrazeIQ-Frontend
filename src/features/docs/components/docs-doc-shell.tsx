import Link from "next/link";

import { Footer } from "@/features/landing/components/footer";
import { Container } from "@/components/ui/shared";
import { CodeLangProvider } from "./docs-code-context";
import { DocsBodyView } from "./docs-body-view";
import { DocsDashboardChip, DocsHeader } from "./docs-header";
import { DocsPageToc } from "./docs-page-toc";
import {
  getDocGroups,
  getDocMeta,
  getHeadings,
  getPrevNext,
  getSearchIndex,
} from "../lib/docs";

/**
 * Per-page docs shell. Sidebar, page header, and prev/next all come from the
 * doc registry — no hand-maintained nav config. Code blocks get the global
 * tab-sync provider so language choice persists across pages.
 */
export function DocShell({ slug }: { slug: string }) {
  const meta = getDocMeta(slug);
  const groups = getDocGroups();
  const { prev, next } = getPrevNext(slug);
  const headings = getHeadings(slug);
  const searchIndex = getSearchIndex();

  if (!meta) return null;

  return (
    <CodeLangProvider>
      <main className="bg-bg">
        <DocsHeader entries={searchIndex} />

        <div className="mx-auto flex w-full max-w-[1500px] items-start">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto py-6 pr-4 lg:block">
            <DocsDashboardChip />
            <nav aria-label="Docs sections" className="mt-6 flex flex-col gap-6">
              {groups.map((group) => (
                <div key={group.section} className="flex flex-col gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-0.5 border-l border-line">
                    {group.items.map((item) => {
                      const isActive = item.slug === slug;
                      return (
                        <li key={item.slug}>
                          <Link
                            href={`/docs/${item.slug}`}
                            aria-current={isActive ? "true" : undefined}
                            className={`-ml-px block border-l py-1.5 pl-3 pr-2 text-sm transition-colors ${
                              isActive
                                ? "border-accent bg-accent/10 text-ink"
                                : "border-transparent text-muted hover:border-line-soft hover:text-ink"
                            }`}
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <Container className="max-w-3xl py-10 sm:py-12">
              {/* Mobile section nav */}
              <details className="mb-8 rounded-lg border border-line bg-bg-panel px-4 py-3 lg:hidden">
                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Sections
                </summary>
                <nav aria-label="Docs sections" className="mt-3 flex flex-col gap-4">
                  {groups.map((group) => (
                    <div key={group.section} className="flex flex-col gap-1">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                        {group.label}
                      </p>
                      {group.items.map((item) => (
                        <Link
                          key={item.slug}
                          href={`/docs/${item.slug}`}
                          className={`text-sm ${
                            item.slug === slug ? "text-accent" : "text-muted"
                          }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </details>

              {/* Breadcrumb */}
              <p className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted">
                <Link href="/docs" className="hover:text-ink">
                  Docs
                </Link>
                <span aria-hidden className="text-muted/60">
                  /
                </span>
                <span className="truncate">{meta.sectionLabel}</span>
                <span aria-hidden className="text-muted/60">
                  /
                </span>
                <span className="truncate text-ink">{meta.title}</span>
              </p>

              {/* Page header */}
              <div className="mt-6 flex flex-col gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                  {meta.sectionLabel}
                </p>
                <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                  {meta.title}
                </h1>
                <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted">
                  {meta.description}
                </p>
              </div>

              <div className="mt-10">
                <DocsBodyView slug={slug} />
              </div>

              {/* Prev / next from registry order */}
              <nav aria-label="More docs" className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/docs/${prev.slug}`}
                    className="rounded-lg border border-line bg-bg-panel p-4 transition-colors hover:border-line-soft"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Previous</p>
                    <p className="mt-1 text-sm font-medium text-ink">{prev.title}</p>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    href={`/docs/${next.slug}`}
                    className="rounded-lg border border-line bg-bg-panel p-4 text-right transition-colors hover:border-line-soft"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Next</p>
                    <p className="mt-1 text-sm font-medium text-ink">{next.title}</p>
                  </Link>
                ) : null}
              </nav>
            </Container>
          </div>

          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-10 pl-6 xl:block">
            <DocsPageToc headings={headings} />
          </aside>
        </div>

        <Footer />
      </main>
    </CodeLangProvider>
  );
}
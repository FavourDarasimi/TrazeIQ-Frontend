import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/features/landing/components/footer";
import { Logo } from "@/features/landing/components/navbar";
import { Container } from "@/components/ui/shared";
import { ROUTES } from "@/constants";
import { CodeLangProvider } from "./docs-code-context";
import { DocsPageSearch } from "./docs-page-search";
import { DocsPageToc } from "./docs-page-toc";
import { getDocGroups, getHeadings, getPrevNext, getSearchIndex } from "../lib/docs";

/**
 * Focused per-page docs shell. Sidebar is server-rendered from MDX
 * frontmatter (`getDocGroups`) — no hardcoded nav config. Code blocks get
 * the global tab-sync provider so language choice persists across pages.
 */
export function DocShell({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const groups = getDocGroups();
  const { prev, next } = getPrevNext(slug);
  const headings = getHeadings(slug);
  const searchIndex = getSearchIndex();

  return (
    <CodeLangProvider>
      <main className="bg-bg">
        <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
          <Container className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo href="/" />
              <Link href="/docs" className="hidden font-mono text-xs text-muted hover:text-ink sm:inline">
                / docs
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <DocsPageSearch entries={searchIndex} />
              <Link
                href={ROUTES.login}
                className="hidden rounded-sm text-sm text-muted transition-colors hover:text-ink sm:inline"
              >
                Sign in
              </Link>
              <Link
                href={ROUTES.dashboard}
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-[#5b52ea]"
              >
                Dashboard
              </Link>
            </div>
          </Container>
        </header>

        <div className="mx-auto flex w-full max-w-[1500px] items-start">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto py-6 pr-4 lg:block">
            <nav aria-label="Docs sections" className="flex flex-col gap-6">
              {groups.map((group) => (
                <div key={group.section} className="flex flex-col gap-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {group.section}
                  </p>
                  <ul className="flex flex-col gap-0.5 border-l border-line">
                    {group.items.map((item) => {
                      const isActive = item.slugString === slug;
                      return (
                        <li key={item.slugString}>
                          <Link
                            href={`/docs/${item.slugString}`}
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
                        {group.section}
                      </p>
                      {group.items.map((item) => (
                        <Link
                          key={item.slugString}
                          href={`/docs/${item.slugString}`}
                          className={`text-sm ${
                            item.slugString === slug ? "text-accent" : "text-muted"
                          }`}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </details>

              {children}

              {/* Prev / next from frontmatter order */}
              <nav aria-label="More docs" className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/docs/${prev.slugString}`}
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
                    href={`/docs/${next.slugString}`}
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

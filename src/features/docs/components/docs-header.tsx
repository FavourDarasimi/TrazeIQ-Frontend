import Link from "next/link";

import { Logo } from "@/features/landing/components/navbar";
import { Container } from "@/components/ui/shared";
import { ROUTES } from "@/constants";

import { DocsPageSearch } from "./docs-page-search";
import type { SearchEntry } from "../lib/docs";

/** Sticky docs header shared by the docs home and every doc page. */
export function DocsHeader({ entries }: { entries: SearchEntry[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo href="/" />
          <Link
            href="/docs"
            className="hidden font-mono text-xs text-muted hover:text-ink sm:inline"
          >
            / docs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <DocsPageSearch entries={entries} />
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
  );
}

/** "← Dashboard" escape chip — the docs site's way back into the app. */
export function DocsDashboardChip() {
  return (
    <Link
      href={ROUTES.dashboard}
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-line bg-bg-panel px-3.5 py-2 font-mono text-xs text-muted transition-colors hover:border-line-soft hover:text-ink"
    >
      <span aria-hidden>←</span> Dashboard
    </Link>
  );
}

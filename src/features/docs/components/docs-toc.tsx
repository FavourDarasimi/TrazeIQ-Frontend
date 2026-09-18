"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

import { allNavItems, docsGroups } from "./docs-nav-data";

function scrollToTop() {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
}

export function DocsToc({ activeId }: { activeId: string }) {
  // Show context around active item: its group + neighbors
  const activeItem = allNavItems.find((i) => i.id === activeId);
  const activeGroup = activeItem
    ? docsGroups.find((g) => g.id === activeItem.groupId)
    : docsGroups[0];

  return (
    <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[200px] shrink-0 xl:flex xl:flex-col">
      <div className="flex flex-col gap-6 overflow-y-auto py-6 pl-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-ink">On This Page</p>
          <ul className="flex flex-col gap-0.5">
            {(activeGroup?.items ?? []).map((it) => {
              const isActive = it.id === activeId;
              return (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-md px-2 py-1 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "bg-accent/10 font-medium text-ink"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    {it.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-5">
          <p className="text-sm font-semibold text-ink">Questions?</p>
          <Link
            href="/#faq"
            className="rounded-md px-2 py-1 text-sm text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            FAQ
          </Link>
        </div>

        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-bg-panel px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          Scroll To Top
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            size={15}
            color="currentColor"
            strokeWidth={1.8}
          />
        </button>
      </div>
    </div>
  );
}

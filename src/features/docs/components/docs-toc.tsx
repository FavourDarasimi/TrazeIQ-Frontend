"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";

import { allNavItems } from "./docs-nav-data";

function scrollToTop() {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
}

export function DocsToc({ activeId }: { activeId: string }) {
  // The rail mirrors the reference layout: the current section's own
  // sub-headings — not a second copy of the sidebar.
  const activeItem = allNavItems.find((i) => i.id === activeId);
  const subs = activeItem?.subs ?? [];

  return (
    <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[200px] shrink-0 xl:flex xl:flex-col">
      <div className="flex flex-col gap-6 overflow-y-auto py-6 pl-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-ink">On This Page</p>
          {subs.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {subs.map((sub) => (
                <li key={sub.id}>
                  <a
                    href={`#${sub.id}`}
                    className="block rounded-md px-2 py-1 text-sm leading-snug text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {sub.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 text-sm text-muted">
              {activeItem?.label ?? "Overview"}
            </p>
          )}
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

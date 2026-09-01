"use client";

import { allNavItems, docsGroups } from "./docs-nav-data";

export function DocsToc({ activeId }: { activeId: string }) {
  // Show context around active item: its group + neighbors
  const activeItem = allNavItems.find((i) => i.id === activeId);
  const activeGroup = activeItem
    ? docsGroups.find((g) => g.id === activeItem.groupId)
    : docsGroups[0];

  return (
    <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[200px] shrink-0 xl:flex xl:flex-col">
      <div className="flex flex-col gap-4 overflow-y-auto border-l border-line px-4 py-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          On this page
        </p>

        {/* Active group expanded */}
        {activeGroup ? (
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {activeGroup.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {activeGroup.items.map((it) => {
                const isActive = it.id === activeId;
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`block rounded-md px-2 py-1 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        isActive
                          ? "bg-accent/10 text-ink"
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
        ) : null}

        {/* All groups collapsed list */}
        <div className="border-t border-line pt-4">
          <ul className="flex flex-col gap-1">
            {allNavItems.map((it) => {
              const isActive = it.id === activeId;
              if (isActive) return null; // already shown above
              return (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    className="block rounded-md px-2 py-1 text-xs text-muted/70 transition-colors hover:bg-surface hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted/60">
                      {it.group}
                    </span>{" "}
                    <span className="text-muted">{it.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

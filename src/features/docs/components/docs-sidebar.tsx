"use client";

import { useEffect, useRef } from "react";
import { docsGroups } from "./docs-nav-data";

export function DocsSidebar({
  activeId,
  onNavigate,
  variant = "desktop",
}: {
  activeId: string;
  onNavigate?: (id: string) => void;
  variant?: "desktop" | "drawer";
}) {
  const navRef = useRef<HTMLElement>(null);

  // Keep active item visible within scroll container
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(
      `[data-nav-id="${CSS.escape(activeId)}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const inner = (
    <nav
      ref={navRef}
      aria-label="Docs sections"
      className={
        variant === "drawer"
          ? "flex flex-col gap-6 overflow-y-auto px-5 py-6"
          : "flex flex-col gap-6 overflow-y-auto py-6 pr-4"
      }
    >
      {docsGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5 border-l border-line">
            {group.items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    data-nav-id={item.id}
                    aria-current={isActive ? "true" : undefined}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(item.id);
                      }
                    }}
                    className={`-ml-px block border-l py-1.5 pl-3 pr-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-transparent text-muted hover:border-line-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  if (variant === "drawer") return inner;

  return (
    <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[240px] shrink-0 flex-col lg:flex">
      <div className="flex-1 overflow-hidden border-r border-line">{inner}</div>
    </div>
  );
}

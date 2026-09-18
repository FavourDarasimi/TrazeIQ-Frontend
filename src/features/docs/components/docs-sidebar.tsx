"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Keep the active group expanded as scroll-spy moves.
  const activeGroupId =
    docsGroups.find((g) => g.items.some((it) => it.id === activeId))?.id ??
    docsGroups[0]?.id;
  const expanded = (groupId: string) =>
    openGroups[groupId] ?? groupId === activeGroupId;

  // Keep active item visible within scroll container
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(
      `[data-nav-id="${CSS.escape(activeId)}"]`
    );
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const toggle = (groupId: string) =>
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !(prev[groupId] ?? groupId === activeGroupId),
    }));

  const inner = (
    <nav
      ref={navRef}
      aria-label="Docs sections"
      className={
        variant === "drawer"
          ? "flex flex-col gap-2.5 overflow-y-auto px-5 py-6"
          : "flex flex-col gap-2.5 overflow-y-auto py-6 pr-4"
      }
    >
      {docsGroups.map((group) => {
        const isOpen = expanded(group.id);
        const holdsActive = group.items.some((it) => it.id === activeId);
        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-xl border border-line bg-bg-panel"
          >
            <button
              type="button"
              onClick={() => toggle(group.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span
                className={`text-sm font-medium ${
                  holdsActive ? "text-ink" : "text-muted"
                }`}
              >
                {group.label}
              </span>
              <HugeiconsIcon
                icon={ChevronDownIcon}
                size={16}
                color="currentColor"
                strokeWidth={1.8}
                className={`shrink-0 text-muted transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen ? (
              <ul className="flex flex-col gap-1 px-2.5 pb-3">
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
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                          isActive
                            ? "bg-accent/15 font-medium text-ink"
                            : "text-muted hover:bg-surface hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );

  if (variant === "drawer") return inner;

  return (
    <div className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[264px] shrink-0 flex-col lg:flex">
      <div className="flex-1 overflow-hidden">{inner}</div>
    </div>
  );
}

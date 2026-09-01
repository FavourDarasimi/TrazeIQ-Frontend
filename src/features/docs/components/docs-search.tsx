"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { allNavItems } from "./docs-nav-data";

export function DocsSearch({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allNavItems.slice(0, 12);
    return allNavItems
      .filter(
        (it) =>
          it.label.toLowerCase().includes(q) ||
          it.group.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query]);

  const [activeIdx, setActiveIdx] = useState(0);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setActiveIdx(0), [query, open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Close on Escape at capture so drawer/msg doesn't trap
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[18vh]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Panel */}
      <div className="relative flex w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-line bg-bg-panel shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <HugeiconsIcon icon={Search01Icon} size={16} color="currentColor" className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                onOpenChange(false);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const item = filtered[activeIdx];
                if (item) {
                  onOpenChange(false);
                  onNavigate(item.id);
                }
              }
            }}
            placeholder="Search docs…  e.g. webhook, rotate-key, Pusher"
            className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <span className="hidden items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-1 font-mono text-[10px] text-muted sm:flex">
            <HugeiconsIcon icon={CommandIcon} size={10} color="currentColor" />K
          </span>
        </div>

        <ul className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">
              No results for “{query}”.
            </li>
          ) : (
            filtered.map((it, idx) => {
              const isActive = idx === activeIdx;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => {
                      onOpenChange(false);
                      onNavigate(it.id);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "bg-surface text-ink"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{it.label}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted/70">
                        {it.group} · #{it.id}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-muted">↗</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-line bg-bg px-3 py-2 font-mono text-[11px] text-muted">
          <span>↑↓ Navigate · Enter jump · Esc close</span>
          <span className="hidden sm:inline">Ctrl / ⌘ K to open</span>
        </div>
      </div>
    </div>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden items-center gap-2 rounded-full border border-line bg-bg-panel px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex"
      aria-label="Search docs (Ctrl+K)"
    >
      <HugeiconsIcon icon={Search01Icon} size={14} color="currentColor" />
      <span>Search</span>
      <span className="ml-2 hidden items-center gap-1 rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted lg:flex">
        <HugeiconsIcon icon={CommandIcon} size={10} color="currentColor" />K
      </span>
    </button>
  );
}

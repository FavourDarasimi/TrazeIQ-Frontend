"use client";

import { useEffect, useState } from "react";
import type { DocHeading } from "../lib/docs";

/** Sticky "On this page" TOC with scroll-spy, generated from MDX headings. */
export function DocsPageToc({ headings }: { headings: DocHeading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        On this page
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-line">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveId(h.id)}
                className={`-ml-px block border-l py-1 pr-2 text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  h.depth === 3 ? "pl-6" : "pl-3"
                } ${
                  isActive
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:border-line-soft hover:text-ink"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

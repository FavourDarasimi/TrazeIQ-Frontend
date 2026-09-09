"use client";

import type { ReactNode } from "react";

/** <Steps><Step title="...">rich content</Step></Steps> — numbered, connecting line. */
export function Steps({ children }: { children: ReactNode }) {
  return <ol className="relative flex flex-col gap-6 border-l border-line pl-6">{children}</ol>;
}

export function Step({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-accent/50 bg-bg"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <p className="text-sm font-medium text-ink">{title}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-ink">
        {children}
      </div>
    </li>
  );
}

// Alias for MDX ergonomics: <CodeGroup> === DocsCode with global tab sync.
export { DocsCode as CodeGroup } from "./docs-code";

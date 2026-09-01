"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

export function HeadingAnchor({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback: update hash
      window.history.pushState(null, "", `#${id}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return;
    }
    // also push hash for shareable URL without reload
    window.history.pushState(null, "", `#${id}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      aria-label={`Copy link to ${label}`}
      className="group inline-flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-muted opacity-0 transition-all hover:border-line hover:bg-surface hover:text-ink focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover:opacity-100 group-focus-within:opacity-100"
    >
      <HugeiconsIcon
        icon={copied ? Tick01Icon : Link01Icon}
        size={14}
        color="currentColor"
        strokeWidth={1.5}
        className={copied ? "text-ok" : ""}
      />
    </button>
  );
}

export function SubHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="group flex scroll-mt-28 items-center gap-2 text-sm font-semibold tracking-tight text-ink"
    >
      <span className="underline decoration-transparent underline-offset-4 group-hover:decoration-line-soft">
        {children}
      </span>
      <HeadingAnchor id={id} label={String(children)} />
    </h3>
  );
}

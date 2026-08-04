"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

import { Window } from "@/components/ui/shared";

export function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Window
      title={title}
      bodyClassName="p-4"
      right={
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line-soft hover:text-ink"
        >
          <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={14} color="currentColor" strokeWidth={1.5} />
          {copied ? "Copied" : "Copy"}
        </button>
      }
    >
      <pre className="overflow-x-auto whitespace-pre font-mono text-[12.5px] leading-relaxed text-ink">{code}</pre>
    </Window>
  );
}
"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

export function DocsCode({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span className="font-mono text-xs text-muted">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <HugeiconsIcon
            icon={copied ? Tick01Icon : Copy01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
          />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-[12.5px] leading-relaxed text-ink">
        {code}
      </pre>
    </div>
  );
}
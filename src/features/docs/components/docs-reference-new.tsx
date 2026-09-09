"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { Code } from "./docs-shared";

export type Param = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
};

/** Monospace field names, type + required pill, description. */
export function ParamTable({ params }: { params: Param[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-bg-panel">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {["Name", "Type", "Required", "Description"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-line align-top last:border-b-0">
              <td className="px-4 py-3">
                <Code>{p.name}</Code>
              </td>
              <td className="px-4 py-3 font-mono text-[12px] text-muted">{p.type}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[11px] ${
                    p.required ? "border-ok/40 text-ok" : "border-line text-muted"
                  }`}
                >
                  {p.required ? "Required" : "Optional"}
                </span>
              </td>
              <td className="px-4 py-3 text-ink/90">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Collapsible JSON response viewer with copy. */
export function ResponseExample({
  title = "Example response",
  status = "201 Created",
  json,
}: {
  title?: string;
  status?: string;
  json: string;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-panel">
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 font-mono text-xs text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
        >
          <HugeiconsIcon
            icon={open ? ArrowUp01Icon : ArrowDown01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
          />
          {title}
        </button>
        <span className="rounded-md border border-ok/40 px-2 py-0.5 font-mono text-[11px] text-ok">
          {status}
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy response JSON"
          className="ml-auto flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
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
      {open ? (
        <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-[12.5px] leading-relaxed text-ink">
          {json}
        </pre>
      ) : null}
    </div>
  );
}

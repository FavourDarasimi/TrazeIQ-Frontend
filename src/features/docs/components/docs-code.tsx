"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { useCodeLang } from "./docs-code-context";

export type DocsCodeTab = { lang: string; label: string; code: string };

export function DocsCode({
  label,
  code,
  tabs,
  defaultLang,
}: {
  label: string;
  code?: string;
  tabs?: DocsCodeTab[];
  defaultLang?: string;
}) {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;
  const resolvedTabs: DocsCodeTab[] = hasTabs
    ? tabs!
    : [{ lang: "curl", label, code: code ?? "" }];
  // Global sync: if this block offers the globally selected lang, follow it.
  const { lang: globalLang, setLang: setGlobalLang } = useCodeLang();
  const offersGlobal = resolvedTabs.some((t) => t.lang === globalLang);
  const initial = defaultLang ?? resolvedTabs[0]?.lang ?? "curl";
  const [local, setLocal] = useState(initial);
  const active = offersGlobal ? globalLang : local;
  const setActive = (l: string) => {
    setLocal(l);
    if (resolvedTabs.some((t) => t.lang === l)) setGlobalLang(l);
  };
  const [copied, setCopied] = useState(false);

  const activeTab =
    resolvedTabs.find((t) => t.lang === active) ?? resolvedTabs[0];
  const activeCode = activeTab?.code ?? "";

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(activeCode);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {!hasTabs ? (
            <span className="font-mono text-xs text-muted">{label}</span>
          ) : (
            <div
              role="tablist"
              aria-label={label}
              className="flex items-center gap-1 rounded-md bg-surface p-1"
            >
              {resolvedTabs.map((tab) => {
                const isActive = tab.lang === active;
                return (
                  <button
                    key={tab.lang}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActive(tab.lang)}
                    className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "bg-ink text-bg"
                        : "text-muted hover:bg-bg-panel hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
          {hasTabs ? (
            <span className="hidden font-mono text-xs text-muted sm:inline">
              — {label}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
        {activeCode}
      </pre>
    </div>
  );
}

// Backwards compat helper: if you only have one snippet, keep using DocsCode as before.

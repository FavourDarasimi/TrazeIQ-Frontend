"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { useCodeLang } from "./docs-code-context";

export type HighlightedTab = {
  lang: string;
  label: string;
  /** Shiki-rendered <pre> HTML (github-dark). */
  html: string;
  /** Raw source for copy-to-clipboard. */
  code: string;
};

/**
 * Client tab switcher for Shiki-highlighted snippets. Language choice is
 * global (CodeLangContext): switching one block's tab switches every
 * CodeGroup on the page that offers that language.
 */
export function CodeTabSwitcher({
  label,
  tabs,
}: {
  label: string;
  tabs: HighlightedTab[];
}) {
  const { lang: globalLang, setLang: setGlobalLang } = useCodeLang();
  const offersGlobal = tabs.some((t) => t.lang === globalLang);
  const [local, setLocal] = useState(tabs[0]?.lang ?? "curl");
  const active = offersGlobal ? globalLang : local;
  const activeTab = tabs.find((t) => t.lang === active) ?? tabs[0];
  const [copied, setCopied] = useState(false);

  function select(lang: string) {
    setLocal(lang);
    if (tabs.some((t) => t.lang === lang)) setGlobalLang(lang);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(activeTab?.code ?? "");
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!activeTab) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div role="tablist" aria-label={label} className="flex items-center gap-1 rounded-md bg-surface p-1">
            {tabs.map((tab, i) => {
              const isActive = tab.lang === active;
              return (
                <button
                  key={`${tab.lang}-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => select(tab.lang)}
                  className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isActive ? "bg-ink text-bg" : "text-muted hover:bg-bg-panel hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span className="hidden truncate font-mono text-xs text-muted sm:inline">— {label}</span>
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
      {/* Shiki HTML carries its own theme colors; keep wrapper chrome minimal. */}
      <div
        className="[&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[12.5px] [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: activeTab.html }}
      />
    </div>
  );
}

"use client";

// Hallmark · genre: modern-minimal · design-system: /Design.md · tokenized search with autocomplete

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FilterHorizontalIcon,
  Search01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";

export type ParsedToken = {
  raw: string;
  key?: string;
  value: string;
  negated: boolean;
};

export function parseSearchTokens(query: string): ParsedToken[] {
  if (!query.trim()) return [];
  const regex = /(-|!)?(?:([\w.-]+):)?(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  const tokens: ParsedToken[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(query)) !== null) {
    const raw = match[0];
    const negated = Boolean(match[1]);
    const key = match[2]?.toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    tokens.push({ raw, key, value, negated });
  }
  return tokens;
}

type Suggestion = {
  token: string;
  label: string;
  description: string;
  category: "status" | "severity" | "env" | "metadata" | "common";
};

const SUGGESTIONS: Suggestion[] = [
  {
    token: "is:open",
    label: "is:open",
    description: "Open incidents awaiting resolution",
    category: "status",
  },
  {
    token: "is:resolved",
    label: "is:resolved",
    description: "Resolved incidents",
    category: "status",
  },
  {
    token: "is:investigating",
    label: "is:investigating",
    description: "Incidents currently under investigation",
    category: "status",
  },
  {
    token: "is:ignored",
    label: "is:ignored",
    description: "Silenced or ignored incidents",
    category: "status",
  },
  {
    token: "severity:critical",
    label: "severity:critical",
    description: "Critical severity errors",
    category: "severity",
  },
  {
    token: "severity:high",
    label: "severity:high",
    description: "High severity errors",
    category: "severity",
  },
  {
    token: "severity:medium",
    label: "severity:medium",
    description: "Medium severity errors",
    category: "severity",
  },
  {
    token: "severity:low",
    label: "severity:low",
    description: "Low severity errors",
    category: "severity",
  },
  {
    token: "env:production",
    label: "env:production",
    description: "Production environment occurrences",
    category: "env",
  },
  {
    token: "env:staging",
    label: "env:staging",
    description: "Staging environment occurrences",
    category: "env",
  },
  {
    token: "user:",
    label: "user:<id>",
    description: "Filter by impacted user ID",
    category: "common",
  },
  {
    token: "service:",
    label: "service:<name>",
    description: "Filter by microservice name",
    category: "common",
  },
  {
    token: "metadata.browser:Chrome",
    label: "metadata.browser:<name>",
    description: "Search inside metadata.browser",
    category: "metadata",
  },
  {
    token: "metadata.os:Mac",
    label: "metadata.os:<os>",
    description: "Search inside metadata.os",
    category: "metadata",
  },
  {
    token: "metadata.release:",
    label: "metadata.release:<version>",
    description: "Search by release or version tag",
    category: "metadata",
  },
];

interface TokenizedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function TokenizedSearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Filter syntax: is:open severity:critical env:production user:123 metadata.browser:Chrome...",
  className = "",
}: TokenizedSearchBarProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Find the word currently under the cursor from state
  const currentWord = useMemo(() => {
    const pos = cursorPos ?? value.length;
    let start = pos;
    while (start > 0 && value[start - 1] !== " ") {
      start--;
    }
    let end = pos;
    while (end < value.length && value[end] !== " ") {
      end++;
    }
    return {
      word: value.slice(start, end),
      start,
      end,
    };
  }, [value, cursorPos]);

  // Compute suggestions based on the current word being typed
  const filteredSuggestions = useMemo(() => {
    const query = currentWord.word.toLowerCase().trim();

    if (!query) {
      return SUGGESTIONS.slice(0, 8);
    }

    if (query.startsWith("is:")) {
      const sub = query.slice(3);
      return SUGGESTIONS.filter(
        (s) => s.category === "status" && s.token.includes(sub),
      );
    }

    if (query.startsWith("sev:") || query.startsWith("severity:")) {
      const sub = query.startsWith("sev:") ? query.slice(4) : query.slice(9);
      return SUGGESTIONS.filter(
        (s) => s.category === "severity" && s.token.includes(sub),
      );
    }

    if (query.startsWith("env:") || query.startsWith("environment:")) {
      const sub = query.startsWith("env:") ? query.slice(4) : query.slice(12);
      return SUGGESTIONS.filter(
        (s) => s.category === "env" && s.token.includes(sub),
      );
    }

    if (query.startsWith("meta.") || query.startsWith("metadata.")) {
      return SUGGESTIONS.filter((s) => s.category === "metadata");
    }

    // General matching
    const matches = SUGGESTIONS.filter(
      (s) =>
        s.token.toLowerCase().includes(query) ||
        s.label.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query),
    );

    return matches.length > 0 ? matches : SUGGESTIONS.slice(0, 5);
  }, [currentWord.word]);

  // Handle clicking outside to dismiss autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: pressing "/" focuses the filter bar unless already typing
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      const { start, end } = currentWord;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const insert = suggestion.token.endsWith(":")
        ? suggestion.token
        : `${suggestion.token} `;
      const nextValue = `${before}${insert}${after}`.replace(/\s{2,}/g, " ");

      onChange(nextValue);
      setOpen(false);

      // Restore focus and position cursor after inserted token
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const nextPos = (before + insert).length;
          inputRef.current.setSelectionRange(nextPos, nextPos);
          setCursorPos(nextPos);
        }
      });
    },
    [currentWord, onChange, value],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filteredSuggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit?.();
      } else if (e.key === "ArrowDown") {
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        );
        break;
      case "Enter":
      case "Tab":
        if (filteredSuggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  // Extract structured key:value tokens to render as interactive pills
  const parsedTokens = useMemo(() => {
    return parseSearchTokens(value).filter((t) => t.key !== undefined);
  }, [value]);

  const removeToken = (tokenToRemove: ParsedToken) => {
    const regex = new RegExp(`(^|\\s)${escapeRegExp(tokenToRemove.raw)}(?=\\s|$)`, "g");
    const nextVal = value.replace(regex, " ").trim();
    onChange(nextVal);
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-2 ${className}`}>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
        </span>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={value}
          onChange={(e) => {
            setCursorPos(e.target.selectionStart);
            onChange(e.target.value);
            setOpen(true);
            setSelectedIndex(0);
          }}
          onClick={(e) => {
            setCursorPos((e.target as HTMLInputElement).selectionStart);
          }}
          onKeyUp={(e) => {
            setCursorPos((e.target as HTMLInputElement).selectionStart);
          }}
          onFocus={(e) => {
            setCursorPos(e.target.selectionStart);
            setOpen(true);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-9 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
        />

        {value.trim() !== "" ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setCursorPos(0);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg-panel hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={14}
              color="currentColor"
              strokeWidth={1.5}
            />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block rounded border border-line bg-bg-panel px-1.5 py-0.5 font-mono text-[10px] text-muted">
            /
          </kbd>
        )}
      </div>

      {/* Interactive Token Pills */}
      {parsedTokens.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-muted text-[11px] font-sans">Tokens:</span>
          {parsedTokens.map((t, idx) => (
            <span
              key={`${t.raw}-${idx}`}
              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] ${
                t.negated
                  ? "border-sev-critical/30 bg-sev-critical/10 text-sev-critical"
                  : "border-line bg-surface text-ink"
              }`}
            >
              <HugeiconsIcon
                icon={t.key?.startsWith("metadata.") ? Tag01Icon : FilterHorizontalIcon}
                size={11}
                strokeWidth={1.5}
              />
              <span>
                {t.negated ? "-" : ""}
                <span className="text-muted">{t.key}:</span>
                <span className="font-medium text-ink/90">{t.value}</span>
              </span>
              <button
                type="button"
                onClick={() => removeToken(t)}
                title={`Remove ${t.raw}`}
                aria-label={`Remove filter ${t.raw}`}
                className="ml-0.5 text-muted hover:text-ink"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={11} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {/* Autocomplete Dropdown */}
      {open && filteredSuggestions.length > 0 ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-10 z-40 max-h-72 overflow-y-auto rounded-lg border border-line bg-surface p-1.5 shadow-2xl backdrop-blur-md"
        >
          <div className="mb-1 flex items-center justify-between px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted border-b border-line/40">
            <span>Filter suggestions (Use ↑↓ and Enter/Tab)</span>
            <span>Syntax: key:value</span>
          </div>
          {filteredSuggestions.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.token}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => selectSuggestion(item)}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-bg-panel text-ink font-medium"
                    : "text-muted hover:bg-bg-panel/60 hover:text-ink"
                }`}
              >
                <span className="flex items-center gap-2 font-mono text-[12px] text-accent">
                  <span className="rounded bg-line/80 px-1 py-0.5 text-[10px] font-sans text-muted">
                    {item.category}
                  </span>
                  {item.label}
                </span>
                <span className="text-[11px] text-muted truncate max-w-[240px]">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

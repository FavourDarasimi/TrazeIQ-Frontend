"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { ROUTES, incidentDetailUrl } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { listIncidents } from "@/services/incidents";
import type { Incident } from "@/types";
import { highlightIncidentMatch } from "@/features/incidents/components/incident-highlight";

const DEBOUNCE_MS = 300;
const PREVIEW_COUNT = 5;

/**
 * Command Center search (Design.md §5 header: Logo · Search · Profile).
 * Debounced live preview of the top incident matches; Enter or "View all"
 * navigates to the full results on `/incidents?search=`.
 */
export function GlobalIncidentSearch() {
  const { status: authStatus } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Incident[] | null>(null);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(query.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (authStatus !== "authenticated" || debounced === "" || !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale preview results
      setResults(null);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    listIncidents({ search: debounced }, controller.signal)
      .then(({ incidents: rows }) => {
        setResults(rows.slice(0, PREVIEW_COUNT));
        setSearching(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResults([]);
        setSearching(false);
      });
    return () => controller.abort();
  }, [authStatus, debounced, open]);

  // Global "/" shortcut focuses the search, like a command center should.
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

  function goToResults() {
    const term = query.trim();
    setOpen(false);
    inputRef.current?.blur();
    router.push(
      term === ""
        ? ROUTES.incidents
        : `${ROUTES.incidents}?search=${encodeURIComponent(term)}`,
    );
  }

  const showDropdown = open && debounced !== "";

  return (
    <div className="relative hidden min-w-0 flex-1 justify-center sm:flex">
      {open ? (
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default"
        />
      ) : null}
      <div className="relative w-full max-w-md">
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
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") goToResults();
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search incidents…  ( / )"
          aria-label="Search incidents"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="global-incident-search-results"
          className="h-9 w-full rounded-full border border-line bg-surface pl-9 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/60 focus:ring-1 focus:ring-accent/40 [&::-webkit-search-cancel-button]:hidden"
        />
        {showDropdown ? (
          <div
            id="global-incident-search-results"
            role="listbox"
            className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
          >
            {searching ? (
              <p className="px-4 py-6 text-center font-mono text-xs text-muted">
                searching…
              </p>
            ) : results !== null && results.length > 0 ? (
              <>
                <ul className="max-h-72 overflow-y-auto py-1">
                  {results.map((incident) => (
                    <li key={incident.id}>
                      <Link
                        href={incidentDetailUrl(incident.id)}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-bg-panel focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                      >
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full bg-accent"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">
                          {highlightIncidentMatch(
                            incident.error_group.title,
                            debounced,
                          )}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted">
                          {incident.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={goToResults}
                  className="flex w-full items-center justify-center border-t border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-bg-panel hover:text-ink"
                >
                  View all results
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <p className="text-sm text-muted">
                  No incidents match &ldquo;{debounced}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={goToResults}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:text-ink"
                >
                  View all incidents
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

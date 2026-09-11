"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Layers02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api";
import { listPlatformProjects } from "@/services/platform";
import type { PlatformPageMeta, PlatformProject } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 25;

export function AdminProjects() {
  const [projects, setProjects] = useState<PlatformProject[]>([]);
  const [pagination, setPagination] = useState<PlatformPageMeta | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    listPlatformProjects({
      search: debouncedSearch || undefined,
      page,
      page_size: PAGE_SIZE,
      signal: controller.signal,
    })
      .then(({ projects, pagination }) => {
        setProjects(projects);
        setPagination(pagination);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load projects.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedSearch, page]);

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          Projects{pagination ? ` · ${pagination.total}` : ""}
        </h3>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search projects by name</span>
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLoading(true);
            }}
            placeholder="Search by name…"
            className="h-9 w-full rounded-lg border border-line bg-bg pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-sev-critical">{error}</p>
      ) : loading && projects.length === 0 ? (
        <Spinner label="Loading projects…" />
      ) : projects.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Layers02Icon}
            title="No projects found"
            body={debouncedSearch ? `Nothing matches "${debouncedSearch}".` : "No projects exist yet."}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  <th className="py-2 pr-4 font-medium">Project</th>
                  <th className="py-2 pr-4 font-medium">Key prefix</th>
                  <th className="py-2 pr-4 font-medium">Events · 24h</th>
                  <th className="py-2 pr-4 font-medium">Open</th>
                  <th className="py-2 pr-4 font-medium">Cap/min</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {projects.map((project) => (
                  <tr key={project.id} className="align-top">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-ink">{project.name}</p>
                      <p className="font-mono text-[11px] text-muted">
                        {project.organization} · {project.environment}
                      </p>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">
                      {project.api_key_prefix}…
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">{project.events_24h}</td>
                    <td className="py-2.5 pr-4">
                      {project.open_incidents > 0 ? (
                        <span className="rounded-full border border-sev-critical/30 bg-sev-critical/10 px-2 py-0.5 font-mono text-[11px] text-sev-critical">
                          {project.open_incidents} open
                        </span>
                      ) : (
                        <span className="font-mono text-[12px] text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">
                      {project.events_per_minute}
                    </td>
                    <td className="whitespace-nowrap py-2.5 font-mono text-[12px] text-muted">
                      {formatDateTime(project.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 ? (
            <div className="mt-4 flex items-center justify-between">
              <p className="font-mono text-[11px] text-muted">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!pagination.has_previous}
                  onClick={() => {
                    setLoading(true);
                    setPage((p) => p - 1);
                  }}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={!pagination.has_next}
                  onClick={() => {
                    setLoading(true);
                    setPage((p) => p + 1);
                  }}
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </GlassCard>
  );
}

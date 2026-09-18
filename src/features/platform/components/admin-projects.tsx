"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listPlatformProjects } from "@/services/platform";
import type { PlatformPageMeta, PlatformProject } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatDateTime } from "@/utils/format";

import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPagination,
  AdminPill,
  AdminSearchInput,
  AdminTableCard,
  AdminTh,
} from "@/features/platform/components/admin-ui";

const PAGE_SIZE = 25;

function initials(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminProjects() {
  const [projects, setProjects] = useState<PlatformProject[]>([]);
  const [pagination, setPagination] = useState<PlatformPageMeta | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const c = new AbortController();
    listPlatformProjects({
      search: debounced || undefined,
      page,
      page_size: PAGE_SIZE,
      signal: c.signal,
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
    return () => c.abort();
  }, [debounced, page]);

  if (error) return <AdminError message={error} />;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Projects</h1>
        <p className="mt-1 text-sm text-muted">Monitored services and their ingest load.</p>
      </div>

      <AdminTableCard
        title="Projects"
        count={pagination?.total ?? null}
        minWidth={780}
        search={
          <AdminSearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setLoading(true);
            }}
            placeholder="Search by name…"
            label="Search projects by name"
          />
        }
        head={
          <>
            <AdminTh>Project</AdminTh>
            <AdminTh>Key</AdminTh>
            <AdminTh right>Events · 24h</AdminTh>
            <AdminTh>Incidents</AdminTh>
            <AdminTh right>Cap/min</AdminTh>
            <AdminTh>Created</AdminTh>
          </>
        }
      >
        {loading && projects.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-0">
              <AdminLoading label="Loading projects…" />
            </td>
          </tr>
        ) : projects.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-0">
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">No projects found</p>
                <p className="mt-1 text-sm text-muted">
                  {debounced ? `Nothing matches "${debounced}".` : "No projects exist yet."}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          projects.map((p) => (
            <tr key={p.id} className="hover:bg-white/[0.02]">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-xs font-medium text-ink">
                    {initials(p.name) || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-muted">
                      {p.organization} · {p.environment}
                    </p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted">
                {p.api_key_prefix}
                <span className="text-muted/50">…</span>
              </td>
              <td className="px-5 py-3 text-right text-xs tabular-nums text-ink">{p.events_24h}</td>
              <td className="px-5 py-3">
                {p.open_incidents > 0 ? (
                  <AdminPill tone="red" dot="red">
                    {p.open_incidents} open
                  </AdminPill>
                ) : (
                  <AdminPill tone="green" dot="green">
                    clear
                  </AdminPill>
                )}
              </td>
              <td className="px-5 py-3 text-right text-xs tabular-nums text-muted">{p.events_per_minute}</td>
              <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDateTime(p.created_at)}</td>
            </tr>
          ))
        )}
      </AdminTableCard>

      {pagination && pagination.pages > 1 ? (
        <AdminCard>
          <AdminPagination
            pagination={pagination}
            onPage={(p) => {
              setLoading(true);
              setPage(p);
            }}
          />
        </AdminCard>
      ) : null}
    </div>
  );
}

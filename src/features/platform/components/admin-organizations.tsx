"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Building02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api";
import { listPlatformOrganizations } from "@/services/platform";
import type { PlatformOrganization, PlatformPageMeta } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 25;

export function AdminOrganizations() {
  const [orgs, setOrgs] = useState<PlatformOrganization[]>([]);
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
    listPlatformOrganizations({
      search: debouncedSearch || undefined,
      page,
      page_size: PAGE_SIZE,
      signal: controller.signal,
    })
      .then(({ organizations, pagination }) => {
        setOrgs(organizations);
        setPagination(pagination);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load organizations.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedSearch, page]);

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
          Organizations{pagination ? ` · ${pagination.total}` : ""}
        </h3>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search organizations by name</span>
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
      ) : loading && orgs.length === 0 ? (
        <Spinner label="Loading organizations…" />
      ) : orgs.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Building02Icon}
            title="No organizations found"
            body={debouncedSearch ? `Nothing matches "${debouncedSearch}".` : "No tenants exist yet."}
          />
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Owner</th>
                  <th className="py-2 pr-4 font-medium">Members</th>
                  <th className="py-2 pr-4 font-medium">Projects</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orgs.map((org) => (
                  <tr key={org.id} className="align-top">
                    <td className="py-2.5 pr-4 font-medium text-ink">{org.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">{org.owner_email}</td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">{org.member_count}</td>
                    <td className="py-2.5 pr-4 font-mono text-[12px] text-muted">{org.project_count}</td>
                    <td className="whitespace-nowrap py-2.5 font-mono text-[12px] text-muted">
                      {formatDateTime(org.created_at)}
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

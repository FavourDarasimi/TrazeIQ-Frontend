"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listPlatformOrganizations } from "@/services/platform";
import type { PlatformOrganization, PlatformPageMeta } from "@/types";
import { apiErrorMessage } from "@/utils/errors";
import { formatDateTime } from "@/utils/format";

import {
  AdminCard,
  AdminError,
  AdminLoading,
  AdminPagination,
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

export function AdminOrganizations() {
  const [orgs, setOrgs] = useState<PlatformOrganization[]>([]);
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
    listPlatformOrganizations({
      search: debounced || undefined,
      page,
      page_size: PAGE_SIZE,
      signal: c.signal,
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
    return () => c.abort();
  }, [debounced, page]);

  if (error) return <AdminError message={error} />;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Organizations</h1>
        <p className="mt-1 text-sm text-muted">Tenants and their owners.</p>
      </div>

      <AdminTableCard
        title="Tenants"
        count={pagination?.total ?? null}
        search={
          <AdminSearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setLoading(true);
            }}
            placeholder="Search by name…"
            label="Search organizations by name"
          />
        }
        head={
          <>
            <AdminTh>Tenant</AdminTh>
            <AdminTh>Owner</AdminTh>
            <AdminTh right>Members</AdminTh>
            <AdminTh right>Projects</AdminTh>
            <AdminTh>Created</AdminTh>
          </>
        }
      >
        {loading && orgs.length === 0 ? (
          <tr>
            <td colSpan={5} className="p-0">
              <AdminLoading label="Loading organizations…" />
            </td>
          </tr>
        ) : orgs.length === 0 ? (
          <tr>
            <td colSpan={5} className="p-0">
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">No organizations found</p>
                <p className="mt-1 text-sm text-muted">
                  {debounced ? `Nothing matches "${debounced}".` : "No tenants exist yet."}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          orgs.map((org) => (
            <tr key={org.id} className="hover:bg-white/[0.02]">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-xs font-medium text-ink">
                    {initials(org.name) || "?"}
                  </span>
                  <p className="truncate text-sm font-medium text-ink">{org.name}</p>
                </div>
              </td>
              <td className="max-w-[220px] truncate px-5 py-3 text-xs text-muted">{org.owner_email}</td>
              <td className="px-5 py-3 text-right text-xs tabular-nums text-ink">{org.member_count}</td>
              <td className="px-5 py-3 text-right text-xs tabular-nums text-ink">{org.project_count}</td>
              <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDateTime(org.created_at)}</td>
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

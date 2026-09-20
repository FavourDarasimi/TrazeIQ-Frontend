"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import { listPlatformUsers } from "@/services/platform";
import type { PlatformPageMeta, PlatformUser } from "@/types";
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

function initials(name: string, email: string): string {
  const s = (name.trim() || email).trim();
  return s
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminUsers() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
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
    listPlatformUsers({
      search: debounced || undefined,
      page,
      page_size: PAGE_SIZE,
      signal: c.signal,
    })
      .then(({ users, pagination }) => {
        setUsers(users);
        setPagination(pagination);
        setError(null);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? apiErrorMessage(err) : "Couldn't load users.");
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [debounced, page]);

  if (error) return <AdminError message={error} />;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Users</h1>
        <p className="mt-1 text-sm text-muted">Accounts and access across the platform.</p>
      </div>

      <AdminTableCard
        title="Directory"
        count={pagination?.total ?? null}
        search={
          <AdminSearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setLoading(true);
            }}
            placeholder="Search by email or username…"
            label="Search users by email or username"
          />
        }
        head={
          <>
            <AdminTh>Account</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Access</AdminTh>
            <AdminTh right>Orgs</AdminTh>
            <AdminTh>Provider</AdminTh>
            <AdminTh>Joined</AdminTh>
          </>
        }
      >
        {loading && users.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-0">
              <AdminLoading label="Loading users…" />
            </td>
          </tr>
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-0">
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">No users found</p>
                <p className="mt-1 text-sm text-muted">
                  {debounced ? `Nothing matches "${debounced}".` : "No accounts exist yet."}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          users.map((u) => (
            <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-xs font-medium text-muted">
                    {initials(u.name, u.email) || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{u.email}</p>
                    <p className="truncate text-xs text-muted">
                      @{u.username || u.name || "—"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <AdminPill tone={u.is_active ? "green" : "neutral"} dot={u.is_active ? "green" : "gray"}>
                    {u.is_active ? "active" : "inactive"}
                  </AdminPill>
                  {!u.email_verified ? <AdminPill tone="amber">unverified</AdminPill> : null}
                </div>
              </td>
              <td className="px-5 py-3">
                {u.is_staff ? <AdminPill tone="indigo">staff</AdminPill> : <span className="text-xs text-muted">—</span>}
              </td>
              <td className="px-5 py-3 text-right text-xs tabular-nums text-muted">{u.org_count}</td>
              <td className="px-5 py-3 text-xs capitalize text-muted">{u.auth_provider}</td>
              <td className="whitespace-nowrap px-5 py-3 text-xs text-muted">{formatDateTime(u.date_joined)}</td>
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

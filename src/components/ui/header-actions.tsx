"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellIcon,
  ChevronDownIcon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { ROUTES } from "@/constants";
import { SeverityBadge } from "@/components/ui/incident-badges";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchUnreadCount,
  listNotifications,
  markNotificationsRead,
} from "@/services/notifications";
import type { AppNotification } from "@/types";
import { formatRelativeTime } from "@/utils/format";

const POLL_INTERVAL_MS = 45_000;

function BellDropdown() {
  const { status: authStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Poll the unread counter so the badge stays live while the page is open.
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    fetchUnreadCount()
      .then((count) => {
        if (!cancelled) setUnread(count.unread_count);
      })
      .catch(() => undefined);
    const interval = window.setInterval(() => {
      fetchUnreadCount()
        .then((count) => setUnread(count.unread_count))
        .catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [authStatus]);

  const refresh = useCallback(() => {
    if (authStatus !== "authenticated") return;
    fetchUnreadCount()
      .then((count) => setUnread(count.unread_count))
      .catch(() => undefined);
    listNotifications(20)
      .then((inbox) => setNotifications(inbox.notifications))
      .catch(() => undefined);
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (!open) return;
    refresh();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authStatus, open, refresh]);

  async function handleOpenNotification(notification: AppNotification) {
    setOpen(false);
    if (!notification.is_read) {
      setBusy(true);
      try {
        await markNotificationsRead([notification.id]);
        setNotifications((rows) =>
          rows.map((row) =>
            row.id === notification.id
              ? { ...row, is_read: true, read_at: new Date().toISOString() }
              : row,
          ),
        );
        setUnread((value) => Math.max(0, value - 1));
      } catch {
        // Best-effort — the row stays unread until the next refresh.
      } finally {
        setBusy(false);
      }
    }
    if (notification.incident) {
      router.push(`${ROUTES.incidents}/${notification.incident.id}`);
    }
  }

  async function handleMarkAllRead() {
    if (unread === 0 || busy) return;
    setBusy(true);
    try {
      const result = await markNotificationsRead();
      setUnread(0);
      setNotifications((rows) =>
        rows.map((row) =>
          row.is_read ? row : { ...row, is_read: true, read_at: null },
        ),
      );
      void result;
    } catch {
      // Best-effort.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      {open ? (
        <button
          type="button"
          aria-label="Close notifications"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default"
        />
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <HugeiconsIcon icon={BellIcon} size={20} color="currentColor" strokeWidth={1.5} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-medium text-ink">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              notifications
            </p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={busy}
                className="font-mono text-[11px] text-accent transition-colors hover:text-ink disabled:opacity-50"
              >
                mark all read
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No notifications yet.
            </p>
          ) : (
            <ul className="max-h-[22rem] overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleOpenNotification(notification)}
                    className={`flex w-full flex-col gap-1 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-bg-panel ${
                      notification.is_read ? "opacity-60" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {!notification.is_read ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-line-soft" />
                      )}
                      <span className="truncate text-sm font-medium tracking-tight text-ink">
                        {notification.title}
                      </span>
                      {notification.incident ? (
                        <SeverityBadge
                          severity={notification.incident.severity}
                        />
                      ) : null}
                    </span>
                    {notification.body ? (
                      <span className="truncate pl-3.5 text-xs text-muted">
                        {notification.body}
                      </span>
                    ) : null}
                    <span className="pl-3.5 font-mono text-[11px] text-muted">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function UserDropdown() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleLogout() {
    await signOut();
    router.replace(ROUTES.login);
  }

  const initials = user?.name?.slice(0, 2) || user?.email?.slice(0, 2) || "?";

  return (
    <div className="relative">
      {open ? (
        <button
          type="button"
          aria-label="Close user menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-default"
        />
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs uppercase text-muted">
          {initials}
        </span>
        <span className="hidden max-w-40 truncate text-sm text-ink xl:block">
          {user?.name || user?.email}
        </span>
        <HugeiconsIcon icon={ChevronDownIcon} size={14} color="currentColor" strokeWidth={1.5} className="text-muted" />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium tracking-tight text-ink">
              {user?.name || user?.email}
            </p>
            <p className="truncate font-mono text-[11px] text-muted">
              {user?.email}
            </p>
          </div>
          <Link
            href={ROUTES.settings}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-bg-panel hover:text-ink"
          >
            <HugeiconsIcon icon={Settings01Icon} size={16} color="currentColor" strokeWidth={1.5} />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-muted transition-colors hover:bg-bg-panel hover:text-sev-critical"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <BellDropdown />
      <UserDropdown />
    </div>
  );
}

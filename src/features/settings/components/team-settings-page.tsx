"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Copy01Icon,
  MailSend01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard, Spinner } from "@/components/ui/glass-card";
import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { inviteAcceptUrl } from "@/constants";
import { useProjectContext } from "@/features/app/components/project-context";
import { useAuth } from "@/providers/auth-provider";
import { inviteMember, listMembers } from "@/services/organizations";
import type {
  MembershipRole,
  OrganizationMembership,
} from "@/types";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";
import { formatRelativeTime } from "@/utils/format";

const INVITABLE_ROLES: Array<{ value: MembershipRole; label: string }> = [
  { value: "admin", label: "Admin" },
  { value: "developer", label: "Developer" },
  { value: "viewer", label: "Viewer" },
];

const ROLE_STYLES: Record<MembershipRole, string> = {
  owner: "border-accent/30 bg-accent/10 text-accent",
  admin: "border-sev-warning/30 bg-sev-warning/10 text-sev-warning",
  developer: "border-sev-low/30 bg-sev-low/10 text-sev-low",
  viewer: "border-line bg-surface text-muted",
};

function RoleBadge({ role }: { role: MembershipRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}

function MemberRow({
  member,
  isYou,
}: {
  member: OrganizationMembership;
  isYou: boolean;
}) {
  return (
    <li className="flex flex-col gap-2 px-5 py-4 transition-colors duration-150 hover:bg-bg-panel sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg-panel font-mono text-xs uppercase text-muted">
          {member.user.slice(0, 2)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-[15px] font-medium tracking-tight text-ink">
            <span className="truncate">{member.user}</span>
            {isYou ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                you
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            joined {formatRelativeTime(member.created_at)}
          </p>
        </div>
      </div>
      <RoleBadge role={member.role} />
    </li>
  );
}

export function TeamSettingsPage() {
  const { selectedProject } = useProjectContext();
  const { user } = useAuth();

  const organizationId = selectedProject?.organization ?? null;

  const [members, setMembers] = useState<OrganizationMembership[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MembershipRole>("viewer");
  const [busy, setBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loading = organizationId !== null && members === null && error === null;

  useEffect(() => {
    if (organizationId === null) return;
    const controller = new AbortController();
    listMembers(organizationId, controller.signal)
      .then(({ members: rows }) => {
        setError(null);
        setMembers(rows);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(apiErrorMessage(err));
      });
    return () => controller.abort();
  }, [organizationId, attempt]);

  const myRole = useMemo<MembershipRole | null>(() => {
    if (!user || !members) return null;
    return members.find((member) => member.user === user.email)?.role ?? null;
  }, [user, members]);

  const canInvite = myRole === "owner" || myRole === "admin";

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    if (organizationId === null) return;
    setBusy(true);
    setInviteError(null);
    setInviteLink(null);
    setCopied(false);
    try {
      const result = await inviteMember(organizationId, email, role);
      setInviteLink(
        `${window.location.origin}${inviteAcceptUrl(result.invite_token)}`,
      );
      setEmail("");
      setAttempt((value) => value + 1);
    } catch (err) {
      setInviteError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields?.email) setInviteError(fields.email[0]);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the link is still visible to copy manually.
    }
  }

  if (organizationId === null) {
    return (
      <div className="flex flex-col gap-6">
        <TeamHeader />
        <EmptyState
          icon={UserGroupIcon}
          title="No project selected"
          body="Team settings are scoped to the organization that owns the currently selected project. Select or create a project to manage its team."
          action={
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
            >
              Create a project
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TeamHeader />

      {error ? (
        <div className="flex flex-col items-start gap-3">
          <InlineError>{error}</InlineError>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMembers(null);
              setAttempt((value) => value + 1);
            }}
            className="h-9 rounded-lg border border-line bg-surface px-4 text-sm text-ink transition-colors hover:border-line-soft hover:bg-bg-panel"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? <Spinner label="loading team" /> : null}

      {!loading && !error && members ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                team roster
              </p>
              <span className="font-mono text-[11px] text-muted">
                {members.length} member{members.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul>
              {members.map((member) => (
                <MemberRow
                  key={member.user_id}
                  member={member}
                  isYou={user?.email === member.user}
                />
              ))}
            </ul>
          </GlassCard>

          <div className="flex flex-col gap-4">
            {canInvite ? (
              <GlassCard className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                  invite a teammate
                </p>
                <form onSubmit={handleInvite} className="mt-5 flex flex-col gap-4" noValidate>
                  {inviteError ? <InlineError>{inviteError}</InlineError> : null}
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="off"
                    placeholder="teammate@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={undefined}
                  />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                      Role
                    </span>
                    <select
                      value={role}
                      onChange={(event) =>
                        setRole(event.target.value as MembershipRole)
                      }
                      className="h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40"
                    >
                      {INVITABLE_ROLES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SubmitButton loading={busy} loadingLabel="Sending invite…">
                    <span className="inline-flex items-center gap-2">
                      <HugeiconsIcon icon={MailSend01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                      Send invite
                    </span>
                  </SubmitButton>
                </form>

                {inviteLink ? (
                  <div className="mt-5 flex flex-col gap-2.5 rounded-lg border border-ok/30 bg-ok/10 px-3.5 py-3">
                    <p className="flex items-center gap-2 text-sm text-ink">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                      Invite sent — share this link:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-bg-panel px-2.5 py-1.5 font-mono text-xs text-muted">
                        {inviteLink}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy invite link"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-ink"
                      >
                        <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} size={15} color="currentColor" strokeWidth={1.5} />
                      </button>
                    </div>
                    <p className="text-xs text-muted">
                      They&apos;ll appear in the roster once they sign in and accept.
                    </p>
                  </div>
                ) : null}
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                  invite a teammate
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Only owners and admins can invite new members. Your current
                  role is{" "}
                  <span className="font-medium text-ink">{myRole ?? "member"}</span>.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TeamHeader() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        <span className="text-accent">{"//"}</span> settings
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Team
      </h1>
    </div>
  );
}

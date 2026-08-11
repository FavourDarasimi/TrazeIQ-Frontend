"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

import { AuthShell } from "@/components/ui/auth-shell";
import { InlineError, SubmitButton } from "@/components/ui/form";
import { ROUTES, inviteAcceptUrl } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { acceptInvite } from "@/services/organizations";
import type { MembershipRole, Organization } from "@/types";
import { apiErrorMessage } from "@/utils/errors";

type Outcome = {
  organization: Organization;
  role: MembershipRole;
};

export function InviteAcceptPage({ token }: { token: string }) {
  const { status, user } = useAuth();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<Outcome | null>(null);

  const loginUrl = `${ROUTES.login}?next=${encodeURIComponent(
    inviteAcceptUrl(token),
  )}`;

  async function handleAccept(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await acceptInvite(token);
      setAccepted(result.membership);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      footer={
        <span>
          Got the invite by email?{" "}
          <Link href={loginUrl} className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline">
            Sign in
          </Link>{" "}
          with the address it was sent to.
        </span>
      }
    >
      {status === "unauthenticated" ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">You&apos;ve been invited</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to accept this invite — it&apos;s tied to the email address it was sent to.
          </p>
          <Link
            href={loginUrl}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
          >
            Sign in to accept
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={1.5} />
          </Link>
        </div>
      ) : accepted ? (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-ok/30 bg-ok/10 text-ok">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} color="currentColor" strokeWidth={1.5} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">
            You&apos;re in — {accepted.organization.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Welcome aboard as{" "}
            <span className="font-medium text-ink">{accepted.role}</span>.
            Your team workspace is ready.
          </p>
          <button
            type="button"
            onClick={() => router.replace(ROUTES.dashboard)}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea]"
          >
            Open dashboard
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="currentColor" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
            <HugeiconsIcon icon={UserGroupIcon} size={24} color="currentColor" strokeWidth={1.5} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">You&apos;ve been invited</h1>
          <p className="mt-1 text-sm text-muted">
            {user ? (
              <>
                Accepting as{" "}
                <span className="font-medium text-ink">{user.email}</span>.
                The invite must match this address.
              </>
            ) : (
              "A teammate invited you to their TrazeIQ workspace."
            )}
          </p>

          <form onSubmit={handleAccept} className="mt-6 flex flex-col gap-4" noValidate>
            {error ? <InlineError>{error}</InlineError> : null}
            <SubmitButton loading={busy} loadingLabel="Accepting…">
              Accept invite
            </SubmitButton>
          </form>
        </div>
      )}
    </AuthShell>
  );
}

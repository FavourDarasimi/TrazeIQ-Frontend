"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { requestPasswordReset } from "@/services/auth";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";

export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await requestPasswordReset(email.trim());
      // The endpoint always returns 200 (no account enumeration), so any
      // success here means "check your inbox" — never "unknown address".
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          If an account exists for{" "}
          <span className="text-ink">{email.trim()}</span>, a 6-digit reset
          code is on its way. It expires in 10 minutes.
        </p>
        <Link
          href={`${ROUTES.resetPassword}?email=${encodeURIComponent(email.trim())}`}
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Enter reset code
        </Link>
        <p className="mt-4 text-center text-sm text-muted">
          <button
            type="button"
            onClick={() => setSent(false)}
            className="underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            Use a different email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-muted">
        We&apos;ll email you a 6-digit code to verify it&apos;s you.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {error ? <InlineError>{error}</InlineError> : null}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email?.[0]}
        />

        <SubmitButton loading={busy} loadingLabel="Sending code…">
          Send reset code
        </SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href={ROUTES.login}
          className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

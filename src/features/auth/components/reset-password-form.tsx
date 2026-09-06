"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { OtpInput } from "@/features/auth/components/otp-input";
import { resetPassword } from "@/services/auth";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";

export function ResetPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirm_password: ["Passwords do not match."] });
      return;
    }
    setBusy(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Password updated
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your new password is active — the old one stopped working
          immediately. Sign in with the new one.
        </p>
        <Link
          href={`${ROUTES.login}?email=${encodeURIComponent(email.trim())}`}
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        Choose a new password
      </h1>
      <p className="mt-1 text-sm text-muted">
        Enter the 6-digit code from your email, then pick a new password.
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

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">Reset code</span>
          <OtpInput value={otp} onChange={setOtp} disabled={busy} />
          {fieldErrors.otp?.[0] ? (
            <span className="text-[11px] text-sev-critical">
              {fieldErrors.otp[0]}
            </span>
          ) : null}
        </div>

        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={fieldErrors.new_password?.[0]}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirm_password?.[0]}
        />

        <SubmitButton loading={busy} loadingLabel="Updating…">
          Update password
        </SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Code expired?{" "}
        <Link
          href={`${ROUTES.forgotPassword}?email=${encodeURIComponent(email.trim())}`}
          className="text-ink underline-offset-2 transition-colors hover:text-accent hover:underline"
        >
          Send a new one
        </Link>
      </p>
    </div>
  );
}

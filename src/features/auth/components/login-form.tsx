"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { needsOnboarding } from "@/services/workspace";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";

import { GoogleSignInButton } from "./google-sign-in-button";

export function LoginForm({
  initialEmail = "",
  next,
}: {
  initialEmail?: string;
  next?: string;
}) {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await signIn(email, password);
      router.replace(
        (await needsOnboarding()) ? ROUTES.onboarding : next ?? ROUTES.dashboard,
      );
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to your workspace.</p>

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
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password?.[0]}
        />

        <SubmitButton loading={busy} loadingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-4">
        <GoogleSignInButton email={email} />
      </div>

      <p className="mt-4 text-center text-sm text-muted">
        <Link
          href={
            email.trim()
              ? `${ROUTES.forgotPassword}?email=${encodeURIComponent(email.trim())}`
              : ROUTES.forgotPassword
          }
          className="underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </div>
  );
}
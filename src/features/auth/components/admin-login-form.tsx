"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { useAuth } from "@/providers/auth-provider";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";

export function AdminLoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
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
      const session = await signIn(email, password);
      if (session.user.is_staff) {
        router.replace(ROUTES.admin);
      } else {
        setError("This account does not have staff access.");
      }
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
      <h1 className="text-xl font-semibold tracking-tight text-ink">Staff login</h1>
      <p className="mt-1 text-sm text-muted">Sign in to the platform admin panel.</p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        {error ? <InlineError>{error}</InlineError> : null}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="admin@trazeiq.com"
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

      <p className="mt-4 text-center text-sm text-muted">
        <Link
          href={ROUTES.login}
          className="underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          Sign in to your workspace instead
        </Link>
      </p>
    </div>
  );
}

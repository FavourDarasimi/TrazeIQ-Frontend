"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { InlineError, SubmitButton, TextField } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import {
  completeRegistration,
  login,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "@/services/auth";
import { apiErrorMessage, apiFieldErrors } from "@/utils/errors";

import { OtpInput } from "@/features/auth/components/otp-input";

type Step = "email" | "otp" | "password";

const STEPS: { key: Step; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "otp", label: "Code" },
  { key: "password", label: "Password" },
];

export function RegisterFlow() {
  const { applySession } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [flippedToLogin, setFlippedToLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function resetToEmail() {
    setStep("email");
    setOtp("");
    setRegistrationToken(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await requestRegistrationOtp(email);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
        setFlippedToLogin(true);
        setError("An account with this email already exists. Sign in to continue.");
      } else {
        setError(apiErrorMessage(err));
        const fields = apiFieldErrors(err);
        if (fields) setFieldErrors(fields);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (otp.length !== 6) {
      setFieldErrors({ otp: ["Enter the 6-digit code."] });
      return;
    }
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const data = await verifyRegistrationOtp(email, otp);
      setRegistrationToken(data.registration_token);
      setStep("password");
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (!registrationToken) {
      resetToEmail();
      return;
    }
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const session = await completeRegistration({
        registration_token: registrationToken,
        password,
        confirm_password: confirmPassword,
      });
      applySession(session);
      router.replace(ROUTES.onboarding);
    } catch (err) {
      if (err instanceof ApiError) {
        if (
          err.code === "REGISTRATION_TOKEN_INVALID" ||
          err.code === "REGISTRATION_TOKEN_EXPIRED"
        ) {
          resetToEmail();
          setError(
            "This signup session has expired. Enter your email to start again."
          );
          return;
        }
        if (err.code === "EMAIL_TAKEN") {
          setFlippedToLogin(true);
          setError("An account was already created for this email. Sign in to continue.");
          return;
        }
      }
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  async function submitFlippedLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const session = await login(email, loginPassword);
      applySession(session);
      router.replace(ROUTES.dashboard);
    } catch (err) {
      setError(apiErrorMessage(err));
      const fields = apiFieldErrors(err);
      if (fields) setFieldErrors(fields);
    } finally {
      setBusy(false);
    }
  }

  function useDifferentEmail() {
    setFlippedToLogin(false);
    setEmail("");
    setLoginPassword("");
    setError(null);
    setStep("email");
  }

  const currentIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        {flippedToLogin ? "Sign in" : "Start monitoring in minutes"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {flippedToLogin
          ? `An account for ${email} already exists.`
          : "Prove your email first — your account is created in the last step."}
      </p>

      {!flippedToLogin ? (
        <div className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
          {STEPS.map((s, index) => (
            <div key={s.key} className="flex items-center gap-2">
              {index > 0 ? <span className="text-line-soft">/</span> : null}
              <span
                className={
                  index < currentIndex
                    ? "text-ok"
                    : index === currentIndex
                      ? "text-ink"
                      : "text-muted"
                }
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {flippedToLogin ? (
          <form onSubmit={submitFlippedLogin} className="flex flex-col gap-4" noValidate>
            {error ? <InlineError>{error}</InlineError> : null}

            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              disabled
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              error={fieldErrors.password?.[0]}
            />

            <SubmitButton loading={busy} loadingLabel="Signing in…">
              Sign in
            </SubmitButton>

            <button
              type="button"
              onClick={useDifferentEmail}
              className="text-center text-xs text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
            >
              Use a different email
            </button>
          </form>
        ) : (
          <form onSubmit={step === "email" ? submitEmail : step === "otp" ? submitOtp : submitPassword} className="flex flex-col gap-4" noValidate>
            {error ? <InlineError>{error}</InlineError> : null}

            {step === "email" ? (
              <>
                <TextField
                  label="Work email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={fieldErrors.email?.[0]}
                />
                <SubmitButton loading={busy} loadingLabel="Sending code…">
                  Send verification code
                </SubmitButton>
              </>
            ) : null}

            {step === "otp" ? (
              <>
                <OtpInput value={otp} onChange={setOtp} disabled={busy} />
                {fieldErrors.otp?.[0] ? (
                  <p className="text-xs text-sev-critical">{fieldErrors.otp[0]}</p>
                ) : null}
                <SubmitButton loading={busy} loadingLabel="Verifying…">
                  Verify email
                </SubmitButton>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep("email");
                    }}
                    className="text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep("email");
                    }}
                    className="text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                  >
                    Didn&apos;t get the code? Request a new one
                  </button>
                </div>
              </>
            ) : null}

            {step === "password" ? (
              <>
                <TextField
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  error={fieldErrors.password?.[0]}
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={fieldErrors.confirm_password?.[0]}
                />
                <SubmitButton loading={busy} loadingLabel="Creating account…">
                  Create account
                </SubmitButton>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("otp");
                  }}
                  className="text-center text-xs text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
                >
                  Back to the code
                </button>
              </>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
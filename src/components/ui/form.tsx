"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, className = "", ...props }: TextFieldProps) {
  const isPassword = props.type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={isPassword && visible ? "text" : props.type ?? "text"}
          className={`h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-sev-critical/60" : ""} ${className}`}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
          >
            <HugeiconsIcon icon={visible ? EyeOffIcon : EyeIcon} size={18} color="currentColor" strokeWidth={1.5} />
          </button>
        ) : null}
      </div>
      {error ? (
        <span className="mt-1.5 block text-xs text-sev-critical">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function SubmitButton({ children, loading = false, loadingLabel = "Working…", className = "", ...props }: SubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      disabled={loading || props.disabled}
      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-ink shadow-[0_0_24px_rgba(79,70,229,0.35)] transition-colors hover:bg-[#5b52ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/40 border-t-ink" aria-hidden />
      ) : null}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function InlineError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-sev-critical/30 bg-sev-critical/10 px-3 py-2.5 text-sm text-sev-critical">
      <span className="mt-0.5 shrink-0">
        <HugeiconsIcon icon={Alert02Icon} size={16} color="currentColor" strokeWidth={1.5} />
      </span>
      <span>{children}</span>
    </div>
  );
}
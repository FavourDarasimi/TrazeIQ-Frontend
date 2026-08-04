import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-soft border-t-accent" />
      {label ? <span className="font-mono text-xs text-muted">{label}</span> : null}
    </div>
  );
}
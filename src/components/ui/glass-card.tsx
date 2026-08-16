import type { HTMLAttributes, ReactNode, Ref } from "react";

export function GlassCard({
  children,
  className = "",
  ref,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-line bg-surface shadow-xl ${className}`}
      {...rest}
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
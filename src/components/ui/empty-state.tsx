import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: typeof Alert01Icon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  const Icon = icon ?? Alert01Icon;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
        <HugeiconsIcon icon={Icon} size={24} color="currentColor" strokeWidth={1.5} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Idea01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

type Variant = "note" | "tip" | "warning";

const variantMap: Record<
  Variant,
  { border: string; icon: typeof InformationCircleIcon; iconColor: string; label: string }
> = {
  note: {
    border: "border-l-accent",
    icon: InformationCircleIcon,
    iconColor: "text-accent",
    label: "Note",
  },
  tip: {
    border: "border-l-ok",
    icon: Idea01Icon,
    iconColor: "text-ok",
    label: "Tip",
  },
  warning: {
    border: "border-l-sev-warning",
    icon: Alert02Icon,
    iconColor: "text-sev-warning",
    label: "Warning",
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const v = variantMap[variant];
  return (
    <div
      className={`rounded-lg border border-line bg-bg-panel ${v.border} border-l-2 pl-0`}
    >
      <div className={`border-l-2 ${v.border} rounded-lg px-4 py-3.5`}>
        <div className="flex items-start gap-2.5">
          <HugeiconsIcon
            icon={v.icon}
            size={16}
            color="currentColor"
            strokeWidth={1.6}
            className={`mt-0.5 shrink-0 ${v.iconColor}`}
          />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
              {title ?? v.label}
            </p>
            <div className="text-sm leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-soft [&_a]:underline-offset-2 hover:[&_a]:decoration-ink [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-ink">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

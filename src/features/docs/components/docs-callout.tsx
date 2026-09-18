"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Idea01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

type Variant = "note" | "info" | "tip" | "warning" | "danger";

const variantMap: Record<
  Variant,
  {
    card: string;
    icon: typeof InformationCircleIcon;
    iconColor: string;
    label: string;
  }
> = {
  note: {
    card: "border-accent/30 bg-accent/10",
    icon: InformationCircleIcon,
    iconColor: "text-accent",
    label: "Note",
  },
  info: {
    card: "border-accent/30 bg-accent/10",
    icon: InformationCircleIcon,
    iconColor: "text-accent",
    label: "Info",
  },
  tip: {
    card: "border-ok/30 bg-ok/10",
    icon: Idea01Icon,
    iconColor: "text-ok",
    label: "Tip",
  },
  warning: {
    card: "border-sev-warning/30 bg-sev-warning/10",
    icon: Alert02Icon,
    iconColor: "text-sev-warning",
    label: "Warning",
  },
  danger: {
    card: "border-sev-critical/30 bg-sev-critical/10",
    icon: Alert02Icon,
    iconColor: "text-sev-critical",
    label: "Danger",
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
    <div className={`rounded-2xl border p-5 ${v.card}`}>
      <div className="flex items-start gap-2.5">
        <HugeiconsIcon
          icon={v.icon}
          size={17}
          color="currentColor"
          strokeWidth={1.6}
          className={`mt-0.5 shrink-0 ${v.iconColor}`}
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-sm font-semibold text-ink">
            {title ?? v.label}
          </p>
          <div className="text-sm leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-soft [&_a]:underline-offset-2 hover:[&_a]:decoration-ink [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-ink">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

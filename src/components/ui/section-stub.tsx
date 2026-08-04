import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon } from "@hugeicons/core-free-icons";

import { GlassCard } from "@/components/ui/glass-card";

export function SectionStub({
  icon,
  title,
  body,
  note,
}: {
  icon: typeof Home01Icon;
  title: string;
  body: string;
  note?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <GlassCard className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-bg-panel text-muted">
          <HugeiconsIcon icon={icon} size={24} color="currentColor" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{body}</p>
        </div>
        {note ? (
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
            {note}
          </span>
        ) : null}
      </GlassCard>
    </div>
  );
}